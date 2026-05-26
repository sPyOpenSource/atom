import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Play, 
  Zap, 
  RefreshCw, 
  FileCode, 
  Trash2, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Info, 
  X, 
  Plus, 
  Download, 
  BookOpen,
  Terminal
} from "lucide-react";
import { VirtualFile } from "../types";

interface CircuitPythonConsoleProps {
  activeFile: VirtualFile | null;
  files: VirtualFile[];
  setFiles: React.Dispatch<React.SetStateAction<VirtualFile[]>>;
  setActiveFilePath: (path: string) => void;
}

export default function CircuitPythonConsole({ 
  activeFile, 
  files, 
  setFiles,
  setActiveFilePath 
}: CircuitPythonConsoleProps) {
  // Web Serial API states
  const [serialSupported, setSerialSupported] = useState<boolean>(false);
  const [serialConnected, setSerialConnected] = useState<boolean>(false);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [serialLogs, setSerialLogs] = useState<string[]>(["[System] CircuitPython Console initialized."]);
  const [replInput, setReplInput] = useState<string>("");
  const [connectionType, setConnectionType] = useState<"simulator" | "hardware">("simulator");

  // Web Serial Streams
  const readerRef = useRef<any>(null);
  const writerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(true);

  // Simulation states
  const [simActive, setSimActive] = useState<boolean>(false);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [boardColor, setBoardColor] = useState<string>("#1e293b"); // default slaty board
  const [neopixelColor, setNeopixelColor] = useState<string>("rgb(20, 20, 20)"); // unlit
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simButtonGP2, setSimButtonGP2] = useState<boolean>(true); // True means unpressed (Pull.UP)
  const [simSensorAnalog, setSimSensorAnalog] = useState<number>(342); // analog sensor bounds
  const [simLedGP13, setSimLedGP13] = useState<boolean>(false); // generic GP output LED
  const [simSpeed, setSimSpeed] = useState<number>(1); // simulation execution multiplier
  
  // Library manager tabs
  const [libSearchQuery, setLibSearchQuery] = useState<string>("");
  const [libraryMessage, setLibraryMessage] = useState<string | null>(null);

  // Available installable virtual packages
  const AVAILABLE_LIBRARIES = [
    { name: "adafruit_neopixel.py", desc: "Driver for WS2812/NeoPixel smart RGB LEDs.", size: "4.2 KB", version: "6.3.1" },
    { name: "adafruit_bme280.py", desc: "I2C/SPI temperature, humidity, pressure sensor driver.", size: "8.1 KB", version: "2.6.8" },
    { name: "adafruit_motor", desc: "Folder package for DC, stepper, and servo motor controllers.", size: "15.4 KB", version: "3.4.2", isFolder: true },
    { name: "adafruit_display_text", desc: "Dynamic font & graphics label rendering suite for displays.", size: "12.0 KB", version: "2.1.0", isFolder: true },
    { name: "adafruit_character_lcd.py", desc: "Standard character interface drive for LCD displays.", size: "5.5 KB", version: "1.2.4" }
  ];

  // Templates
  const CP_TEMPLATES = [
    {
      title: "NeoPixel Blink & Fade",
      desc: "Basic loop to cycle colors on on-board smart pixel",
      code: `import time
import board
import neopixel

# Set up standard on-board NeoPixel RGB LED
pixel = neopixel.NeoPixel(board.NEOPIXEL, 1, brightness=0.4)
print("--- Starting NeoPixel Color Cycle ---")

while True:
    print("State: RED")
    pixel.fill((255, 0, 0))
    time.sleep(1.0)
    
    print("State: GREEN")
    pixel.fill((0, 255, 0))
    time.sleep(1.0)
    
    print("State: BLUE")
    pixel.fill((0, 0, 255))
    time.sleep(1.0)
`
    },
    {
      title: "GPIO Button Interaction",
      desc: "Poll GP2 GPIO status to trigger pixel colors state change",
      code: `import time
import board
import neopixel
import digitalio

# Config RGB NeoPixel
pixel = neopixel.NeoPixel(board.NEOPIXEL, 1, brightness=0.5)

# Config tactile switch with Pull UP GP2 resistor
button = digitalio.DigitalInOut(board.GP2)
button.direction = digitalio.Direction.INPUT
button.pull = digitalio.Pull.UP

print("Setup completed. Click GP2 physical button to interact!")

while True:
    if not button.value:
        # Button pressed down (PULLED LOW)
        print("GPIO -> Button pressed!")
        pixel.fill((255, 128, 0)) # Vivid Orange
        time.sleep(0.1)
    else:
        # Defaults to dim pulse
        pixel.fill((20, 20, 20))
        time.sleep(0.05)
`
    },
    {
      title: "Analog Sensor Reader",
      desc: "Read analog values from GP26 and trigger warnings on threshold",
      code: `import time
import board
import analogio
import neopixel

# Config interactive sensor GP26
adc_sensor = analogio.AnalogIn(board.GP26)
pixel = neopixel.NeoPixel(board.NEOPIXEL, 1, brightness=0.6)

print("Sensor analyzer running. Adjust analog values on the board.")

while True:
    raw_val = adc_sensor.value # ranges 0 - 65535
    voltage = (raw_val * 3.3) / 65535
    print("Telemetry -> ADC Raw Value: " + str(raw_val) + ", Voltage: " + str(round(voltage, 2)) + "V")
    
    if raw_val > 40000:
        pixel.fill((255, 0, 0)) # Warning state red
    else:
        pixel.fill((0, 180, 255)) # Healthy azure
        
    time.sleep(0.8)
`
    }
  ];

  // Check Web Serial support
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serial" in navigator) {
      setSerialSupported(true);
    }
  }, []);

  // Web Serial implementation
  const connectHardwarePort = async () => {
    if (!serialSupported) return;
    try {
      setSerialLogs(prev => [...prev, "[Connection] Requesting serial port access..."]);
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      setSerialPort(port);
      setSerialConnected(true);
      setConnectionType("hardware");
      setSerialLogs(prev => [...prev, "[Connected] Port opened successfully at 115200 baud!"]);

      // Hook reader and writer
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      writerRef.current = port.writable.getWriter();
      
      // Send interactive break to activate standard Python REPL (Ctrl+C and Ctrl+A / Ctrl+B)
      await writerRef.current.write(encoder.encode("\r\n\x03\r\n")); // Ctrl+C to stop current main script
      setSerialLogs(prev => [...prev, "[REPL] Interrupt code sent. Connected directly to live Python REPL!"]);

      keepReadingRef.current = true;
      readSerialLoop(port, decoder);
    } catch (err: any) {
      console.error(err);
      setSerialLogs(prev => [...prev, `[Error] Connection rejected: ${err.message}`]);
    }
  };

  const readSerialLoop = async (port: any, decoder: TextDecoder) => {
    while (port.readable && keepReadingRef.current) {
      try {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        while (keepReadingRef.current) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            const rawText = decoder.decode(value);
            // Append line by line
            setSerialLogs(prev => {
              const last = prev[prev.length - 1];
              // simple text buffer combining lines
              if (last && !last.endsWith("\n") && !rawText.startsWith("\n")) {
                const updated = [...prev];
                updated[updated.length - 1] = last + rawText;
                return updated.slice(-100); // Max 100 entries
              } else {
                return [...prev, rawText].slice(-100);
              }
            });
          }
        }
      } catch (err: any) {
        console.error("Serial read loop error:", err);
        break;
      } finally {
        if (readerRef.current) {
          readerRef.current.releaseLock();
        }
      }
    }
  };

  const disconnectHardwarePort = async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      await readerRef.current.cancel();
    }
    if (writerRef.current) {
      await writerRef.current.releaseLock();
    }
    if (serialPort) {
      await serialPort.close();
    }
    setSerialPort(null);
    setSerialConnected(false);
    setConnectionType("simulator");
    setSerialLogs(prev => [...prev, "[Connection] Disconnected physical serial port context."]);
  };

  const handleSendRepl = async () => {
    if (!replInput.trim()) return;
    
    if (connectionType === "hardware" && writerRef.current) {
      try {
        const encoder = new TextEncoder();
        await writerRef.current.write(encoder.encode(replInput + "\r\n"));
        setReplInput("");
      } catch (err: any) {
        setSerialLogs(prev => [...prev, `[Write Error] Failed: ${err.message}`]);
      }
    } else {
      // Simulator REPL fallback logic
      const enteredBytes = replInput.trim();
      setSerialLogs(prev => [...prev, `>>> ${enteredBytes}`]);
      setReplInput("");

      // Interpret basic expressions
      if (enteredBytes.startsWith("print(")) {
        const inner = enteredBytes.replace(/print\(["']?|["']?\)/g, "");
        setTimeout(() => {
          setSerialLogs(prev => [...prev, inner]);
        }, 100);
      } else if (enteredBytes.includes("pixel.fill")) {
        // Try color read
        const match = enteredBytes.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          const [_, r, g, b] = match;
          setNeopixelColor(`rgb(${r}, ${g}, ${b})`);
          setTimeout(() => {
            setSerialLogs(prev => [...prev, `[Simulator] NeoPixel hardware updated to RGB(${r}, ${g}, ${b})`]);
          }, 150);
        } else {
          setSerialLogs(prev => [...prev, "SyntaxError: Color tuple expected, e.g. (255, 0, 0)"]);
        }
      } else if (enteredBytes === "help()") {
        setTimeout(() => {
          setSerialLogs(prev => [
            ...prev,
            "Welcome to CircuitPython Simulator help!",
            "Available pins in simulation mode: board.NEOPIXEL, board.GP2 (Button), board.GP26 (Analog Sensor)",
            "Try calling: pixel.fill((255, 0, 127))",
            "Try print('Simulate high speed serial')"
          ]);
        }, 200);
      } else {
        setTimeout(() => {
          setSerialLogs(prev => [...prev, `[Simulator] Statement executed successfully.`]);
        }, 150);
      }
    }
  };

  // Virtual Script Interpreter Core
  // Parses basic python code structure line by line
  const runSimulatedScript = () => {
    if (!activeFile) return;
    setSimActive(true);
    setSimLoading(false);
    setSimLogs([`[Simulator Startup] Mounting virtual hardware drive...`, `[Simulator Status] Running code.py...`]);
    setNeopixelColor("rgb(0,0,0)");
    setSimLedGP13(false);

    const script = activeFile.content;
    const lines = script.split("\n");
    let currentLineIdx = 0;
    
    // Store variables
    const vars: Record<string, any> = {
      button_pull_up: true
    };

    // Parse loop intervals
    const simInterval = setInterval(() => {
      if (currentLineIdx >= lines.length) {
        // Simple wrap loop or finalize
        setSimLogs(prev => [...prev, "[Simulator Terminal] File execution completed (reached end of file)."]);
        clearInterval(simInterval);
        setSimActive(false);
        return;
      }

      const line = lines[currentLineIdx].trim();
      currentLineIdx++;

      if (!line || line.startsWith("#")) {
        return; // skip comments
      }

      // 1. Check imports
      if (line.startsWith("import ")) {
        const modules = line.replace("import ", "").split(",").map(m => m.trim());
        setSimLogs(prev => [...prev, `Importing module(s): ${modules.join(", ")}`]);
      }

      // 2. Check variables / board pin setups
      if (line.includes("AnalogIn(")) {
        setSimLogs(prev => [...prev, "[Virtual Hardware] Attached GP26 Analog Input ADC converter."]);
      }
      if (line.includes("DigitalInOut(")) {
        const match = line.match(/(board\.\w+)/);
        if (match) {
          setSimLogs(prev => [...prev, `[Virtual Hardware] Assigned Digital Input GPIO: ${match[0]}`]);
        }
      }

      // 3. Simulated outputs (print statements)
      if (line.startsWith("print(")) {
        const paramStr = line.substring(6, line.length - 1);
        let output = paramStr.replace(/['"]/g, "");
        // If it references stringified vars, replace them with realistic values
        if (output.includes("str(raw_val)")) output = output.replace("str(raw_val)", simSensorAnalog.toString());
        if (output.includes("voltage") || output.includes("str(round(voltage")) {
          const tempVolt = ((simSensorAnalog * 3.3) / 65535).toFixed(2);
          output = output.replace("str(round(voltage, 2))", tempVolt).replace("voltage", tempVolt);
        }
        setSimLogs(prev => [...prev, output]);
      }

      // 4. Set NeoPixel RGB colors
      if (line.includes("pixel.fill(")) {
        const colorMatch = line.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (colorMatch) {
          const [_, r, g, b] = colorMatch;
          setNeopixelColor(`rgb(${r}, ${g}, ${b})`);
        }
      }

      // 5. LED bleeping GP13
      if (line.includes("led.value = True") || line.includes("gp13.value = True")) {
        setSimLedGP13(true);
      }
      if (line.includes("led.value = False") || line.includes("gp13.value = False")) {
        setSimLedGP13(false);
      }

    }, 280 / simSpeed);

    (window as any).active_cp_sim_interval = simInterval;
  };

  const stopSimulatedScript = () => {
    if ((window as any).active_cp_sim_interval) {
      clearInterval((window as any).active_cp_sim_interval);
    }
    setSimActive(false);
    setSimLogs(prev => [...prev, "[Simulator Suspended] Virtual script halted manually."]);
  };

  // Keep simulated analog changes hooked to logger
  useEffect(() => {
    if (simActive) {
      setSimLogs(prev => [
        ...prev, 
        `[Sensors Telemetry] Virtual analog GP26 adjusted to Raw: ${simSensorAnalog} (~${((simSensorAnalog * 3.3) / 65535).toFixed(2)} Volts)`
      ].slice(-50));
    }
  }, [simSensorAnalog]);

  // Keep simulator GP2 Button clicked events hooked
  const handleTriggerSimButton = (pressed: boolean) => {
    setSimButtonGP2(!pressed); // Pull.UP means unpressed (True), pressed means low (False)
    if (simActive) {
      setSimLogs(prev => [
        ...prev,
        `[Interrupt IO] GP2 tact pin pulled ${pressed ? "LOW (GND pressed)" : "HIGH (PULL UP released)"}`
      ]);
    }
  };

  // Helper to load templates to active files
  const loadCPTemplate = (code: string, title: string) => {
    // Generate or override active code.py
    const targetPath = "/code.py";
    const exists = files.some(f => f.path === targetPath);

    if (exists) {
      setFiles(prev => prev.map(f => f.path === targetPath ? { ...f, content: code } : f));
    } else {
      setFiles(prev => [
        ...prev,
        { path: targetPath, name: "code.py", isFolder: false, content: code }
      ]);
    }

    setActiveFilePath(targetPath);
    setSerialLogs(prev => [...prev, `[System] Injected CircuitPython template: '${title}' into workspace. Open /code.py to review.`]);
  };

  // Install virtual CircuitPython package into /lib/
  const installVirtualLib = (libName: string, isFolder = false) => {
    setLibraryMessage(`Downloading driver payload for '${libName}'...`);
    setTimeout(() => {
      // Create /lib folder if it doesn't exist
      const libFolderExists = files.some(f => f.path === "/lib");
      let updatedFiles = [...files];

      if (!libFolderExists) {
        updatedFiles.push({ path: "/lib", name: "lib", isFolder: true, content: "", isOpen: true });
      }

      const filePath = `/lib/${libName}`;
      const fileExists = files.some(f => f.path === filePath);

      if (!fileExists) {
        updatedFiles.push({
          path: filePath,
          name: libName,
          isFolder: isFolder,
          content: isFolder 
            ? "" 
            : `# CircuitPython helper driver for ${libName}\n# Version matching production bundle library index.\n\nprint("Library '${libName}' mounted successfully!")\n`
        });
        setFiles(updatedFiles);
        setLibraryMessage(`Successfully installed '${libName}' to '/lib/' directory tree.`);
      } else {
        setLibraryMessage(`Driver '${libName}' already exists in your workspace /lib/ folder.`);
      }

      // Hide message
      setTimeout(() => setLibraryMessage(null), 3000);
    }, 800);
  };

  // Filter libraries
  const filteredLibraries = AVAILABLE_LIBRARIES.filter(lib => 
    lib.name.toLowerCase().includes(libSearchQuery.toLowerCase()) || 
    lib.desc.toLowerCase().includes(libSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e2229] overflow-y-auto custom-scrollbar font-sans select-none divide-y divide-[#181a1f]">
      
      {/* 1. Controller Mode Selector Banner */}
      <div className="p-3 bg-slate-950/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-2">
          {connectionType === "hardware" && serialConnected ? (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1" />
          )}
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">
            {connectionType === "hardware" ? "🔌 PHYSICAL BOARD MODE" : "💻 VIRTUAL SIMULATOR MODE"}
          </span>
        </div>

        <div className="flex space-x-1.5">
          <button
            onClick={() => setConnectionType("simulator")}
            className={`px-2 py-1 text-[9px] rounded font-semibold font-mono tracking-wide transition border ${
              connectionType === "simulator"
                ? "bg-slate-800 text-yellow-400 border-yellow-500/30"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            SIMULATOR
          </button>
          
          {serialSupported ? (
            <button
              onClick={connectionType === "hardware" ? disconnectHardwarePort : connectHardwarePort}
              className={`px-2 py-1 text-[9px] rounded font-bold font-mono tracking-wide transition border flex items-center gap-1 shrink-0 ${
                connectionType === "hardware" && serialConnected
                  ? "bg-rose-950/60 text-rose-300 border-rose-900 hover:bg-rose-900"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-emerald-400"
              }`}
            >
              {connectionType === "hardware" && serialConnected ? "CLOSE PORT" : "CONNECT USB"}
            </button>
          ) : (
            <span className="text-[9px] text-slate-600 font-mono italic">USB Serial Native Blocked</span>
          )}
        </div>
      </div>

      {/* 2. Interactive Graphical Microcontroller Simulator Container */}
      <div className="p-4 bg-slate-900/40 flex flex-col items-center justify-center relative space-y-3">
        <span className="absolute top-2 left-2.5 text-[9px] font-bold font-mono text-slate-500 tracking-wider">
          Adafruit RP2040 Board Visualizer
        </span>

        {/* Board representation in elegant SVG styling */}
        <div className="w-48 h-36 bg-[#1f2937] border-2 border-[#10b981] rounded-xl relative p-3 shadow-2xl flex flex-col justify-between overflow-hidden select-none">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#10b981]/50 border-b border-[#047857]" />
          
          {/* Top USB type-C physical port */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-slate-700 border-b border-slate-800 rounded-b-md flex items-center justify-center shadow">
            <div className="w-5 h-1 bg-slate-950 rounded-full" />
          </div>

          {/* Microcontroller MCU core (RP2040 outline) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-slate-800 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center p-1 shadow-md">
            <Cpu className="w-5 h-5 text-slate-500" />
            <span className="text-[6px] font-mono text-slate-400 font-bold tracking-tighter mt-1">RP2040 MCU</span>
          </div>

          {/* On Board LED indicator */}
          <div className="absolute top-6 left-6 flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-350 ${
              simLedGP13 ? "bg-cyan-400 shadow-[0_0_8px_rgb(34,211,238)] border-cyan-300" : "bg-cyan-950 border-cyan-900"
            }`} />
            <span className="text-[5px] font-mono text-cyan-400 mt-1">GP13 LED</span>
          </div>

          {/* NeoPixel Module */}
          <div className="absolute top-6 right-6 flex flex-col items-center">
            <div 
              style={{ backgroundColor: neopixelColor }}
              className="w-4 h-4 rounded border border-slate-950 transition-all duration-300 shadow-md flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-white/25 rounded-sm" />
            </div>
            <span className="text-[5px] font-mono text-slate-400 mt-1">board.NEOPIXEL</span>
          </div>

          {/* Edge Connection Pins GPIO visual labels */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col space-y-1 pl-0.5">
            {["GP0", "GP1", "GP2", "GP3"].map((pin, i) => (
              <div key={i} className="flex items-center space-x-0.5 select-none">
                <div className={`w-1.5 h-1 bg-amber-500 rounded-r-sm ${pin === "GP2" && !simButtonGP2 ? "bg-red-400 animate-pulse" : ""}`} />
                <span className="text-[6px] font-mono text-slate-500 font-bold">{pin}</span>
              </div>
            ))}
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col space-y-1 pr-0.5 items-end">
            {["RAW", "GP26", "GP27", "GND"].map((pin, i) => (
              <div key={i} className="flex items-center space-x-0.5 select-none">
                <span className="text-[6px] font-mono text-slate-500 font-bold">{pin}</span>
                <div className={`w-1.5 h-1 bg-amber-500 rounded-l-sm ${pin === "GP26" ? "bg-sky-400" : ""}`} />
              </div>
            ))}
          </div>

          {/* Decorative PCB tracks */}
          <div className="w-full h-full border border-slate-800/20 absolute inset-0 pointer-events-none rounded-xl" />
          
          <div className="flex justify-between items-end mt-auto text-[7px] font-mono text-slate-600 uppercase tracking-widest leading-none select-none">
            <span>Rev A.1</span>
            <span>STEMMA QT</span>
          </div>
        </div>

        {/* GPIO Input Panel & Realtime Dial Controller */}
        <div className="w-full bg-slate-950/80 p-3 rounded-lg border border-slate-850 flex flex-col space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">🚨 Physical Input Interaction:</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 py-0.2 rounded font-semibold font-mono">Interactive Panel</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* GP2 Button clicker */}
            <div className="flex flex-col space-y-1 bg-slate-900/40 p-1.5 rounded border border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 font-bold">Button (GP2 Pin):</span>
              <button
                onMouseDown={() => handleTriggerSimButton(true)}
                onMouseUp={() => handleTriggerSimButton(false)}
                onMouseLeave={() => handleTriggerSimButton(false)}
                onTouchStart={() => handleTriggerSimButton(true)}
                onTouchEnd={() => handleTriggerSimButton(false)}
                className={`w-full py-1 text-[10px] font-bold rounded select-none cursor-pointer transition ${
                  !simButtonGP2 
                    ? "bg-rose-600 text-white border-rose-500" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                }`}
              >
                {!simButtonGP2 ? "GP2 PULLED DOWN (LOW)" : "CLICK TO PRESS GP2"}
              </button>
            </div>

            {/* Analog Dial */}
            <div className="flex flex-col space-y-1 bg-slate-900/40 p-1.5 rounded border border-slate-800">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold">
                <span>ADC (GP26):</span>
                <span className="text-emerald-400">{simSensorAnalog}</span>
              </div>
              <input 
                type="range"
                min="0"
                max="65535"
                step="500"
                value={simSensorAnalog}
                onChange={(e) => setSimSensorAnalog(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-950 roundedOutline"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Execute simulated python logic */}
      <div className="p-3.5 space-y-2">
        <span className="text-[10px] font-mono text-slate-400 select-none uppercase font-bold tracking-wider block font-semibold">
          ⚡ SCRIPT EXECUTION ENGINE
        </span>

        <div className="flex gap-2">
          {simActive ? (
            <button
              onClick={stopSimulatedScript}
              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded transition flex items-center justify-center space-x-1 select-none cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>HALT SIMULATOR</span>
            </button>
          ) : (
            <button
              onClick={runSimulatedScript}
              disabled={!activeFile || activeFile.isFolder}
              className="flex-1 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-850 disabled:text-slate-600 text-slate-950 font-mono font-bold text-xs rounded transition flex items-center justify-center space-x-1 select-none cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN code.py INSIDE SIMULATOR</span>
            </button>
          )}

          {/* Speed governor */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-2 rounded">
            <span className="text-[9px] font-mono text-slate-500">SPEED:</span>
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              className="bg-transparent text-[10px] text-yellow-500 font-mono font-bold outline-none border-none select-none cursor-pointer px-1"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="2">2.0x</option>
              <option value="5">5.0x</option>
            </select>
          </div>
        </div>

        {(!activeFile || activeFile.isFolder) && (
          <p className="text-[10px] text-amber-500 leading-normal bg-amber-950/40 border border-amber-900/60 p-2 rounded">
            ⚠️ No active file buffer selected in your workspace. Select or create a Python script like 'code.py' to simulate!
          </p>
        )}
      </div>

      {/* 4. Realtime Integrated Terminal & REPL Feed */}
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col min-h-[160px]">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 select-none uppercase font-bold tracking-wider font-semibold">
          <div className="flex items-center space-x-1 text-sky-400">
            <Terminal className="w-3 h-3 text-sky-400" />
            <span>SERIAL LOGS & REPL FEED</span>
          </div>

          <button
            onClick={() => {
              if (connectionType === "hardware") setSerialLogs([]);
              else setSimLogs([]);
            }}
            className="text-[9px] hover:text-white flex items-center space-x-0.5 cursor-pointer text-slate-500"
            title="Wipe serial messages logging buffer"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>CLEAR</span>
          </button>
        </div>

        {/* Log Viewer console panel */}
        <div className="flex-1 min-h-[100px] max-h-[160px] bg-slate-950 border border-slate-850 p-2.5 rounded font-mono text-[10.5px] overflow-y-auto custom-scrollbar select-text leading-tight flex flex-col-reverse">
          <div className="space-y-1">
            {connectionType === "hardware" ? (
              serialLogs.length === 0 ? (
                <span className="text-slate-600 block italic">-- Logging pipe is clean. Ready to receive serial --</span>
              ) : (
                serialLogs.map((log, index) => (
                  <div key={index} className="text-emerald-400 whitespace-pre-wrap leading-relaxed select-text tracking-normal">
                    {log}
                  </div>
                ))
              )
            ) : (
              simLogs.map((log, index) => {
                let colorClass = "text-sky-400";
                if (log.startsWith("[")) colorClass = "text-slate-500";
                if (log.includes("Warning") || log.includes("ADC")) colorClass = "text-amber-400";
                if (log.includes("Error")) colorClass = "text-rose-400";
                return (
                  <div key={index} className={`${colorClass} truncate font-mono select-text`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Command Line Input for the REPL prompt */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-slate-950 border border-slate-850 rounded p-1">
          <span className="text-[10px] font-mono text-yellow-500 pl-1 font-extrabold font-semibold selection:bg-slate-700">&gt;&gt;&gt;</span>
          <input
            type="text"
            value={replInput}
            onChange={(e) => setReplInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendRepl()}
            placeholder={connectionType === "hardware" ? "Execute direct command over live USB serial..." : "Enter simulated statement e.g. pixel.fill((255, 0, 0))"}
            className="flex-1 bg-transparent text-[11px] font-mono text-slate-100 outline-none border-none select-text placeholder-slate-600"
          />
        </div>
      </div>

      {/* 5. Library Package Manager Driver installer */}
      <div className="p-3.5 space-y-3 bg-[#1a1d24]">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 select-none uppercase font-bold tracking-wider font-semibold">
          <span>🎯 CP DRIVERS CONTAINER</span>
          {libraryMessage && (
            <span className="text-[9px] text-amber-500 font-mono animate-pulse font-bold">{libraryMessage}</span>
          )}
        </div>

        <input
          type="text"
          value={libSearchQuery}
          onChange={(e) => setLibSearchQuery(e.target.value)}
          placeholder="Search Adafruit Python bundle modules..."
          className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-300 outline-none placeholder-slate-600"
        />

        <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
          {filteredLibraries.map((lib, index) => (
            <div 
              key={index}
              className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2.5 hover:border-slate-700"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono text-slate-200 font-bold truncate">{lib.name}</span>
                  <span className="text-[8px] bg-slate-800 text-slate-400 font-serif px-1 rounded">{lib.version}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal truncate">{lib.desc}</p>
              </div>

              <button
                onClick={() => installVirtualLib(lib.name, lib.isFolder)}
                className="px-2 py-1 bg-[#2b313c] hover:bg-emerald-600 text-[10px] font-mono font-bold hover:text-slate-950 text-slate-300 rounded transition shrink-0 select-none cursor-pointer flex items-center space-x-1"
                title="Download driver module to /lib/"
              >
                <Plus className="w-3" />
                <span>MOUNT</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. High-Fidelity Boilerplate Templates */}
      <div className="p-3.5 space-y-3 bg-slate-900/10">
        <div className="text-[10px] font-mono text-slate-400 select-none uppercase font-bold tracking-wider font-semibold">
          <span>📚 CP TEMPLATES INTEGRATION</span>
        </div>

        <div className="space-y-2">
          {CP_TEMPLATES.map((tpl, i) => (
            <div 
              key={i} 
              className="p-2.5 rounded border border-slate-850 flex items-start justify-between bg-slate-950/20 hover:bg-slate-950/40 hover:border-slate-800"
            >
              <div className="space-y-0.5 min-w-0 pr-3">
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1 leading-snug">
                  <BookOpen className="w-3.5 h-3.5 mr-0.5 text-yellow-500 shrink-0" />
                  {tpl.title}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">{tpl.desc}</p>
              </div>

              <button
                onClick={() => loadCPTemplate(tpl.code, tpl.title)}
                className="px-2.5 py-1 text-xs bg-[#242b35] hover:bg-yellow-500 hover:text-slate-950 text-slate-200 border border-slate-750 font-semibold rounded shrink-0 transition select-none cursor-pointer"
              >
                Insert Code
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
