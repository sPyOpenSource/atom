import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Search, 
  Settings, 
  Sliders, 
  Database,
  Cpu,
  RefreshCw,
  HelpCircle,
  FileCode,
  Sparkles,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { AtomTheme } from "../types";

interface HexEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  theme: AtomTheme;
  style: any;
  fileName: string;
}

export default function HexEditor({
  value,
  onChange,
  theme,
  style,
  fileName
}: HexEditorProps) {
  // Convert standard string code to raw bytes
  const bytes = useMemo(() => {
    const arr = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i++) {
      arr[i] = value.charCodeAt(i) & 0xff;
    }
    return arr;
  }, [value]);

  // Pointer position index in range 0 -> bytes.length - 1
  const [cursorIdx, setCursorIdx] = useState<number | null>(null);
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"text" | "hex">("text");
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [searchStatus, setSearchStatus] = useState<string>("");

  // Edit byte inputs states
  const [hexInput, setHexInput] = useState<string>("");
  const [decInput, setDecInput] = useState<string>("");
  const [charInput, setCharInput] = useState<string>("");

  // Hover index for dual cell highlighting UX
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Sync edit block inputs whenever the active selected byte changes
  useEffect(() => {
    if (cursorIdx !== null && cursorIdx < bytes.length) {
      const b = bytes[cursorIdx];
      setHexInput(b.toString(16).toUpperCase().padStart(2, "0"));
      setDecInput(b.toString(10));
      const chr = String.fromCharCode(b);
      setCharInput(b >= 32 && b <= 126 ? chr : ".");
    } else {
      setHexInput("");
      setDecInput("");
      setCharInput("");
    }
  }, [cursorIdx, bytes]);

  // Save the modified Uint8Array back to App workspace string state
  const saveBytes = (updatedBytes: Uint8Array) => {
    let content = "";
    const chunk_size = 8192;
    for (let i = 0; i < updatedBytes.length; i += chunk_size) {
      const chunk = updatedBytes.subarray(i, i + chunk_size);
      content += String.fromCharCode(...Array.from(chunk));
    }
    onChange(content);
  };

  // Modify single byte at direct index
  const modifyByteAt = (index: number, byteValue: number) => {
    if (index < 0 || index >= bytes.length) return;
    const clamped = Math.max(0, Math.min(255, byteValue));
    const newBytes = new Uint8Array(bytes);
    newBytes[index] = clamped;
    saveBytes(newBytes);
  };

  // Insert byte zero at current point
  const handleInsertByte = () => {
    const targetIdx = cursorIdx !== null ? cursorIdx : bytes.length;
    const newBytes = new Uint8Array(bytes.length + 1);
    
    // Copy slices around insertion point
    newBytes.set(bytes.subarray(0, targetIdx), 0);
    newBytes[targetIdx] = 0x00; // insert empty byte
    newBytes.set(bytes.subarray(targetIdx), targetIdx + 1);

    saveBytes(newBytes);
    setCursorIdx(targetIdx);
  };

  // Delete byte at current cursor
  const handleDeleteByte = () => {
    if (cursorIdx === null || bytes.length === 0) return;
    const newBytes = new Uint8Array(bytes.length - 1);
    
    newBytes.set(bytes.subarray(0, cursorIdx), 0);
    newBytes.set(bytes.subarray(cursorIdx + 1), cursorIdx);

    saveBytes(newBytes);
    
    if (newBytes.length === 0) {
      setCursorIdx(null);
    } else if (cursorIdx >= newBytes.length) {
      setCursorIdx(newBytes.length - 1);
    }
  };

  // Preset payload generator helpers for binary testing
  const buildBinaryPreset = (type: "wasm" | "png" | "elf" | "zeros" | "noise") => {
    let preset: Uint8Array;
    switch (type) {
      case "wasm":
        // WebAssembly v1 Magic: \0asm \x01\x00\x00\x00
        preset = new Uint8Array([
          0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, // Header
          0x01, 0x08, 0x01, 0x60, 0x00, 0x01, 0x7F, 0x03, // Type & Function section
          0x02, 0x01, 0x00, 0x07, 0x0A, 0x01, 0x06, 0x6D, // Export section
          0x61, 0x69, 0x6E, 0x00, 0x00, 0x0A, 0x09, 0x01, // Code section
          0x07, 0x00, 0x41, 0x2A, 0x0B                          // return 42
        ]);
        break;
      case "png":
        // PNG Header standard signature
        preset = new Uint8Array([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // .PNG\r\n\x1a\n
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR segment
          0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, // width/height
          0x08, 0x06, 0x00, 0x00, 0x00, 0x5C, 0x72, 0xA8, // depth / colors
          0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND segment
          0xAE, 0x42, 0x60, 0x82
        ]);
        break;
      case "elf":
        // ELF Header standard signature
        preset = new Uint8Array([
          0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00, // Magic + ELF64
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x02, 0x00, 0x3E, 0x00, 0x01, 0x00, 0x00, 0x00, // Executable (AMD x86-64)
          0x78, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, // Entry point address
          0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        break;
      case "zeros":
        preset = new Uint8Array(128).fill(0);
        break;
      case "noise":
        preset = new Uint8Array(128);
        for (let i = 0; i < preset.length; i++) {
          preset[i] = Math.floor(Math.random() * 256);
        }
        break;
    }

    saveBytes(preset);
    setCursorIdx(0);
  };

  // Perform byte pattern scanning
  const executeSearch = () => {
    setHighlightedIndices([]);
    if (!searchQuery.trim()) {
      setSearchStatus("Please specify search query");
      return;
    }

    const matches: number[] = [];
    if (searchType === "text") {
      // Find text occurrence
      const q = searchQuery;
      for (let i = 0; i < bytes.length - q.length + 1; i++) {
        let match = true;
        for (let j = 0; j < q.length; j++) {
          if (bytes[i + j] !== q.charCodeAt(j)) {
            match = false;
            break;
          }
        }
        if (match) {
          matches.push(i);
        }
      }
    } else {
      // Find Hex Byte pairs e.g "EA 00", "FF"
      // Cleanup string content
      const hexPairs = searchQuery.replace(/\s+/g, "").toUpperCase();
      if (hexPairs.length % 2 !== 0) {
        setSearchStatus("Hex sequence must be pairs of 2 characters (e.g. 4F or FF 0F)");
        return;
      }
      
      const searchBytes: number[] = [];
      for (let i = 0; i < hexPairs.length; i += 2) {
        const val = parseInt(hexPairs.substr(i, 2), 16);
        if (isNaN(val)) {
          setSearchStatus("Invalid hex symbols");
          return;
        }
        searchBytes.push(val);
      }

      for (let i = 0; i < bytes.length - searchBytes.length + 1; i++) {
        let match = true;
        for (let j = 0; j < searchBytes.length; j++) {
          if (bytes[i + j] !== searchBytes[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          matches.push(i);
        }
      }
    }

    setHighlightedIndices(matches);
    if (matches.length > 0) {
      setSearchStatus(`Found ${matches.length} active instances of '${searchQuery}'`);
      setCursorIdx(matches[0]); // auto jump to first match
    } else {
      setSearchStatus("Pattern not found in address bytes.");
    }
  };

  // Formatter for addresses
  const formatOffset = (offset: number) => {
    return offset.toString(16).toUpperCase().padStart(8, "0");
  };

  // Render hex representation blocks of 16-bytes
  const rows: Array<{ offset: number; data: Uint8Array }> = [];
  for (let i = 0; i < bytes.length; i += 16) {
    rows.push({
      offset: i,
      data: bytes.subarray(i, i + 16)
    });
  }

  // Struct Decoder helpers of current cursor point
  const readStruct = () => {
    if (cursorIdx === null) return null;
    const view = new DataView(bytes.buffer);
    const hasSingleByte = cursorIdx < bytes.length;
    const has2Bytes = cursorIdx + 1 < bytes.length;
    const has4Bytes = cursorIdx + 3 < bytes.length;

    return {
      uint8: hasSingleByte ? view.getUint8(cursorIdx) : null,
      int8: hasSingleByte ? view.getInt8(cursorIdx) : null,
      uint16LE: has2Bytes ? view.getUint16(cursorIdx, true) : null,
      uint16BE: has2Bytes ? view.getUint16(cursorIdx, false) : null,
      int16LE: has2Bytes ? view.getInt16(cursorIdx, true) : null,
      int16BE: has2Bytes ? view.getInt16(cursorIdx, false) : null,
      uint32LE: has4Bytes ? view.getUint32(cursorIdx, true) : null,
      uint32BE: has4Bytes ? view.getUint32(cursorIdx, false) : null,
      int32LE: has4Bytes ? view.getInt32(cursorIdx, true) : null,
      int32BE: has4Bytes ? view.getInt32(cursorIdx, false) : null,
      float32LE: has4Bytes ? view.getFloat32(cursorIdx, true) : null,
      float32BE: has4Bytes ? view.getFloat32(cursorIdx, false) : null,
    };
  };

  const struct = useMemo(() => readStruct(), [cursorIdx, bytes]);

  // Handle direct key capture for hex input field changes
  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    if (cursorIdx !== null && val.length === 2) {
      const num = parseInt(val, 16);
      if (!isNaN(num)) {
        modifyByteAt(cursorIdx, num);
      }
    }
  };

  const handleDecInputChange = (val: string) => {
    setDecInput(val);
    if (cursorIdx !== null && val.trim() !== "") {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 255) {
        modifyByteAt(cursorIdx, num);
      }
    }
  };

  const handleCharInputChange = (val: string) => {
    setCharInput(val);
    if (cursorIdx !== null && val.length > 0) {
      const charCode = val.charCodeAt(0);
      modifyByteAt(cursorIdx, charCode);
    }
  };

  return (
    <div className="flex-1 flex max-h-full font-mono text-[12px] bg-slate-950 text-slate-300 divide-x divide-slate-800" id="hex-editor-wrapper">
      
      {/* LEFT/CENTER: The main scrollable hex sheet */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-4 bg-[#1e2229]/20 select-none">
        
        {/* Help disclaimer card */}
        <div className="mb-4 bg-slate-900/60 border border-slate-800 p-2.5 rounded flex items-start gap-2.5">
          <Database className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              Atom Binary Inspector Mode
            </span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Click individual cells to reveal decoded data segments, values, and structs. Modify selected elements directly inside the sidebar. Use preset loaders to experiment with file signatures!
            </p>
          </div>
        </div>

        {/* Matrix Header Columns */}
        <div className="flex pb-2.5 border-b border-slate-900/80 mb-2 font-bold tracking-wider text-slate-500 text-[10px] shrink-0">
          <div className="w-24">OFFSET</div>
          <div className="flex-1 flex gap-2">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className={`w-6.5 text-center ${i === 8 ? "pl-2 border-l border-slate-900" : ""}`}
              >
                {i.toString(16).toUpperCase().padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className="w-40 pl-4 border-l border-slate-900">DECODED TEXT ASCII</div>
        </div>

        {/* Rows of Hex */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {rows.length === 0 ? (
            <div className="text-center py-12 text-slate-600 italic">
              Empty binary workspace structure.
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.offset} className="flex items-center hover:bg-slate-900/20 py-0.5 rounded leading-none">
                {/* 1. Address column */}
                <div className="w-24 text-slate-500 font-bold tracking-wide select-none">
                  {formatOffset(row.offset)}
                </div>

                {/* 2. Sixteen hex cells */}
                <div className="flex-1 flex gap-2 font-extrabold select-all">
                  {[...Array(16)].map((_, colIdx) => {
                    const cellIdx = row.offset + colIdx;
                    const exists = cellIdx < bytes.length;
                    const b = exists ? row.data[colIdx] : null;
                    const isSelected = cursorIdx === cellIdx;
                    const isHighlighted = highlightedIndices.some(idx => cellIdx >= idx && cellIdx < idx + (searchType === "text" ? searchQuery.length : searchQuery.replace(/\s+/g, "").length / 2));
                    const isHovered = hoverIndex === cellIdx;

                    if (b === null) {
                      return <div key={colIdx} className="w-6.5 select-none" />; // Pad missing
                    }

                    return (
                      <div
                        key={colIdx}
                        onClick={() => setCursorIdx(cellIdx)}
                        onMouseEnter={() => setHoverIndex(cellIdx)}
                        onMouseLeave={() => setHoverIndex(null)}
                        className={`w-6.5 text-center py-0.5 rounded cursor-pointer transition select-text leading-none font-mono ${
                          isSelected
                            ? "bg-yellow-500 text-slate-950 font-black shadow-md ring-1 ring-yellow-400"
                            : isHighlighted
                            ? "bg-sky-950 text-sky-300 ring-1 ring-sky-700/50"
                            : isHovered
                            ? "bg-slate-800 text-white"
                            : b === 0
                            ? "text-slate-700" // dull empty space zeros
                            : "text-slate-300 hover:text-white"
                        } ${colIdx === 8 ? "pl-2 border-l border-slate-900" : ""}`}
                        title={`Offset: 0x${cellIdx.toString(16).toUpperCase()} (${cellIdx}) \nValue: 0x${b.toString(16).toUpperCase().padStart(2, "0")} (${b})`}
                      >
                        {b.toString(16).toUpperCase().padStart(2, "0")}
                      </div>
                    );
                  })}
                </div>

                {/* 3. Text ASCII Columns preview */}
                <div className="w-40 pl-4 border-l border-slate-900/60 flex items-center gap-0.5 text-slate-400">
                  {[...Array(16)].map((_, colIdx) => {
                    const cellIdx = row.offset + colIdx;
                    const exists = cellIdx < bytes.length;
                    const b = exists ? row.data[colIdx] : null;
                    const isSelected = cursorIdx === cellIdx;
                    const isHovered = hoverIndex === cellIdx;

                    if (b === null) return <div key={colIdx} className="w-2.5" />;

                    // Determine visual ASCII representation character
                    const representation = b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
                    return (
                      <span
                        key={colIdx}
                        onClick={() => setCursorIdx(cellIdx)}
                        onMouseEnter={() => setHoverIndex(cellIdx)}
                        onMouseLeave={() => setHoverIndex(null)}
                        className={`w-2.5 text-center cursor-pointer transition select-text font-mono hover:bg-slate-800 rounded font-semibold ${
                          isSelected 
                            ? "text-yellow-400 font-bold scale-110" 
                            : isHovered 
                            ? "text-white bg-slate-800" 
                            : b >= 32 && b <= 126 
                            ? "text-slate-300" 
                            : "text-slate-650"
                        }`}
                      >
                        {representation}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Struct Inspector & Preset Controllers */}
      <div className="w-80 max-h-full overflow-y-auto p-4 bg-slate-900/60 flex flex-col space-y-4 shrink-0 font-sans custom-scrollbar" id="hex-sidebar-inspector">
        
        {/* Inspector info header */}
        <div className="space-y-1 bg-slate-900/80 p-3 rounded-lg border border-slate-800/60">
          <div className="flex items-center space-x-2 text-yellow-400 text-xs font-bold font-mono">
            <Sliders className="w-4 h-4" />
            <span>ELEMENTS INSPECTOR</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">TOTAL BYTES:</span>
              <span className="text-slate-300 font-bold">{bytes.length} bytes</span>
            </div>
            <div>
              <span className="text-slate-500 block">HEX SIZE:</span>
              <span className="text-slate-300 font-bold">0x{bytes.length.toString(16).toUpperCase()}</span>
            </div>
            {cursorIdx !== null && (
              <>
                <div>
                  <span className="text-slate-500 block">CURSOR DECIMAL:</span>
                  <span className="text-yellow-400 font-bold">{cursorIdx}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CURSOR HEX:</span>
                  <span className="text-yellow-400 font-bold">0x{cursorIdx.toString(16).toUpperCase()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Binary search parser widget */}
        <div className="space-y-2 bg-slate-955 p-3 rounded-lg border border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono leading-none">
            <Search className="w-3.5 h-3.5 text-sky-400" />
            Pattern scanner find
          </span>
          <div className="flex gap-1 bg-slate-950 p-1 rounded border border-slate-850">
            <button
              onClick={() => setSearchType("text")}
              className={`flex-1 py-1 text-[10px] rounded font-bold transition ${searchType === "text" ? "bg-slate-850 text-sky-400 font-bold" : "text-slate-500"}`}
            >
              ASCII TEXT
            </button>
            <button
              onClick={() => setSearchType("hex")}
              className={`flex-1 py-1 text-[10px] rounded font-bold transition ${searchType === "hex" ? "bg-slate-850 text-sky-400 font-bold" : "text-slate-500"}`}
            >
              HEX BYTES
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeSearch()}
              placeholder={searchType === "text" ? "e.g. README or index" : "e.g. 89 50 4E 47 or 00 FF"}
              className="flex-1 bg-slate-950 text-xs py-1 px-2 rounded border border-slate-800 text-slate-100 outline-none"
            />
            <button
              onClick={executeSearch}
              className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs transition cursor-pointer"
            >
              SCAN
            </button>
          </div>
          {searchStatus && (
            <div className="text-[10px] text-amber-500 bg-amber-970/10 p-1.5 rounded leading-normal font-mono border border-amber-900/30">
              {searchStatus}
            </div>
          )}
        </div>

        {/* 1. Modify Byte value inputs fields */}
        {cursorIdx !== null ? (
          <div className="space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                ✏️ EDIT ACTIVE BYTE
              </span>
              <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1 rounded">
                BYTE @ {cursorIdx}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">HEX (00-FF)</span>
                <input
                  type="text"
                  maxLength={2}
                  value={hexInput}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  className="w-full bg-slate-950 text-center text-yellow-500 font-bold border border-slate-800 py-1.5 rounded outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">DEC (0-255)</span>
                <input
                  type="text"
                  maxLength={3}
                  value={decInput}
                  onChange={(e) => handleDecInputChange(e.target.value)}
                  className="w-full bg-slate-950 text-center text-yellow-500 font-bold border border-slate-800 py-1.5 rounded outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">CHAR (1-char)</span>
                <input
                  type="text"
                  maxLength={1}
                  value={charInput}
                  onChange={(e) => handleCharInputChange(e.target.value)}
                  className="w-full bg-slate-950 text-center text-yellow-500 font-bold border border-slate-800 py-1.5 rounded outline-none"
                />
              </div>
            </div>

            {/* Quick offset buttons */}
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={handleInsertByte}
                className="flex-1 py-1 px-2 border border-slate-750 hover:bg-slate-800 text-[10px] font-bold text-slate-300 rounded flex items-center justify-center gap-1 transition cursor-pointer"
                title="Insert empty byte value 00 under current position"
              >
                <Plus className="w-3" />
                <span>INSERT ZERO</span>
              </button>

              <button
                onClick={handleDeleteByte}
                className="flex-1 py-1 px-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-900 text-[10px] font-bold text-rose-300 rounded flex items-center justify-center gap-1 transition cursor-pointer"
                title="Wipe byte out of stream files length"
              >
                <Trash2 className="w-3" />
                <span>DELETE</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/65 custom-border border border-dashed border-slate-800 rounded-lg text-center text-[11px] text-slate-500 italic block leading-relaxed select-none">
            No single address coordinate highlighted. Select a byte offset cell on the left column block to edit byte values directly!
          </div>
        )}

        {/* 2. Decoded Data Types Struct inspector panel */}
        {struct && (
          <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-xs font-bold text-slate-300 uppercase block border-b border-slate-850 pb-1 flex items-center gap-1 font-mono">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              STRUCT VALUES CODES
            </span>
            <div className="space-y-1 text-[11px] select-text">
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded">
                <span className="text-slate-500">Int 8-bit:</span>
                <span className="text-emerald-400 font-bold">{struct.int8}</span>
              </div>
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded">
                <span className="text-slate-500">uInt 8-bit:</span>
                <span className="text-emerald-400 font-bold">{struct.uint8}</span>
              </div>
              
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded border-t border-slate-900/40">
                <span className="text-slate-500">Int 16 (Little-Endian):</span>
                <span className="text-sky-400 font-bold">{struct.int16LE ?? "N/A"}</span>
              </div>
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded">
                <span className="text-slate-500">uInt 16 (Little-Endian):</span>
                <span className="text-sky-400 font-bold">{struct.uint16LE ?? "N/A"}</span>
              </div>
              
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded border-t border-slate-900/40">
                <span className="text-slate-500">Int 32 (Little-Endian):</span>
                <span className="text-purple-400 font-bold">{struct.int32LE ?? "N/A"}</span>
              </div>
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded">
                <span className="text-slate-500">uInt 32 (Little-Endian):</span>
                <span className="text-purple-400 font-bold">{struct.uint32LE ?? "N/A"}</span>
              </div>
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded">
                <span className="text-slate-500">Float 32 (Little-Endian):</span>
                <span className="text-yellow-400 font-bold">{struct.float32LE !== null ? struct.float32LE.toFixed(4) : "N/A"}</span>
              </div>
              
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded border-t border-slate-900/40">
                <span className="text-slate-500">Int 32 (Big-Endian):</span>
                <span className="text-slate-400 font-bold">{struct.int32BE ?? "N/A"}</span>
              </div>
              <div className="flex justify-between hover:bg-slate-950/45 px-1 py-0.5 rounded">
                <span className="text-slate-500">Float 32 (Big-Endian):</span>
                <span className="text-slate-400 font-bold">{struct.float32BE !== null ? struct.float32BE.toFixed(4) : "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Preset Binary payload creators for testing */}
        <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-sans">
          <span className="text-[11px] font-bold text-slate-300 uppercase block font-mono">
            🎁 PRESET SIGNATURE GENERATORS
          </span>
          <p className="text-[10px] text-slate-500 leading-normal">
            Quickly load simulated structured payloads for binary viewing:
          </p>

          <div className="flex flex-col gap-1.5 text-xs font-mono select-none">
            <button
              onClick={() => buildBinaryPreset("wasm")}
              className="w-full text-left py-1 px-2 rounded bg-slate-950/80 border border-slate-850 hover:border-yellow-500/40 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer"
            >
              <span>wasm-binary-signature</span>
              <span className="text-[9px] text-teal-400 font-bold">WASM</span>
            </button>

            <button
              onClick={() => buildBinaryPreset("png")}
              className="w-full text-left py-1 px-2 rounded bg-slate-950/80 border border-slate-850 hover:border-yellow-500/40 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer"
            >
              <span>standard-image-png</span>
              <span className="text-[9px] text-amber-500 font-bold">PNG</span>
            </button>

            <button
              onClick={() => buildBinaryPreset("elf")}
              className="w-full text-left py-1 px-2 rounded bg-slate-950/80 border border-slate-850 hover:border-yellow-500/40 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer"
            >
              <span>elf64-linux-signature</span>
              <span className="text-[9px] text-purple-400 font-bold">ELF</span>
            </button>

            <button
              onClick={() => buildBinaryPreset("zeros")}
              className="w-full text-left py-1 px-2 rounded bg-slate-950/80 border border-slate-850 hover:border-yellow-500/40 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer"
            >
              <span>fill-zero-bytes (128 bytes)</span>
              <span className="text-[9px] text-slate-500 font-bold">0x00</span>
            </button>

            <button
              onClick={() => buildBinaryPreset("noise")}
              className="w-full text-left py-1 px-2 rounded bg-slate-950/80 border border-slate-850 hover:border-yellow-500/40 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer"
            >
              <span>random-entropy-payload</span>
              <span className="text-[9px] text-slate-500 font-bold">RAND</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
