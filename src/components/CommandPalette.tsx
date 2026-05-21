import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { CommandPaletteAction } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // focus input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset indices on search change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  const filtered = actions.filter(action => 
    action.name.toLowerCase().includes(search.toLowerCase()) ||
    action.group.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-[15vh] z-50">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-[#21252b] border border-[#181a1f] shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        id="atom-command-palette"
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3 bg-[#282c34] border-b border-[#181a1f]">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search command panel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-sans text-sm focus:outline-none"
            id="palette-search-input"
          />
        </div>

        {/* Action list */}
        <div className="max-h-[300px] overflow-y-auto py-1.5 bg-[#21252b] custom-scrollbar">
          {filtered.map((action, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={action.id}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer font-sans transition-all text-xs ${
                  isSelected 
                    ? "bg-[#313640] text-blue-400" 
                    : "text-slate-300 hover:bg-[#282c34]"
                }`}
                id={`palette-action-${action.id}`}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider font-mono">
                    {action.group}
                  </span>
                  <span className="font-medium text-slate-200">{action.name}</span>
                </div>
                {action.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-md shadow-xs select-none">
                    {action.shortcut}
                  </kbd>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-500 text-xs">
              No matching commands. Try "Editor" or "Theme".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#1b1d23] border-t border-[#181a1f] flex items-center justify-between text-[10px] text-slate-500 font-sans">
          <span>Use <span className="font-semibold text-slate-400">↑↓</span> to navigate, <span className="font-semibold text-slate-400">Enter</span> to select</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
