import React, { useState } from "react";
import { 
  Settings, 
  Paintbrush, 
  Package, 
  Download, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Sliders, 
  Heart,
  ExternalLink,
  Info
} from "lucide-react";
import { AtomTheme, AtomPackage } from "../types";

interface SettingsViewProps {
  theme: AtomTheme;
  setTheme: (theme: AtomTheme) => void;
  packages: AtomPackage[];
  onTogglePackage: (id: string) => void;
  onInstallPackage: (name: string) => Promise<boolean>;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  tabLength: number;
  setTabLength: (len: number) => void;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;
}

export default function SettingsView({
  theme,
  setTheme,
  packages,
  onTogglePackage,
  onInstallPackage,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  tabLength,
  setTabLength,
  wordWrap,
  setWordWrap
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"core" | "themes" | "packages" | "install">("core");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPkgName, setNewPkgName] = useState("");
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState("");
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) return;
    setInstalling(true);
    setInstallError("");
    setInstallSuccess(false);
    
    // Simulate real install delay
    const success = await onInstallPackage(newPkgName.trim());
    setInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setNewPkgName("");
      setTimeout(() => setInstallSuccess(false), 3000);
    } else {
      setInstallError("Package already installed or invalid name specification.");
    }
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#21252b] text-[#9da5b4] font-sans">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-56 bg-[#1b1d23] md:border-r border-[#15181f] p-4 flex flex-col space-y-1.5 shrink-0">
        <div className="flex items-center space-x-2 px-2.5 py-2 mb-4">
          <Settings className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-slate-200 text-sm">Atom Settings</span>
        </div>

        <button
          onClick={() => setActiveTab("core")}
          className={`flex items-center space-x-3 px-3 py-2 rounded text-xs select-none transition ${
            activeTab === "core" ? "bg-[#282c34] text-white font-medium" : "hover:bg-[#282c34]/50 hover:text-slate-200"
          }`}
          id="settings-tab-core"
        >
          <Sliders className="w-4 h-4 text-slate-400" />
          <span>Core Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("themes")}
          className={`flex items-center space-x-3 px-3 py-2 rounded text-xs select-none transition ${
            activeTab === "themes" ? "bg-[#282c34] text-white font-medium" : "hover:bg-[#282c34]/50 hover:text-slate-200"
          }`}
          id="settings-tab-themes"
        >
          <Paintbrush className="w-4 h-4 text-slate-400" />
          <span>Themes Manager</span>
        </button>

        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center space-x-3 px-3 py-2 rounded text-xs select-none transition ${
            activeTab === "packages" ? "bg-[#282c34] text-white font-medium" : "hover:bg-[#282c34]/50 hover:text-slate-200"
          }`}
          id="settings-tab-packages"
        >
          <Package className="w-4 h-4 text-slate-400" />
          <span>Installed Packages</span>
          <span className="ml-auto bg-slate-800 text-[10px] text-slate-300 font-bold px-1.5 py-0.5 rounded-full">
            {packages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("install")}
          className={`flex items-center space-x-3 px-3 py-2 rounded text-xs select-none transition ${
            activeTab === "install" ? "bg-[#282c34] text-white font-medium" : "hover:bg-[#282c34]/50 hover:text-slate-200"
          }`}
          id="settings-tab-install"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Install Extensions</span>
        </button>

        <div className="flex-1" />

        <div className="p-3 bg-slate-900/40 rounded-lg text-[10px] space-y-1.5 border border-slate-800">
          <div className="flex items-center space-x-1 font-semibold text-slate-300">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Telemetry Status</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Atom has loaded package configuration profiles. Use telemetry settings to bind key bindings.
          </p>
        </div>
      </div>

      {/* Settings Content Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#282c34] text-slate-300 custom-scrollbar">
        {activeTab === "core" && (
          <div className="max-w-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white mb-1.5">Core Editor Configurations</h2>
              <p className="text-xs text-slate-400">These parameters control standard behavior within Atom buffers and editors.</p>
            </div>

            <div className="space-y-4 pt-2 border-t border-[#1b1d23]">
              {/* Font Family */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-200">Editor Font Family</label>
                  <p className="text-[11px] text-slate-500">The primary font used inside file documents.</p>
                </div>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="bg-[#1b1d23] border border-[#15181f] text-slate-200 text-xs rounded px-3 py-1.5 focus:border-blue-500 transition outline-none"
                  id="settings-font-family"
                >
                  <option value="font-sans">Inter (Sans-Serif)</option>
                  <option value="font-mono">JetBrains Mono (Developer)</option>
                  <option value="font-serif">Georgia (Serif / Editorial)</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-t border-slate-800">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-200">Editor Font Size</label>
                  <p className="text-[11px] text-slate-500">Font size scaling for readability controls.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="10"
                    max="22"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-32 accent-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-200 w-8 text-right">{fontSize}px</span>
                </div>
              </div>

              {/* Tab Length */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-t border-slate-800">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-200">Tab indent spacing</label>
                  <p className="text-[11px] text-slate-500">The size of a tab in columns representing empty spaces.</p>
                </div>
                <select
                  value={tabLength}
                  onChange={(e) => setTabLength(parseInt(e.target.value))}
                  className="bg-[#1b1d23] border border-[#15181f] text-slate-200 text-xs rounded px-3 py-1.5 focus:border-blue-500 transition outline-none"
                  id="settings-tab-length"
                >
                  <option value={2}>2 Whitespaces</option>
                  <option value={4}>4 Whitespaces</option>
                  <option value={8}>8 Whitespaces</option>
                </select>
              </div>

              {/* Word Wrap */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-t border-slate-800">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-200">Word Wrap Code</label>
                  <p className="text-[11px] text-slate-500">Wrap long rows that overflow the visible editor screen width.</p>
                </div>
                <button
                  onClick={() => setWordWrap(!wordWrap)}
                  className="flex items-center text-slate-400 hover:text-white transition"
                  id="settings-toggle-word-wrap"
                >
                  {wordWrap ? (
                    <ToggleRight className="w-8 h-8 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "themes" && (
          <div className="max-w-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white mb-1.5">Atom Themes & Styling</h2>
              <p className="text-xs text-slate-400">Personalize your development editor with famous skin configurations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1b1d23]">
              {[
                { id: "one-dark", name: "Atom One Dark", bg: "bg-[#282c34]", text: "text-[#abb2bf]", border: "border-blue-500" },
                { id: "one-light", name: "Atom One Light", bg: "bg-[#fafafa]", text: "text-[#383a42]", border: "border-amber-400" },
                { id: "solarized-dark", name: "Solarized Dark", bg: "bg-[#002b36]", text: "text-[#839496]", border: "border-teal-500" },
                { id: "monokai", name: "Classic Monokai", bg: "bg-[#272822]", text: "text-[#f8f8f2]", border: "border-fuchsia-500" },
                { id: "github-light", name: "GitHub Elegant Light", bg: "bg-[#ffffff]", text: "text-[#24292e]", border: "border-slate-800" },
              ].map(t => {
                const isSelected = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id as AtomTheme)}
                    className={`p-4 rounded-lg cursor-pointer border transition-all ${t.bg} ${
                      isSelected ? `ring-2 ring-slate-400/80 border-transparent scale-[1.02]` : "border-slate-800 hover:border-slate-700"
                    }`}
                    id={`theme-card-${t.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold leading-none ${t.id === "one-light" || t.id === "github-light" ? "text-slate-900" : "text-slate-100"}`}>
                        {t.name}
                      </span>
                      {isSelected && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          t.id === "one-light" || t.id === "github-light" ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                        }`}>
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                      <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "packages" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1.5">Installed Community Packages</h2>
                <p className="text-xs text-slate-400">Enable or disable core Atom packages to change your features.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1b1d23] border border-[#15181f] text-slate-300 rounded px-8 py-2 text-xs focus:border-blue-500 transition outline-none"
                  id="settings-package-filter"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pt-4 border-t border-[#1b1d23]">
              {filteredPackages.map(pkg => (
                <div 
                  key={pkg.id} 
                  className="p-4 bg-[#21252b] border border-[#181a1f] rounded-lg flex flex-col justify-between space-y-3.5 hover:shadow-md transition duration-150"
                  id={`installed-pkg-card-${pkg.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">{pkg.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                        v{pkg.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{pkg.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
                    <span className="text-slate-500">{pkg.downloads.toLocaleString()} downloads</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onTogglePackage(pkg.id)}
                        className={`px-3 py-1 rounded font-bold text-xs select-none transition ${
                          pkg.enabled 
                            ? "bg-slate-700 hover:bg-slate-600 text-white" 
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                        id={`btn-toggle-pkg-${pkg.id}`}
                      >
                        {pkg.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPackages.length === 0 && (
                <div className="col-span-1 xl:col-span-2 text-center py-12 text-slate-500 text-xs">
                  No packages match "{searchQuery}" filter.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "install" && (
          <div className="max-w-xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white mb-1.5">Install Community Extension Packages</h2>
              <p className="text-xs text-slate-400">Search and fetch atom plugins directly from mock registries.</p>
            </div>

            <form onSubmit={handleInstall} className="space-y-4 pt-4 border-t border-[#1b1d23]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Enter Package Name</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g. atom-beautify, git-plus, color-picker"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="flex-1 bg-[#1b1d23] border border-[#15181f] text-slate-200 rounded px-3 py-2 text-xs focus:border-blue-500 transition outline-none placeholder-slate-600"
                    id="install-package-input"
                  />
                  <button
                    type="submit"
                    disabled={installing}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded text-xs select-none transition disabled:bg-slate-800 disabled:text-slate-500"
                    id="install-package-submit"
                  >
                    {installing ? "Installing..." : "Install"}
                  </button>
                </div>
              </div>

              {installError && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-md text-xs">
                  {installError}
                </div>
              )}

              {installSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-md text-xs">
                  Successfully installed. You can enable it under <strong>Installed Packages</strong>!
                </div>
              )}
            </form>

            <div className="pt-8 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">Popular Packages in Registry</h3>
              <div className="space-y-3">
                {[
                  { name: "atom-beautify", desc: "Format HTML, CSS, JavaScript, and TypeScript within standard guidelines immediately.", downloads: "29,481,200" },
                  { name: "git-plus", desc: "Execute common git actions (commit, push, add) entirely from context panels inside Atom.", downloads: "15,810,120" },
                  { name: "emmet", desc: "Fuzzy developer autocompletion abbreviation for nesting templates.", downloads: "12,940,300" }
                ].map((p, idx) => (
                  <div key={idx} className="p-3 bg-[#21252b] rounded border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-300">{p.name}</span>
                      <p className="text-[11px] text-slate-500">{p.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewPkgName(p.name);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] select-none shrink-0"
                    >
                      Fill
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
