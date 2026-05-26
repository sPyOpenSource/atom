import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  Settings, 
  HelpCircle, 
  Terminal, 
  Sparkles, 
  ChevronRight, 
  X, 
  Search, 
  Layers, 
  ChevronDown, 
  AlertCircle, 
  AlertTriangle, 
  Save, 
  Undo,
  Play, 
  Check, 
  Compass, 
  Eye, 
  RefreshCw,
  Code,
  ArrowRightLeft,
  GitBranch,
  Github,
  ExternalLink,
  Lock,
  Globe,
  Share2,
  Database,
  Binary,
  FileCode
} from "lucide-react";
import FileTree from "./components/FileTree";
import CommandPalette from "./components/CommandPalette";
import SettingsView from "./components/SettingsView";
import FindReplace from "./components/FindReplace";
import CircuitPythonConsole from "./components/CircuitPythonConsole";
import HighlightedEditor from "./components/HighlightedEditor";
import HexEditor from "./components/HexEditor";
import { 
  VirtualFile, 
  AtomTheme, 
  AtomPackage, 
  CommandPaletteAction, 
  SearchOptions, 
  LinterMessage,
  CollaborativeUser,
  ChatMessage
} from "./types";

// Initial virtual project database
const INITIAL_FILES: VirtualFile[] = [
  { path: "/index.html", name: "index.html", isFolder: false, content: `<!doctype html>
<html>
  <head>
    <title>Quantum Flux App</title>
    <link href="styles.css" rel="stylesheet" />
  </head>
  <body>
    <div id="app">
      <h1>Welcome to Atom IDE</h1>
      <p>Configure telemetry or type something new.</p>
      <button id="trigger">Click Me</button>
    </div>
    <script src="src/app.js"></script>
  </body>
</html>` },
  { path: "/src", name: "src", isFolder: true, content: "", isOpen: true },
  { path: "/src/app.js", name: "app.js", isFolder: false, content: `// Core logic for the Quantum module
import { calculateFlux } from "./utils.js";

console.log("Atom core starting up...");

document.getElementById("trigger")?.addEventListener("click", () => {
  const flux = calculateFlux(42);
  console.log("Flux generated: " + flux);
  alert("Generated quantum flux value: " + flux);
});` },
  { path: "/src/utils.js", name: "utils.js", isFolder: false, content: `// Utility module
export function calculateFlux(base) {
  // missing parenthesis warning check:
  if (!base) {
    return 0;
  }
  return base * 1.618;
}` },
  { path: "/styles.css", name: "styles.css", isFolder: false, content: `body {
  background-color: #1d1f21;
  color: #abb2bf;
  font-family: 'Inter', sans-serif;
  padding: 40px;
}

h1 {
  color: #61afef;
  font-size: 2.5rem;
}` },
  { path: "/package.json", name: "package.json", isFolder: false, content: `{
  "name": "atom-quantum-stub",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/app.js"
  },
  "dependencies": {}
}` },
  { path: "/README.md", name: "README.md", isFolder: false, content: `# ⚛️ Atom IDE Web Console

Welcome to the highest-fidelity web clone of the legendary **Atom IDE**!

### Key Capabilities Included:
1. **Interactive File Tree**: Right-click or mouse-over to trigger file creations, folder toggles, renamings, and deletions dynamically.
2. **Tabbed Panel System**: Close, select, and review files. Open **Settings** directly from the UI to edit preferences or select from 5 classic themes.
3. **Advanced Linter Diagnostics**: Instant script diagnostics searching for basic syntax gaps, brackets balance, or semicolon inconsistencies.
4. **Command Palette**: Leverage the system command palette (\`Ctrl+Shift+P\` or clicking the bottom-right selector) to search commands.
5. **AI Coding Copilot**: Ask Gemini to optimize or write code in real-time, plus a premium **AI Auto-Fix** to fix linter issues automatically!
` },
  { path: "/code.py", name: "code.py", isFolder: false, content: `# CircuitPython NeoPixel Rainbow and Pin Read Demo
import time
import board
import neopixel
import analogio
import digitalio

# Setup NeoPixel RGB LED on board pin
pixel = neopixel.NeoPixel(board.NEOPIXEL, 1, brightness=0.5)

# Setup push button (GP2 pin pull-up resistor)
button = digitalio.DigitalInOut(board.GP2)
button.direction = digitalio.Direction.INPUT
button.pull = digitalio.Pull.UP

print("CircuitPython active! NeoPixel ready.")

while True:
    # Read button GP2 state
    if not button.value:
         print("Button GP2 pressed! Changing NeoPixel color.")
         pixel.fill((255, 0, 127)) # Neon Pink
         time.sleep(0.5)
    else:
         # Fade NeoPixel colors
         for color in [(255, 0, 0), (0, 255, 0), (0, 0, 255)]:
              pixel.fill(color)
              print("Cycling color stream...")
              time.sleep(1.0)
` },
  { path: "/assets", name: "assets", isFolder: true, content: "", isOpen: true },
  { path: "/assets/firmware.bin", name: "firmware.bin", isFolder: false, content: "\x7FELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x3E\x00\x01\x00\x00\x00\x78\x00\x40\x00\x00\x00\x00\x00\x40\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00Compiled ELF64 Web IDE Header. Greetings from modern Hex Viewer and Interactive Struct Inspector!" }
];

const INITIAL_PACKAGES: AtomPackage[] = [
  { id: "atom-beautify", name: "atom-beautify", version: "0.33.4", description: "Format and indent files using style guide setups.", author: "Glavin001", enabled: true, downloads: 412200 },
  { id: "git-plus", name: "git-plus", version: "8.1.0", description: "Execute Git commands inside atom window environment.", author: "akonwi", enabled: true, downloads: 209800 },
  { id: "emmet", name: "emmet", version: "2.4.3", description: "High-speed HTML/CSS expansion completions utility.", author: "sergeche", enabled: false, downloads: 184000 },
  { id: "linter-eslint", name: "linter-eslint", version: "8.5.1", description: "On-the-fly JavaScript standard grammar auditing pipeline.", author: "AtomLinter", enabled: true, downloads: 350000 }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<AtomTheme>("one-dark");
  
  // File state
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string | null>("/README.md");
  const [openTabs, setOpenTabs] = useState<string[]>(["/README.md"]);
  
  // Editor state
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>("font-mono");
  const [tabLength, setTabLength] = useState<number>(2);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [editorCursor, setEditorCursor] = useState({ line: 1, col: 1 });
  const [editorMode, setEditorMode] = useState<"text" | "hex">("text");
  
  // Find & Replace State
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findReplaceOptions, setFindReplaceOptions] = useState<SearchOptions>({
    find: "",
    replace: "",
    matchCase: false,
    wholeWord: false,
    useRegex: false
  });
  const [matchCount, setMatchCount] = useState<{ current: number; total: number } | null>(null);

  // Layout toggles
  const [sidebarWidth, setSidebarWidth] = useState<number>(240);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [copilotWidth, setCopilotWidth] = useState<number>(310);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Packages & registry
  const [packages, setPackages] = useState<AtomPackage[]>(INITIAL_PACKAGES);

  // Interactive Live diagnostics / syntax checker error messages list
  const [diagnostics, setDiagnostics] = useState<LinterMessage[]>([]);

  // AI Copilot state
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "### ⚛️ Welcome to Atom AI Copilot\n\nI can analyze your active files and run smart hotfixes. Highlight some text, or just query me about your code!" }
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedCodeSegment, setSelectedCodeSegment] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // WebSocket / Collaboration state
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected");
  const [myUserId, setMyUserId] = useState<string>("");
  const [myUsername, setMyUsername] = useState<string>("GuestCoder");
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [collaborativeUsers, setCollaborativeUsers] = useState<CollaborativeUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [activeCopilotTab, setActiveCopilotTab] = useState<"ai" | "peers" | "github" | "circuitpython">("ai");

  // GitHub Integration State
  const [githubToken, setGithubToken] = useState<string | null>(() => localStorage.getItem("atom_github_token"));
  const [githubUser, setGithubUser] = useState<any>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [repoBranch, setRepoBranch] = useState<string>("main");
  const [commitMessage, setCommitMessage] = useState<string>("Update file code via Atom Workspace");
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [gistPublic, setGistPublic] = useState<boolean>(true);
  const [githubStatusMsg, setGithubStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Sync profile details if token changes
  useEffect(() => {
    if (!githubToken) {
      setGithubUser(null);
      setGithubRepos([]);
      return;
    }

    const fetchGitHubData = async () => {
      setGithubLoading(true);
      try {
        const userRes = await fetch("/api/github/user", {
          headers: { "X-GitHub-Token": githubToken }
        });
        if (userRes.ok) {
          const uData = await userRes.json();
          setGithubUser(uData);
        } else {
          throw new Error("Failed to fetch GitHub profile");
        }

        const repoRes = await fetch("/api/github/repos", {
          headers: { "X-GitHub-Token": githubToken }
        });
        if (repoRes.ok) {
          const rData = await repoRes.json();
          setGithubRepos(rData);
          if (rData.length > 0) {
            setSelectedRepo(rData[0].full_name || "");
          }
        }
      } catch (err: any) {
        console.error("Failed to load GitHub credentials:", err);
        setGithubToken(null);
        localStorage.removeItem("atom_github_token");
        setGithubStatusMsg({ type: "error", text: "GitHub credentials expired or invalid. Profile disconnected." });
      } finally {
        setGithubLoading(false);
      }
    };

    fetchGitHubData();
  }, [githubToken]);

  // Listener to receive OAuth Token callback from popup
  useEffect(() => {
    const handleGitHubOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const token = event.data.token;
        if (token) {
          localStorage.setItem("atom_github_token", token);
          setGithubToken(token);
          setGithubStatusMsg({
            type: "success",
            text: event.data.isDemo 
              ? "Connected in Demo Mode! (Client credentials are empty in your secrets panel)" 
              : "Successfully authenticated with real GitHub account!"
          });
          setActiveCopilotTab("github");
        }
      }
    };

    window.addEventListener("message", handleGitHubOAuthMessage);
    return () => window.removeEventListener("message", handleGitHubOAuthMessage);
  }, []);

  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket integration on mount
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any;

    const establishConnection = () => {
      setWsStatus("connecting");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const url = `${protocol}//${window.location.host}/ws`;

      try {
        socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsStatus("connected");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case "init": {
                setMyUserId(data.payload.userId);
                setCollaborativeUsers(data.payload.users);
                // Find and save assigned name
                const self = data.payload.users.find((u: any) => u.id === data.payload.userId);
                if (self) {
                  setMyUsername(self.name);
                }
                break;
              }
              case "user:join": {
                const newcomer = data.payload;
                setCollaborativeUsers(prev => {
                  if (prev.some(u => u.id === newcomer.id)) return prev;
                  return [...prev, newcomer];
                });
                break;
              }
              case "user:update": {
                const alteredPeer = data.payload;
                setCollaborativeUsers(prev => prev.map(u => u.id === alteredPeer.id ? alteredPeer : u));
                break;
              }
              case "user:leave": {
                const departedId = data.payload.id;
                setCollaborativeUsers(prev => prev.filter(u => u.id !== departedId));
                break;
              }
              case "file:change": {
                const { filePath, content } = data.payload;
                setFiles(prev => prev.map(f => {
                  if (f.path === filePath && f.content !== content) {
                    return { ...f, content };
                  }
                  return f;
                }));
                break;
              }
              case "chat:message": {
                setChatMessages(prev => [...prev, data.payload]);
                break;
              }
            }
          } catch (err) {
            console.error("Failed to parse websocket package event:", err);
          }
        };

        socket.onerror = () => {
          setWsStatus("disconnected");
        };

        socket.onclose = () => {
          setWsStatus("disconnected");
          reconnectTimeout = setTimeout(establishConnection, 4000);
        };
      } catch (e) {
        console.error("WS error:", e);
        reconnectTimeout = setTimeout(establishConnection, 4500);
      }
    };

    establishConnection();

    return () => {
      if (socket) {
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  // Get current active file object
  const activeFile = files.find(f => f.path === activeFilePath) || null;

  // Sync personal state with peers over WS whenever file focus or cursor shifts
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "user:update",
        payload: {
          name: myUsername,
          filePath: activeFilePath,
          cursor: editorCursor
        }
      }));
    }
  }, [activeFilePath, editorCursor, myUsername, wsStatus]);

  // Run initial or on-change text linter checks
  useEffect(() => {
    if (activeFile && !activeFile.isFolder) {
      const msgs = performLinter(activeFile.name, activeFile.content);
      // Ensure local state replicates content correctly without circular emits
      setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: activeFile.content } : f));
      setDiagnostics(msgs);
    } else {
      setDiagnostics([]);
    }
  }, [activeFilePath, activeFile?.content]);

  // Command palette actions
  const getCommandPaletteActions = (): CommandPaletteAction[] => {
    const list: CommandPaletteAction[] = [
      { id: "find", name: "Search: Find and Replace Buffer", shortcut: "Ctrl+F", group: "Find", action: () => setFindReplaceOpen(true) },
      { id: "settings", name: "Application: Open Settings Board", shortcut: "Ctrl+,", group: "Settings", action: () => openFileOrConfig("settings") },
      { id: "toggle-sidebar", name: "View: Toggle Workspace Sidebar", shortcut: "Ctrl+\\", group: "View", action: () => setIsSidebarOpen(!isSidebarOpen) },
      { id: "toggle-copilot", name: "View: Toggle AI Assistant Panel", shortcut: "Ctrl+Alt+A", group: "View", action: () => setIsCopilotOpen(!isCopilotOpen) },
      { id: "copilot-help", name: "AI: Clear Conversation Logs", group: "Copilot", action: () => setCopilotMessages([{ role: "assistant", content: "Chat cleared. Ask me anything!" }]) },
      { id: "theme-one-dark", name: "Theme: Switch to Atom One Dark", group: "Theme", action: () => setTheme("one-dark") },
      { id: "theme-one-light", name: "Theme: Switch to Atom One Light", group: "Theme", action: () => setTheme("one-light") },
      { id: "theme-solarized-dark", name: "Theme: Switch to Solarized Dark", group: "Theme", action: () => setTheme("solarized-dark") },
      { id: "theme-monokai", name: "Theme: Switch to Classic Monokai", group: "Theme", action: () => setTheme("monokai") },
      { id: "theme-github-light", name: "Theme: Switch to GitHub Light Theme", group: "Theme", action: () => setTheme("github-light") },
      { id: "beautify", name: "Package: Run atom-beautify (Prettify Code)", shortcut: "Ctrl+Alt+B", group: "Packages", action: () => handleFormatCode() },
      { id: "linter-run", name: "Package: Run ESLint Standard Audit", group: "Packages", action: () => {
        if (activeFile) {
          const res = performLinter(activeFile.name, activeFile.content);
          setDiagnostics(res);
          alert(`ESLint scanned ${activeFile.name}. Found ${res.length} issues.`);
        }
      }}
    ];

    // Add files to command palette action triggers
    files.filter(f => !f.isFolder).forEach(file => {
      list.push({
        id: `open-${file.path}`,
        name: `File: Open ${file.name}`,
        group: "Workspace",
        action: () => handleSelectFile(file.path)
      });
    });

    return list;
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Ctrl+Shift+P or Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      // Settings: Ctrl+, or Cmd+,
      else if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        openFileOrConfig("settings");
      }
      // Search: Ctrl+F
      else if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setFindReplaceOpen(prev => !prev);
      }
      // Toggle Sidebar: Ctrl+\ 
      else if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isBinaryFile = (name: string, content?: string): boolean => {
    const binaryExtensions = [".bin", ".exe", ".wasm", ".pyc", ".dat", ".png", ".jpg", ".gif", ".ico", ".pdf", ".zip", ".tar", ".gz", ".o", ".class"];
    const ext = name.toLowerCase().slice(name.lastIndexOf("."));
    if (binaryExtensions.includes(ext)) return true;
    
    if (content) {
      const chunk = content.slice(0, 100);
      for (let i = 0; i < chunk.length; i++) {
        const code = chunk.charCodeAt(i);
        if (code === 0 || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
          return true;
        }
      }
    }
    return false;
  };

  // Synchronously switch to Hex mode for binary files or text mode for text files
  useEffect(() => {
    if (activeFile) {
      const isBin = isBinaryFile(activeFile.name, activeFile.content);
      setEditorMode(isBin ? "hex" : "text");
    }
  }, [activeFilePath]);

  // Simple offline parser mimicking real coding guidelines
  const performLinter = (name: string, content: string): LinterMessage[] => {
    const messages: LinterMessage[] = [];
    const lines = content.split("\n");

    const isJS = name.endsWith(".js") || name.endsWith(".jsx") || name.endsWith(".ts") || name.endsWith(".tsx");
    const isHTML = name.endsWith(".html");
    const isPy = name.endsWith(".py");

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      
      if (isPy) {
        const trimmed = line.trim();
        if ((trimmed.startsWith("if ") || trimmed.startsWith("elif ") || trimmed.startsWith("while ") || trimmed.startsWith("for ") || trimmed.startsWith("def ")) && !trimmed.endsWith(":")) {
          messages.push({
            line: lineNum,
            column: line.length || 1,
            severity: "error",
            message: "Python formatting: Missing colon (:) at the end of declaration control statement.",
            source: "PyLint"
          });
        }
        if (line.includes("\t") && line.includes(" ")) {
          messages.push({
            line: lineNum,
            column: 1,
            severity: "error",
            message: "Python fatal: Tab and Space characters mixed for indentation. Rely entirely on spaces.",
            source: "PyLint"
          });
        }
        if (line.includes("board.") && !content.includes("import board")) {
          messages.push({
            line: lineNum,
            column: line.indexOf("board.") + 1,
            severity: "warning",
            message: "Property 'board' referenced but 'import board' is missing in the file header.",
            source: "PyLint"
          });
        }
        if (line.includes("neopixel.") && !content.includes("import neopixel")) {
          messages.push({
            line: lineNum,
            column: line.indexOf("neopixel.") + 1,
            severity: "warning",
            message: "Property 'neopixel' referenced but 'import neopixel' is missing in the file header.",
            source: "PyLint"
          });
        }
      }

      if (isJS) {
        // Look for alert calls - usually deprecated in clean code guidelines
        if (line.includes("alert(")) {
          messages.push({
            line: lineNum,
            column: line.indexOf("alert(") + 1,
            severity: "warning",
            message: "Avoid raw alert() calls. Use status notifications or custom modals instead.",
            source: "ESLint (no-alert)"
          });
        }
        
        // Unfinished or empty brackets
        if (line.includes("if") && line.includes("(") && !line.includes(")") && !line.includes("{")) {
          messages.push({
            line: lineNum,
            column: line.indexOf("if") + 1,
            severity: "error",
            message: "Missing matching parenthesis or scope brackets on conditional expression.",
            source: "ESLint (syntax-error)"
          });
        }

        // Loose eq
        if (line.includes("==") && !line.includes("===") && !line.includes("!==")) {
          messages.push({
            line: lineNum,
            column: line.indexOf("==") + 1,
            severity: "warning",
            message: "Expected '===' and instead saw '=='. Rely on absolute comparison types.",
            source: "ESLint (eqeqeq)"
          });
        }
      }

      if (isHTML) {
        // Missing doctype
        if (lineNum === 1 && !line.toLowerCase().includes("<!doctype")) {
          messages.push({
            line: lineNum,
            column: 1,
            severity: "warning",
            message: "Every HTML module should start with a dynamic DOCTYPE validation string.",
            source: "HTML-Validator"
          });
        }
      }
    });

    return messages;
  };

  // Prettify function
  const handleFormatCode = () => {
    if (!activeFile || activeFile.isFolder) return;
    
    let beautified = activeFile.content;
    const isJS = activeFile.name.endsWith(".js") || activeFile.name.endsWith(".json") || activeFile.name.endsWith(".css");
    
    if (isJS) {
      // Elementary indentation beautifier
      let indentCount = 0;
      beautified = activeFile.content
        .split("\n")
        .map(line => {
          let trimmed = line.trim();
          if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
            indentCount = Math.max(0, indentCount - 1);
          }
          const space = " ".repeat(indentCount * tabLength);
          const formatted = space + trimmed;
          if (trimmed.endsWith("{") || trimmed.endsWith("[")) {
            indentCount++;
          }
          return formatted;
        })
        .join("\n");
    }

    setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: beautified } : f));
  };

  // Open settings panel or any standard tab
  const openFileOrConfig = (type: string) => {
    if (type === "settings") {
      if (!openTabs.includes("settings")) {
        setOpenTabs([...openTabs, "settings"]);
      }
      setActiveFilePath("settings");
    }
  };

  const handleSelectFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs([...openTabs, path]);
    }
    setActiveFilePath(path);
  };

  const handleCloseTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter(t => t !== path);
    setOpenTabs(remaining);
    
    if (activeFilePath === path) {
      if (remaining.length > 0) {
        setActiveFilePath(remaining[remaining.length - 1]);
      } else {
        setActiveFilePath(null);
      }
    }
  };

  // CRUD virtual files
  const handleCreateFile = (parentPath: string, name: string, isFolder: boolean) => {
    const fullPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
    
    // Check duplication
    if (files.some(f => f.path === fullPath)) {
      alert("A file or folder with that name already exists in this folder.");
      return;
    }

    const newObj: VirtualFile = {
      path: fullPath,
      name,
      isFolder,
      content: isFolder ? "" : `// New ${name} Document\n\nconsole.log("Welcome to ${name}");\n`,
      isOpen: isFolder ? true : undefined
    };

    setFiles(prev => [...prev, newObj]);
    
    if (!isFolder) {
      handleSelectFile(fullPath);
    }
  };

  const handleDeleteFile = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path && !f.path.startsWith(path + "/")));
    
    // Clean up tabs
    const affected = openTabs.filter(t => t !== path && !t.startsWith(path + "/"));
    setOpenTabs(affected);
    
    if (activeFilePath && (activeFilePath === path || activeFilePath.startsWith(path + "/"))) {
      if (affected.length > 0) {
        setActiveFilePath(affected[affected.length - 1]);
      } else {
        setActiveFilePath(null);
      }
    }
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    setFiles(prev => prev.map(f => {
      if (f.path === oldPath) {
        return { ...f, path: newPath, name: newPath.split("/").pop()! };
      }
      if (f.path.startsWith(oldPath + "/")) {
        const remainingStr = f.path.substring(oldPath.length);
        return { ...f, path: newPath + remainingStr };
      }
      return f;
    }));

    // Update opened tabs
    setOpenTabs(prev => prev.map(tab => {
      if (tab === oldPath) return newPath;
      if (tab.startsWith(oldPath + "/")) return newPath + tab.substring(oldPath.length);
      return tab;
    }));

    if (activeFilePath === oldPath) {
      setActiveFilePath(newPath);
    } else if (activeFilePath?.startsWith(oldPath + "/")) {
      setActiveFilePath(newPath + activeFilePath.substring(oldPath.length));
    }
  };

  const handleToggleFolder = (path: string) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, isOpen: !f.isOpen } : f));
  };

  // Content changes
  const handleContentChange = (val: string) => {
    if (!activeFile || activeFile.isFolder) return;
    
    // Update local state
    setFiles(prev => prev.map(f => f.path === activeFile.path ? { ...f, content: val } : f));

    // Broadcast change
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "file:change",
        payload: {
          filePath: activeFile.path,
          content: val
        }
      }));
    }
  };

  // Interactive Cursor Position calculation
  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selStart = target.selectionStart;
    const textUntilCursor = target.value.substring(0, selStart);
    const lines = textUntilCursor.split("\n");
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;
    setEditorCursor({ line: lineNum, col: colNum });

    // Track active selected segment for Copilot
    const selection = target.value.substring(target.selectionStart, target.selectionEnd);
    setSelectedCodeSegment(selection);
  };

  // Find and replace operations
  const handleFindNext = () => {
    if (!activeFile || !findReplaceOptions.find) return;
    const content = activeFile.content;
    const searchStr = findReplaceOptions.find;
    
    let regex: RegExp;
    try {
      const flags = findReplaceOptions.matchCase ? "g" : "gi";
      regex = new RegExp(searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
    } catch {
      return;
    }

    const matches = [...content.matchAll(regex)];
    if (matches.length === 0) {
      setMatchCount({ current: 0, total: 0 });
      return;
    }

    // Highlight search item or place cursor there
    setMatchCount({ current: 1, total: matches.length });
    
    const textarea = textareaRef.current;
    if (textarea) {
      const firstMatch = matches[0];
      const startIdx = firstMatch.index || 0;
      textarea.focus();
      textarea.setSelectionRange(startIdx, startIdx + searchStr.length);
    }
  };

  const handleReplace = () => {
    if (!activeFile || !findReplaceOptions.find) return;
    const content = activeFile.content;
    const { find, replace } = findReplaceOptions;
    
    const index = content.toLowerCase().indexOf(find.toLowerCase());
    if (index !== -1) {
      const updated = content.substring(0, index) + replace + content.substring(index + find.length);
      handleContentChange(updated);
      setTimeout(() => handleFindNext(), 50);
    }
  };

  const handleReplaceAll = () => {
    if (!activeFile || !findReplaceOptions.find) return;
    const { find, replace, matchCase } = findReplaceOptions;
    
    let regex: RegExp;
    try {
      const flags = matchCase ? "g" : "gi";
      regex = new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), flags);
    } catch {
      return;
    }

    const updated = activeFile.content.replace(regex, replace);
    handleContentChange(updated);
    setMatchCount(null);
  };

  // AI Copilot Actions
  const handleSendCopilotMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput.trim();
    setCopilotMessages(prev => [...prev, { role: "user", content: userText }]);
    setCopilotInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...copilotMessages.slice(-8), { role: "user", content: userText }],
          currentFile: activeFile ? { name: activeFile.name, content: activeFile.content } : null,
          codeSelection: selectedCodeSegment || null
        })
      });

      const data = await response.json();
      if (data.error) {
        setCopilotMessages(prev => [...prev, { role: "assistant", content: `**Error:** ${data.error}` }]);
      } else {
        setCopilotMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      }
    } catch (err) {
      setCopilotMessages(prev => [...prev, { role: "assistant", content: "**Offline/Communication Error:** Could not contact Apollo Server. Make sure server is listening." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Perform Gemini Smart auto-fix
  const handleAutoFixDiagnostic = async (errorMsg: LinterMessage) => {
    if (!activeFile) return;
    setIsAiLoading(true);
    setCopilotMessages(prev => [...prev, { 
      role: "assistant", 
      content: `⚡ **Gemini Auto-Fix:** Analyzing "${errorMsg.message}" on line ${errorMsg.line}...` 
    }]);

    try {
      const response = await fetch("/api/copilot/autofix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: activeFile.name,
          fileContent: activeFile.content,
          errorDetails: `Line ${errorMsg.line}: ${errorMsg.message} - Source: ${errorMsg.source}`
        })
      });

      const data = await response.json();
      if (data.fixedCode) {
        setFiles(prev => prev.map(f => f.path === activeFilePath ? { ...f, content: data.fixedCode } : f));
        setCopilotMessages(prev => [
          ...prev, 
          { 
            role: "assistant", 
            content: `✨ **System Repaired!**\n\n${data.explanation || "No comments offered."}` 
          }
        ]);
      } else if (data.error) {
        alert("Autofix Error: " + data.error);
      }
    } catch (err) {
      alert("Autofix offline. Please set your GEMINI_API_KEY inside the dashboard settings.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Broadcast peer message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "chat:message",
        payload: { text: chatInput }
      }));
      setChatInput("");
    }
  };

  // Connect to GitHub OAuth flow popup directly
  const handleConnectGitHub = async () => {
    try {
      setGithubLoading(true);
      setGithubStatusMsg({ type: "info", text: "Opening GitHub Connection Tunnel..." });
      
      const response = await fetch("/api/auth/github/url");
      if (!response.ok) {
        throw new Error("Failed to contact local authorization tunnel");
      }
      
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        url,
        "github_oauth_popup",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
      );

      if (!authWindow) {
        setGithubStatusMsg({ 
          type: "error", 
          text: "Web Browser blocked the authentication popup. Please allow popups for this origin!" 
        });
      }
    } catch (err: any) {
      console.error("OAuth init error:", err);
      setGithubStatusMsg({ type: "error", text: `Auth tunnel initiation failed: ${err.message}` });
    } finally {
      setGithubLoading(false);
    }
  };

  // Disconnect GitHub context
  const handleDisconnectGitHub = () => {
    localStorage.removeItem("atom_github_token");
    setGithubToken(null);
    setGithubUser(null);
    setGithubRepos([]);
    setSelectedRepo("");
    setGithubStatusMsg({ type: "info", text: "GitHub credentials removed from browser localStorage." });
  };

  // Commit and Push currently active file to selected repo
  const handlePushActiveFile = async () => {
    if (!githubToken) {
      setGithubStatusMsg({ type: "error", text: "Please authorize your profile first!" });
      return;
    }

    if (!activeFile || activeFile.isFolder) {
      setGithubStatusMsg({ type: "error", text: "No active file buffer context selected in the editor." });
      return;
    }

    if (!selectedRepo) {
      setGithubStatusMsg({ type: "error", text: "A target GitHub repository must be selected from the drop-down list." });
      return;
    }

    setGithubLoading(true);
    setGithubStatusMsg({ type: "info", text: `Synthesizing staging & pushing ${activeFile.name}...` });

    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Token": githubToken
        },
        body: JSON.stringify({
          repo: selectedRepo,
          path: activeFile.path,
          content: activeFile.content,
          message: commitMessage,
          branch: repoBranch
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "GitHub commit action failed.");
      }

      setGithubStatusMsg({
        type: "success",
        text: data.demo 
          ? `[Demo Connected] Successfully committed ${activeFile.name} to ${selectedRepo} (${repoBranch})`
          : `Pushed successfully! Commit SHA: ${data.commit?.sha?.substring(0, 7) || "N/A"}.`
      });
    } catch (err: any) {
      console.error("GitHub Push error:", err);
      setGithubStatusMsg({ type: "error", text: `Push rejected: ${err.message}` });
    } finally {
      setGithubLoading(false);
    }
  };

  // Publish currently active file as a safe single Gist
  const handlePublishGist = async () => {
    if (!githubToken) {
      setGithubStatusMsg({ type: "error", text: "Please connect your profile identity first!" });
      return;
    }

    if (!activeFile || activeFile.isFolder) {
      setGithubStatusMsg({ type: "error", text: "Select an active text or code buffer to compile into Gist." });
      return;
    }

    setGithubLoading(true);
    setGithubStatusMsg({ type: "info", text: `Uploading dynamic gist payloads to GitHub...` });

    try {
      const res = await fetch("/api/github/gists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-Token": githubToken
        },
        body: JSON.stringify({
          description: `Gist of ${activeFile.name} published via full-fidelity Atom Workspace`,
          isPublic: gistPublic,
          files: {
            [activeFile.name]: {
              content: activeFile.content
            }
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "GitHub Gist pipeline rejected.");
      }

      setGithubStatusMsg({
        type: "success",
        text: `Gist Published! URL: ${data.html_url}`
      });
      
      // Auto-open if browser safety policies match
      if (data.html_url && !data.demo) {
        window.open(data.html_url, "_blank");
      }
    } catch (err: any) {
      console.error("Gist error:", err);
      setGithubStatusMsg({ type: "error", text: `Gist publish rejected: ${err.message}` });
    } finally {
      setGithubLoading(false);
    }
  };

  // Install package simulator
  const handleInstallPackage = async (name: string): Promise<boolean> => {
    if (packages.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }
    const newPkg: AtomPackage = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name: name,
      version: "1.0.0",
      description: `Integrates extension APIs for ${name} into the modular core console pipeline.`,
      author: "AtomRegistry",
      enabled: true,
      downloads: Math.floor(Math.random() * 5000) + 120
    };
    setPackages(prev => [...prev, newPkg]);
    return true;
  };

  const handleTogglePackage = (id: string) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  // Visual Palette map depending on activeTheme state
  const getThemeStyles = () => {
    switch (theme) {
      case "one-light":
        return {
          bg: "bg-[#fafafa]",
          text: "text-[#383a42]",
          sidebarBg: "bg-[#eaeaea]",
          border: "border-[#dddddd]",
          tabsBg: "bg-[#eaeaea]",
          tabActiveBg: "bg-[#fafafa]",
          tabActiveBorder: "border-t-[#528bff]",
          tabTextColor: "text-[#383a42]",
          textareaBg: "bg-[#fafafa]",
          textareaText: "text-[#383a42]",
          gutterBg: "bg-[#f0f0f0]",
          gutterText: "text-[#a0a0a0]",
          statusbarBg: "bg-[#eaeaea]",
          statusbarText: "text-[#383a42]",
          highlightLine: "bg-[#f2f2f2]"
        };
      case "solarized-dark":
        return {
          bg: "bg-[#002b36]",
          text: "text-[#839496]",
          sidebarBg: "bg-[#073642]",
          border: "border-[#00212b]",
          tabsBg: "bg-[#073642]",
          tabActiveBg: "bg-[#002b36]",
          tabActiveBorder: "border-t-[#b58900]",
          tabTextColor: "text-[#93a1a1]",
          textareaBg: "bg-[#002b36]",
          textareaText: "text-[#839496]",
          gutterBg: "bg-[#073642]",
          gutterText: "text-[#586e75]",
          statusbarBg: "bg-[#073642]",
          statusbarText: "text-[#839496]",
          highlightLine: "bg-[#073642]/60"
        };
      case "monokai":
        return {
          bg: "bg-[#272822]",
          text: "text-[#f8f8f2]",
          sidebarBg: "bg-[#1e1f1c]",
          border: "border-[#141411]",
          tabsBg: "bg-[#1e1f1c]",
          tabActiveBg: "bg-[#272822]",
          tabActiveBorder: "border-t-[#a6e22e]",
          tabTextColor: "text-[#f8f8f2]",
          textareaBg: "bg-[#272822]",
          textareaText: "text-[#f8f8f2]",
          gutterBg: "bg-[#1e1f1c]",
          gutterText: "text-[#75715e]",
          statusbarBg: "bg-[#1e1f1c]",
          statusbarText: "text-[#f8f8f2]",
          highlightLine: "bg-[#3e3d32]"
        };
      case "github-light":
        return {
          bg: "bg-[#ffffff]",
          text: "text-[#24292e]",
          sidebarBg: "bg-[#f6f8fa]",
          border: "border-[#e1e4e6]",
          tabsBg: "bg-[#f6f8fa]",
          tabActiveBg: "bg-[#ffffff]",
          tabActiveBorder: "border-t-[#f9826c]",
          tabTextColor: "text-[#24292e]",
          textareaBg: "bg-[#ffffff]",
          textareaText: "text-[#24292e]",
          gutterBg: "bg-[#f6f8fa]",
          gutterText: "text-[#959da5]",
          statusbarBg: "bg-[#f6f8fa]",
          statusbarText: "text-[#24292e]",
          highlightLine: "bg-[#f1f8ff]"
        };
      case "one-dark":
      default:
        return {
          bg: "bg-[#282c34]",
          text: "text-[#abb2bf]",
          sidebarBg: "bg-[#21252b]",
          border: "border-[#181a1f]",
          tabsBg: "bg-[#21252b]",
          tabActiveBg: "bg-[#282c34]",
          tabActiveBorder: "border-t-[#528bff]",
          tabTextColor: "text-[#d7dae0]",
          textareaBg: "bg-[#282c34]",
          textareaText: "text-[#abb2bf]",
          gutterBg: "bg-[#21252b]",
          gutterText: "text-[#4b5263]",
          statusbarBg: "bg-[#21252b]",
          statusbarText: "text-[#9da5b4]",
          highlightLine: "bg-[#2c313a]"
        };
    }
  };

  const style = getThemeStyles();
  const errorsCount = diagnostics.filter(d => d.severity === "error").length;
  const warningsCount = diagnostics.filter(d => d.severity === "warning").length;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${style.bg} ${style.text} select-none`}>
      {/* Upper Brand / Menu Bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 ${style.sidebarBg} border-b ${style.border} h-11 shrink-0`}>
        <div className="flex items-center space-x-3">
          {/* OS Windows Red-Yellow-Green Dots */}
          <div className="flex space-x-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Atom Title Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-wider text-slate-100 font-sans">⚛️ ATOM</span>
          </div>

          <span className="text-[10px] bg-indigo-600/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
            Silicon Release 1.25
          </span>

          {/* WebSocket Status Badge */}
          {wsStatus === "connected" && (
            <span className="flex items-center space-x-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-medium select-none">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>LIVE CLOUD SYNC</span>
            </span>
          )}
          {wsStatus === "connecting" && (
            <span className="flex items-center space-x-1 text-[9px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono font-medium select-none animate-pulse">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>CO-CONNECTING...</span>
            </span>
          )}
          {wsStatus === "disconnected" && (
            <span className="flex items-center space-x-1 text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono font-medium select-none">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              <span>STANDALONE</span>
            </span>
          )}

          {/* Interactive Peer Presence Avatar Circle List */}
          {collaborativeUsers.length > 0 && (
            <div className="hidden lg:flex items-center space-x-1 pl-2 border-l border-slate-700/50">
              <span className="text-[9px] text-slate-500 font-mono mr-1">PEERS:</span>
              {collaborativeUsers.map(user => {
                const isSelf = user.id === myUserId;
                return (
                  <div
                    key={user.id}
                    title={`${user.name}${isSelf ? " (My session)" : ""}${user.filePath ? ` - Editing ${user.filePath}` : " - Standing by"}`}
                    onClick={() => {
                      if (user.filePath && !isSelf) {
                        handleSelectFile(user.filePath);
                      }
                    }}
                    className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-transform hover:scale-115 cursor-pointer relative ${
                      isSelf ? "ring-1 ring-slate-400 ring-offset-1 ring-offset-slate-900" : ""
                    }`}
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.substring(0, 2).toUpperCase()}
                    {user.filePath && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            title="Open Interactive Settings Panel"
            onClick={() => openFileOrConfig("settings")}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#282c34] hover:bg-slate-700/80 rounded border border-[#181a1f] transition cursor-pointer"
            id="toolbar-btn-settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>

          <button
            title="Toggle File Navigation Hub"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1 hover:bg-slate-700 rounded transition cursor-pointer ${isSidebarOpen ? "text-blue-400" : "text-slate-400"}`}
            id="toolbar-btn-sidebar"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            title="Activate Command Finder Dashboard"
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition cursor-pointer"
            id="toolbar-btn-palette"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            title="Toggle Copilot Intelligence Panel"
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`p-1 hover:bg-slate-700 rounded transition cursor-pointer ${isCopilotOpen ? "text-amber-400" : "text-slate-400"}`}
            id="toolbar-btn-copilot"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Core Editor Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side File Explorer Sidebar */}
        {isSidebarOpen && (
          <div style={{ width: `${sidebarWidth}px` }} className="h-full flex flex-col shrink-0">
            <FileTree
              files={files}
              activeFilePath={activeFilePath}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
              onToggleFolder={handleToggleFolder}
            />
          </div>
        )}

        {/* Center Canvas Workspace PANE */}
        <div className={`flex-1 flex flex-col min-w-0 ${style.bg}`}>
          {/* Editor Header / Multi-Tabs */}
          <div className={`flex items-center ${style.tabsBg} border-b ${style.border} h-10 shrink-0 overflow-x-auto select-none custom-scrollbar`}>
            {openTabs.map(tabPath => {
              const tabObj = files.find(f => f.path === tabPath);
              const tabName = tabPath === "settings" ? "Settings" : (tabObj ? tabObj.name : tabPath.split("/").pop());
              const isActive = activeFilePath === tabPath;
              
              return (
                <div
                  key={tabPath}
                  onClick={() => setActiveFilePath(tabPath)}
                  className={`flex items-center px-4 h-full border-r ${style.border} cursor-pointer transition text-xs font-sans relative ${
                    isActive 
                      ? `${style.tabActiveBg} ${style.tabTextColor} border-t-2 ${style.tabActiveBorder} font-bold` 
                      : "text-slate-400 hover:text-slate-200 bg-slate-900/40"
                  }`}
                  id={`tab-handle-${tabPath.replace(/\//g, "-")}`}
                >
                  <span className="mr-2 truncate max-w-[120px]">{tabName}</span>
                  <button
                    onClick={(e) => handleCloseTab(tabPath, e)}
                    className="p-0.5 hover:bg-slate-700/60 rounded text-slate-500 hover:text-white transition"
                    id={`tab-close-btn-${tabPath.replace(/\//g, "-")}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {openTabs.length === 0 && (
              <div className="px-4 text-xs text-slate-500 italic select-none">
                No active buffers open
              </div>
            )}
          </div>

          {/* Active module selection renderer (Settings or Code-Editor) */}
          <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
            {activeFilePath === "settings" ? (
              <SettingsView
                theme={theme}
                setTheme={setTheme}
                packages={packages}
                onTogglePackage={handleTogglePackage}
                onInstallPackage={handleInstallPackage}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSize={fontSize}
                setFontSize={setFontSize}
                tabLength={tabLength}
                setTabLength={setTabLength}
                wordWrap={wordWrap}
                setWordWrap={setWordWrap}
              />
            ) : activeFile ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Find Replace Panel inside active file screen */}
                {findReplaceOpen && (
                  <FindReplace
                    options={findReplaceOptions}
                    setOptions={setFindReplaceOptions}
                    onFindNext={handleFindNext}
                    onReplace={handleReplace}
                    onReplaceAll={handleReplaceAll}
                    onClose={() => setFindReplaceOpen(false)}
                    matchCount={matchCount}
                  />
                )}

                {/* Sub Header indicators */}
                <div className={`px-4 py-1.5 ${style.sidebarBg}/60 border-b ${style.border} flex items-center justify-between text-[11px] text-slate-400 shrink-0 font-sans`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-[10px] text-emerald-400">
                      /{activeFile.name}
                    </span>
                    <span>• {activeFile.content.length.toLocaleString()} characters</span>
                    <span>• {activeFile.content.split("\n").length} rows</span>

                    {/* Editor Mode Selector */}
                    <div className="flex items-center space-x-1 pl-3 border-l border-slate-850/80 ml-3 shrink-0">
                      <button
                        onClick={() => setEditorMode("text")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                          editorMode === "text" 
                            ? "bg-slate-800/90 text-sky-400 border border-slate-700/50" 
                            : "hover:bg-slate-800/40 text-slate-500"
                        }`}
                        title="Display raw text/source code with syntax colors"
                      >
                        <FileCode className="w-3 h-3" />
                        <span>Text Editor</span>
                      </button>
                      
                      <button
                        onClick={() => setEditorMode("hex")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                          editorMode === "hex" 
                            ? "bg-slate-800/90 text-yellow-500 border border-slate-700/50" 
                            : "hover:bg-slate-800/40 text-slate-500"
                        }`}
                        title="Inspect file as raw hexadecimal byte array blocks using Binary Hex Editor"
                      >
                        <Binary className="w-3 h-3" />
                        <span>Hex Editor</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-500">
                    <button 
                      onClick={handleFormatCode}
                      className="hover:text-amber-300 font-semibold cursor-pointer flex items-center space-x-1"
                      title="Run quick eslint format cleanup"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Smart Format</span>
                    </button>
                  </div>
                </div>

                {/* Integrated custom editor screen */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Number lines helper gutter */}
                  {editorMode === "text" && (
                    <div className={`w-12 pt-4 px-2 select-none text-right font-mono text-[11px] leading-relaxed shrink-0 border-r ${style.border} bg-[#282c34]/20 text-slate-600`}>
                      {activeFile.content.split("\n").map((_, i) => (
                        <div key={i} className="h-5 overflow-hidden">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Standard user input textarea with Atom styled fonts */}
                  <div className="flex-1 relative min-w-0">
                    {editorMode === "hex" ? (
                      <HexEditor
                        value={activeFile.content}
                        onChange={handleContentChange}
                        theme={theme}
                        style={style}
                        fileName={activeFile.name}
                      />
                    ) : (
                      <HighlightedEditor
                        value={activeFile.content}
                        onChange={handleContentChange}
                        onSelect={handleTextareaSelect}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        tabLength={tabLength}
                        wordWrap={wordWrap}
                        theme={theme}
                        style={style}
                        textareaRef={textareaRef}
                        fileName={activeFile.name}
                      />
                    )}
                  </div>
                </div>

                {/* Diagnostics and linter pane */}
                {diagnosticsOpen && diagnostics.length > 0 && (
                  <div className={`h-40 border-t ${style.border} bg-slate-950/90 text-slate-300 flex flex-col font-sans shrink-0`}>
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                          ESLint Audit Warnings
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {diagnostics.length} issues highlighted in active coding screen
                        </span>
                      </div>
                      <button
                        onClick={() => setDiagnosticsOpen(false)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {diagnostics.map((diag, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded text-xs gap-3 font-sans"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            {diag.severity === "error" ? (
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            <span className="font-mono text-slate-500 shrink-0">Line {diag.line}:</span>
                            <span className="text-slate-300 truncate font-semibold">{diag.message}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0 rounded font-bold font-mono uppercase">{diag.source}</span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => {
                                // Scroll cursor to line
                                const textarea = textareaRef.current;
                                if (textarea) {
                                  textarea.focus();
                                  const lines = activeFile.content.split("\n");
                                  let charIndex = 0;
                                  for (let i = 0; i < Math.min(diag.line - 1, lines.length); i++) {
                                    charIndex += lines[i].length + 1;
                                  }
                                  textarea.setSelectionRange(charIndex, charIndex + (lines[diag.line - 1]?.length || 0));
                                }
                              }}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold select-none cursor-pointer"
                            >
                              Go to Line
                            </button>
                            <button
                              onClick={() => handleAutoFixDiagnostic(diag)}
                              className="px-2 py-0.5 bg-[#528bff] hover:bg-blue-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 select-none cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>AI FIX</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#282c34]/20 select-none font-sans">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-4xl mb-4 text-slate-500">
                  ⚛️
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Buffers Active</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                  Open files from your workspace sidebar, or explore package extensions.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => openFileOrConfig("settings")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded text-xs transition font-semibold"
                  >
                    Open Settings Panel
                  </button>
                  <button
                    onClick={() => setCommandPaletteOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded text-xs transition font-semibold"
                  >
                    Trigger Command Finder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side AI Copilot / Co-authors Collaboration Panel */}
        {isCopilotOpen && (
          <div style={{ width: `${copilotWidth}px` }} className="border-l border-[#181a1f] bg-[#21252b] flex flex-col h-full shrink-0 font-sans">
            {/* Header branding */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#181a1f] bg-[#21252b]">
              <div className="flex items-center space-x-2 text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Atom Peer Studio</span>
              </div>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="p-1 hover:bg-slate-700/60 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sub Tabs Selector */}
            <div className="flex border-b border-[#181a1f] bg-slate-950 text-[10px] font-mono leading-none select-none">
              <button
                type="button"
                onClick={() => setActiveCopilotTab("ai")}
                className={`flex-1 py-2.5 text-center transition tracking-wider ${
                  activeCopilotTab === "ai"
                    ? "text-amber-400 bg-[#1e2229] font-bold border-b-2 border-amber-400"
                    : "text-slate-500 hover:text-slate-300 bg-[#21252b]/50"
                }`}
              >
                🤖 COPILOT AI
              </button>
              <button
                type="button"
                onClick={() => setActiveCopilotTab("peers")}
                className={`flex-1 py-2.5 text-center transition tracking-wider flex items-center justify-center space-x-1 ${
                  activeCopilotTab === "peers"
                    ? "text-blue-400 bg-[#1e2229] font-bold border-b-2 border-blue-400"
                    : "text-slate-500 hover:text-slate-300 bg-[#21252b]/50"
                }`}
              >
                <span>👥 SECURE PEERS</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[8px] text-slate-300 font-bold border border-slate-700">
                  {collaborativeUsers.length + 1}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCopilotTab("github")}
                className={`flex-1 py-2.5 text-center transition tracking-wider flex items-center justify-center space-x-1 ${
                  activeCopilotTab === "github"
                    ? "text-emerald-400 bg-[#1e2229] font-bold border-b-2 border-emerald-400"
                    : "text-slate-500 hover:text-slate-300 bg-[#21252b]/50"
                }`}
              >
                <span>🐙 GITHUB</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCopilotTab("circuitpython");
                  setCopilotWidth(360); // expand sidebar dynamically for visualizer UI
                }}
                className={`flex-1 py-2.5 text-center transition tracking-wider flex items-center justify-center space-x-1 ${
                  activeCopilotTab === "circuitpython"
                    ? "text-yellow-400 bg-[#1e2229] font-bold border-b-2 border-yellow-400"
                    : "text-slate-500 hover:text-slate-300 bg-[#21252b]/50"
                }`}
              >
                <span>⚡ CIRCUITPY</span>
              </button>
            </div>

            {/* TAB CONTENTS BRANDED AND SPACED ACCORDING TO DESIGN PRINCIPLES */}
            {activeCopilotTab === "ai" && (
              <>
                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar bg-[#1e2229]">
                  {copilotMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex flex-col space-y-1 ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">
                        {msg.role === "user" ? "YOU" : "ATOM COPILOT"}
                      </span>
                      <div 
                        className={`p-3 rounded-lg text-xs leading-relaxed max-w-[95%] shadow-sm ${
                          msg.role === "user" 
                            ? "bg-blue-600/95 text-white" 
                            : "bg-[#282c34] text-slate-300 border border-slate-800"
                        }`}
                      >
                        {/* Render helper text line-by-line supporting simple code markdown highlight */}
                        {msg.content.split("\n").map((line, lineIdx) => {
                          if (line.startsWith("###")) {
                            return <h4 key={lineIdx} className="font-bold text-white mt-2 first:mt-0 mb-1">{line.slice(3).trim()}</h4>;
                          }
                          if (line.startsWith("```")) {
                            return null; // drop markdown blocks block wrapper inside text rendering
                          }
                          if (line.startsWith("- ")) {
                            return <li key={lineIdx} className="ml-3 list-disc my-0.5">{line.slice(2)}</li>;
                          }
                          return <p key={lineIdx} className="my-1 first:mt-0 break-words">{line}</p>;
                        })}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center space-x-2 text-xs text-slate-400 animate-pulse py-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                      <span>Gemini is synthesizing code...</span>
                    </div>
                  )}
                </div>

                {/* Highlighted text warning indicator */}
                {selectedCodeSegment && (
                  <div className="bg-slate-900 border-t border-[#181a1f] p-2 text-[10px] text-amber-300 leading-normal font-sans">
                    💡 Selected <strong className="font-mono text-white">{selectedCodeSegment.length} chars</strong> will be included in the next inquiry context.
                  </div>
                )}

                {/* Input box */}
                <form onSubmit={handleSendCopilotMessage} className="p-2 border-t border-[#181a1f] bg-[#21252b]">
                  <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
                    <input
                      type="text"
                      placeholder="Ask Gemini code advice..."
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      className="w-full bg-transparent text-xs text-white px-2 py-1 outline-none"
                      id="copilot-input-box"
                    />
                    <button
                      type="submit"
                      disabled={isAiLoading || !copilotInput.trim()}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-1.5 rounded-md transition select-none shrink-0 disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
                      id="copilot-btn-submit"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeCopilotTab === "peers" && (
              // PEER CLOUD COLLABORATION CHANNEL MODE
              <div className="flex-1 flex flex-col min-h-0 bg-[#1e2229]">
                {/* Peer presence status bar */}
                <div className="p-3 bg-slate-950 border-b border-slate-800 select-none">
                  <div className="flex items-center justify-between text-[11px] mb-2 font-semibold">
                    <span className="text-slate-400 font-mono">MY PAIR PROFILE:</span>
                    <span className="text-emerald-400 text-[10px] font-mono select-none">ID: {myUserId}</span>
                  </div>

                  {/* Profile Edit Row */}
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-xs font-bold text-white flex items-center justify-center shrink-0">
                      {myUsername.substring(0, 2).toUpperCase()}
                    </div>
                    {isEditingUsername ? (
                      <div className="flex items-center space-x-1.5 flex-1">
                        <input
                          type="text"
                          value={myUsername}
                          onChange={(e) => setMyUsername(e.target.value)}
                          maxLength={20}
                          className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-xs text-white px-2 py-1 rounded outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setIsEditingUsername(false);
                          }}
                        />
                        <button
                          onClick={() => setIsEditingUsername(false)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">{myUsername}</span>
                        <button
                          onClick={() => setIsEditingUsername(true)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 underline font-mono cursor-pointer"
                        >
                          Customize
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connected Roster */}
                <div className="p-2 border-b border-slate-800 text-[10px] text-slate-500 font-mono uppercase bg-slate-900/40">
                  CO-AUTHOR DIRECTORY ({collaborativeUsers.length + 1} ONLINE)
                </div>

                <div className="max-h-48 overflow-y-auto custom-scrollbar p-2.5 space-y-1.5 border-b border-slate-850">
                  {/* Current client */}
                  <div className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/20 text-xs transition">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                      <span className="font-semibold text-white truncate">{myUsername} <span className="text-[10px] text-slate-500 font-normal">(Me)</span></span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                      {activeFilePath === "settings" ? "Settings" : (activeFile ? `/${activeFile.name}` : "Standby")}
                    </span>
                  </div>

                  {/* Remote clients */}
                  {collaborativeUsers.map(peer => (
                    <div 
                      key={peer.id} 
                      onClick={() => peer.filePath && handleSelectFile(peer.filePath)}
                      className={`flex items-center justify-between p-1.5 rounded hover:bg-slate-800/40 text-xs cursor-pointer transition border border-transparent hover:border-slate-800 ${
                        peer.filePath ? "border-slate-800/30 bg-slate-900/10" : ""
                      }`}
                      title={peer.filePath ? `Click to open active file Buffer: ${peer.filePath}` : "Co-author active"}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: peer.color }} />
                        <span className="font-semibold text-slate-200 truncate">{peer.name}</span>
                      </div>
                      <span className="text-[10px] text-indigo-400 hover:underline font-mono truncate max-w-[100px]">
                        {peer.filePath ? peer.filePath.split("/").pop() : "Standby"}
                      </span>
                    </div>
                  ))}

                  {collaborativeUsers.length === 0 && (
                    <div className="text-[10px] text-slate-500 italic p-1.5 select-none">
                      No other co-authors editing currently. Open a new preview browser tab to pairing-code in real-time!
                    </div>
                  )}
                </div>

                {/* Peer Group Chat Room Frame */}
                <div className="p-2 bg-slate-900/60 border-b border-slate-800 text-[10px] text-slate-500 font-mono uppercase">
                  CO-CODER STUDIO CHAT
                </div>

                {/* Messages history */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-slate-950/20 flex flex-col justify-end">
                  {chatMessages.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic text-center py-6 select-none leading-relaxed">
                      💬 Group pipeline established.<br />Post questions or status updates below for team co-coding logs!
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 max-h-full">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className="text-xs flex flex-col bg-slate-900/30 p-2 rounded border border-slate-900">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold pr-2" style={{ color: msg.color }}>
                              {msg.sender}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-300 break-words leading-snug">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sender form */}
                <form onSubmit={handleSendChatMessage} className="p-2 border-t border-slate-800 bg-slate-900/80 shrink-0">
                  <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded border border-slate-750">
                    <input
                      type="text"
                      placeholder="Type co-coder notes..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-200 px-2 py-1 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold select-none cursor-pointer disabled:opacity-40"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeCopilotTab === "github" && (
              // ========= GITHUB CONTROL PANEL VIEW =========
              <div className="flex-1 flex flex-col min-h-0 bg-[#1e2229] overflow-y-auto custom-scrollbar">
                {/* Warning message notification banner */}
                {githubStatusMsg && (
                  <div className={`p-3 text-[11px] font-sans flex items-start space-x-2 border-b select-none shrink-0 ${
                    githubStatusMsg.type === "success" ? "bg-emerald-950/80 text-emerald-300 border-emerald-900" :
                    githubStatusMsg.type === "error" ? "bg-rose-950/80 text-rose-300 border-rose-900" :
                    "bg-slate-900 text-sky-300 border-slate-850"
                  }`}>
                    <span className="w-1.5 h-1.5 bg-current rounded-full mt-1.5 shrink-0" />
                    <span className="flex-1 leading-normal">{githubStatusMsg.text}</span>
                    <button 
                      onClick={() => setGithubStatusMsg(null)}
                      className="text-slate-400 hover:text-white font-bold cursor-pointer transition select-none"
                    >
                      ×
                    </button>
                  </div>
                )}

                {!githubToken ? (
                  // NOT CONNECTED VIEW
                  <div className="p-4 space-y-4">
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 mb-2 border border-slate-800">
                        <Github className="w-6 h-6" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Connect GitHub Profile</h3>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal max-w-[220px]">
                        Publish active project code directly to public/secret repositories or publish gists from your editor panel.
                      </p>
                      
                      <button
                        onClick={handleConnectGitHub}
                        disabled={githubLoading}
                        className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-[11px] rounded transition flex items-center justify-center space-x-2 select-none cursor-pointer"
                      >
                        {githubLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>CONNECTING...</span>
                          </>
                        ) : (
                          <>
                            <Github className="w-3.5 h-3.5 fill-current" />
                            <span>CONNECT GITHUB ACCOUNT</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step-by-Step credential checklist */}
                    <div className="bg-slate-900/30 p-3.5 rounded-lg border border-slate-850/60 text-[11px] text-slate-400 leading-relaxed font-sans space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider font-semibold">🛠️ Real vs Demo Mode</span>
                      <p>
                        If your AI Studio Secrets are missing <strong className="text-slate-200 font-mono">GITHUB_CLIENT_ID</strong>, clicking connect operates safely in a high-fidelity <strong>Demo Sandbox Mode</strong>.
                      </p>
                      <hr className="border-slate-800" />
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider font-semibold">🔒 Real Connection Setup:</span>
                      <ol className="list-decimal pl-4.5 space-y-1">
                        <li>Register an OAuth app in GitHub settings.</li>
                        <li>Set Callback URL to match your app domain Callback path.</li>
                        <li>Verify credentials inside AI Studio Secrets panel.</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  // SUCCESSFULLY CONNECTED VIEW WITH REPO & GIST CONTROLS
                  <div className="flex-1 flex flex-col min-h-0 divide-y divide-[#181a1f]">
                    {/* Logged user profile badge */}
                    <div className="p-3 bg-slate-950/60 shrink-0 flex items-center justify-between">
                      {githubUser ? (
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <img 
                            src={githubUser.avatar_url} 
                            alt="GitHub User Avatar" 
                            className="w-8 h-8 rounded-full border border-slate-800 shrink-0 select-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-100 truncate">{githubUser.name || githubUser.login}</h4>
                            <p className="text-[10px] font-mono text-slate-400 truncate">@{githubUser.login}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-slate-800" />
                          <div className="space-y-1">
                            <div className="w-20 h-2 bg-slate-800 rounded" />
                            <div className="w-12 h-1.5 bg-slate-800 rounded" />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleDisconnectGitHub}
                        className="text-[10px] bg-slate-905 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-1 text-slate-400 hover:text-rose-400 font-semibold rounded transition cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>

                    {/* Module Push Panel to write files to repos */}
                    <div className="p-3.5 space-y-3.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 select-none uppercase font-bold tracking-wider font-semibold">
                        <span>🐙 COMMIT & PUSH BUFFER</span>
                        {githubLoading && <RefreshCw className="w-3" />}
                      </div>

                      {/* Dropdown repositories selectors */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-300 font-sans block font-semibold select-none">Select Target Repository:</label>
                        <select
                          value={selectedRepo}
                          onChange={(e) => setSelectedRepo(e.target.value)}
                          disabled={githubRepos.length === 0 || githubLoading}
                          className="w-full bg-slate-950 border border-slate-800 py-1.5 px-2.5 rounded text-xs text-slate-200 outline-none select-none disabled:opacity-50"
                        >
                          {githubRepos.length === 0 ? (
                            <option>No repositories found</option>
                          ) : (
                            githubRepos.map(repo => (
                              <option key={repo.id} value={repo.full_name}>
                                {repo.full_name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Active File and Branch Configs inside grid fields */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block select-none">Active File:</label>
                          <div className="bg-slate-950/60 p-1.5 border border-slate-850/80 rounded leading-none text-slate-200 truncate mt-1">
                            {activeFile ? activeFile.name : "(none)"}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono block select-none">Target Branch:</label>
                          <input
                            type="text"
                            value={repoBranch}
                            onChange={(e) => setRepoBranch(e.target.value)}
                            disabled={githubLoading}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-200 outline-none truncate mt-1"
                          />
                        </div>
                      </div>

                      {/* Custom Commit message inputs */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-sans block font-semibold select-none">Commit Message:</label>
                        <input
                          type="text"
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          disabled={githubLoading}
                          className="w-full bg-slate-950 border border-slate-800 rounded py-1.5 px-2.5 text-xs text-slate-200 outline-none"
                        />
                      </div>

                      {/* Push Trigger Button */}
                      <button
                        onClick={handlePushActiveFile}
                        disabled={githubLoading || !activeFile || activeFile.isFolder || !selectedRepo}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded text-xs font-mono font-bold select-none cursor-pointer flex items-center justify-center space-x-1.5 shadow"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>STAGE & PUSH TO GITHUB</span>
                      </button>
                    </div>

                    {/* Module 2: Share and publish single file Gist */}
                    <div className="p-3.5 space-y-3.5 bg-slate-900/10">
                      <div className="text-[10px] font-mono text-slate-400 select-none uppercase font-bold tracking-wider block font-semibold">
                        <span>SHARES & PUBLIC GISTS</span>
                      </div>

                      <div className="bg-slate-950/35 p-2.5 rounded border border-slate-850/55 flex items-center justify-between font-sans">
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                            {gistPublic ? <Globe className="w-3 h-3 text-sky-400" /> : <Lock className="w-3 h-3 text-slate-500" />}
                            {gistPublic ? "Public Gist" : "Secret Gist"}
                          </span>
                          <p className="text-[10px] text-slate-100/50 select-none">Make code searchable on Gist index</p>
                        </div>

                        <button
                          onClick={() => setGistPublic(!gistPublic)}
                          className={`text-[10px] border px-2.5 py-1 font-mono rounded transition cursor-pointer font-bold ${
                            gistPublic 
                              ? "bg-slate-900 text-sky-400 border-sky-950 hover:bg-slate-850" 
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
                          }`}
                        >
                          Toggle
                        </button>
                      </div>

                      <button
                        onClick={handlePublishGist}
                        disabled={githubLoading || !activeFile || activeFile.isFolder}
                        className="w-full py-2 bg-[#2d333b] hover:bg-[#3c444d] border border-slate-705 text-slate-200 rounded text-xs font-mono font-bold select-none cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span>PUBLISH SINGLE-FILE GIST</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeCopilotTab === "circuitpython" && (
              <CircuitPythonConsole
                activeFile={activeFile}
                files={files}
                setFiles={setFiles}
                setActiveFilePath={setActiveFilePath}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Status Bar layout containing details exactly mirroring atom-clone style guide */}
      <div className={`flex items-center justify-between px-3 h-7 ${style.statusbarBg} border-t ${style.border} text-[11px] ${style.statusbarText} font-sans shrink-0`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 select-none">
            <span className="text-sky-400 font-mono">⎇</span>
            <span>main branch</span>
          </div>

          <button 
            onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
            className="flex items-center space-x-1.5 hover:text-white transition select-none cursor-pointer"
          >
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block animate-pulse"></span>
            <span className="font-semibold text-slate-300">{errorsCount} errors</span>
            <span>,</span>
            <span className="font-semibold text-slate-300">{warningsCount} warnings</span>
          </button>
        </div>

        <div className="flex items-center space-x-3.5">
          {activeFile && (
            <>
              <div>Line {editorCursor.line}, Col {editorCursor.col}</div>
              <div>UTF-8</div>
              <div className="px-2 bg-slate-800 text-slate-200. select-none font-semibold rounded shrink-0">
                {activeFile.name.split(".").pop()?.toUpperCase() || "TEXT"}
              </div>
            </>
          )}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="px-2.5 py-0.5 hover:bg-slate-700/50 bg-slate-800/80 rounded border border-slate-700/60 font-semibold cursor-pointer select-none"
          >
            ⌘ Shift P
          </button>
        </div>
      </div>

      {/* Global Command Palette Component */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        actions={getCommandPaletteActions()}
      />
    </div>
  );
}
