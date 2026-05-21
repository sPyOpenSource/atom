import React from "react";
import { X, Search, Replace, HelpCircle } from "lucide-react";
import { SearchOptions } from "../types";

interface FindReplaceProps {
  options: SearchOptions;
  setOptions: (opt: SearchOptions) => void;
  onFindNext: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
  matchCount: { current: number; total: number } | null;
}

export default function FindReplace({
  options,
  setOptions,
  onFindNext,
  onReplace,
  onReplaceAll,
  onClose,
  matchCount
}: FindReplaceProps) {
  return (
    <div 
      className="bg-[#21252b] border-t border-[#181a1f] p-3 text-slate-300 font-sans text-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 animate-in slide-in-from-bottom duration-150 shrink-0"
      id="atom-find-replace-pane"
    >
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Find Input Column */}
        <div className="flex-1 flex items-center space-x-2 bg-[#1b1d23] px-2.5 py-1.5 rounded border border-[#15181f] focus-within:border-blue-500">
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Find text..."
            value={options.find}
            onChange={(e) => setOptions({ ...options, find: e.target.value })}
            className="w-full bg-transparent text-slate-200 outline-none text-xs"
            id="find-input-box"
          />
          {/* Regex, Case, Word Toggles */}
          <div className="flex items-center space-x-1 border-l border-slate-700/60 pl-2">
            <button
              title="Match Case"
              onClick={() => setOptions({ ...options, matchCase: !options.matchCase })}
              className={`px-1 py-0.5 rounded font-mono text-[10px] font-bold ${
                options.matchCase ? "bg-blue-600 text-white" : "hover:text-slate-100 text-slate-500"
              }`}
            >
              Aa
            </button>
            <button
              title="Whole Word"
              onClick={() => setOptions({ ...options, wholeWord: !options.matchCase })}
              className={`px-1 py-0.5 rounded font-mono text-[10px] font-bold ${
                options.wholeWord ? "bg-blue-600 text-white" : "hover:text-slate-100 text-slate-500"
              }`}
            >
              ""
            </button>
          </div>
        </div>

        {/* Replace Input Column */}
        <div className="flex-1 flex items-center space-x-2 bg-[#1b1d23] px-2.5 py-1.5 rounded border border-[#15181f] focus-within:border-blue-500">
          <Replace className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Replace with..."
            value={options.replace}
            onChange={(e) => setOptions({ ...options, replace: e.target.value })}
            className="w-full bg-transparent text-slate-200 outline-none text-xs"
            id="replace-input-box"
          />
        </div>
      </div>

      {/* Button controls */}
      <div className="flex items-center gap-2 shrink-0">
        {matchCount && (
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 shrink-0">
            {matchCount.total > 0 ? `${matchCount.current}/${matchCount.total}` : "No matches"}
          </span>
        )}

        <button
          onClick={onFindNext}
          className="bg-slate-800 hover:bg-slate-700 font-semibold px-3 py-1.5 rounded text-xs select-none text-white transition shrink-0"
          id="btn-find-next"
        >
          Find Next
        </button>

        <button
          onClick={onReplace}
          className="bg-slate-800 hover:bg-slate-700 font-semibold px-3 py-1.5 rounded text-xs select-none text-white transition shrink-0"
          id="btn-replace"
        >
          Replace
        </button>

        <button
          onClick={onReplaceAll}
          className="bg-blue-600 hover:bg-blue-500 font-semibold px-3 py-1.5 rounded text-xs select-none text-white transition shrink-0"
          id="btn-replace-all"
        >
          Replace All
        </button>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white transition shrink-0"
          id="btn-find-close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
