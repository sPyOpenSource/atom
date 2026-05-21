import React, { useState } from "react";
import { 
  File, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit,
  FileCode,
  FileJson,
  FileText
} from "lucide-react";
import { VirtualFile } from "../types";

interface FileTreeProps {
  files: VirtualFile[];
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (parentPath: string, name: string, isFolder: boolean) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onToggleFolder: (path: string) => void;
}

export default function FileTree({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onToggleFolder
}: FileTreeProps) {
  const [activeInput, setActiveInput] = useState<{ parentPath: string; isFolder: boolean } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Get children at a given directory level
  const getChildren = (parentPath: string) => {
    return files.filter(f => {
      if (parentPath === "/") {
        return f.path !== "/" && !f.path.substring(1).includes("/");
      }
      const rest = f.path.substring(parentPath.length + 1);
      return f.path.startsWith(parentPath + "/") && !rest.includes("/");
    }).sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const getFileIcon = (file: VirtualFile) => {
    if (file.isFolder) {
      return file.isOpen ? (
        <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
      );
    }
    const ext = file.name.split(".").pop();
    switch (ext) {
      case "html":
        return <FileCode className="w-4 h-4 text-rose-400 shrink-0" />;
      case "css":
        return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
      case "js":
      case "jsx":
        return <FileCode className="w-4 h-4 text-yellow-500 shrink-0" />;
      case "ts":
      case "tsx":
        return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
      case "json":
        return <FileJson className="w-4 h-4 text-teal-400 shrink-0" />;
      case "md":
        return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeInput) return;
    onCreateFile(activeInput.parentPath, newItemName.trim(), activeInput.isFolder);
    setNewItemName("");
    setActiveInput(null);
  };

  const handleRenameSubmit = (e: React.FormEvent, path: string) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    const parts = path.split("/");
    parts[parts.length - 1] = renameValue.trim();
    const newPath = parts.join("/");
    onRenameFile(path, newPath);
    setRenamingPath(null);
    setRenameValue("");
  };

  // Pre-traverse files or represent hierarchically
  const renderNode = (node: VirtualFile, depth: number) => {
    const isSelected = activeFilePath === node.path;
    const hasChildren = node.isFolder;

    return (
      <div key={node.path} className="select-none text-xs">
        {/* Node label bar */}
        <div 
          onClick={() => {
            if (node.isFolder) {
              onToggleFolder(node.path);
            } else {
              onSelectFile(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`flex items-center justify-between group py-1.5 cursor-pointer hover:bg-slate-800/60 border-l-2 transition-all ${
            isSelected 
              ? "bg-slate-800 text-blue-400 border-blue-500" 
              : "border-transparent text-slate-300"
          }`}
          id={`tree-node-${node.path.replace(/\//g, "-")}`}
        >
          <div className="flex items-center space-x-2 overflow-hidden w-full">
            {node.isFolder ? (
              node.isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )
            ) : (
              <span className="w-3.5 h-3.5 shrink-0" />
            )}
            
            {getFileIcon(node)}

            {renamingPath === node.path ? (
              <form 
                onSubmit={(e) => handleRenameSubmit(e, node.path)} 
                onClick={(e) => e.stopPropagation()}
                className="flex-1"
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => setRenamingPath(null)}
                  autoFocus
                  className="w-full bg-slate-900 border border-slate-700 text-white px-1 py-0.5 rounded text-[11px] outline-none"
                />
              </form>
            ) : (
              <span className="truncate text-slate-300 font-sans">{node.name}</span>
            )}
          </div>

          {/* Context Actions */}
          <div className="hidden group-hover:flex items-center space-x-1.5 px-2 shrink-0">
            {node.isFolder && (
              <>
                <button
                  title="New File"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!node.isOpen) onToggleFolder(node.path);
                    setActiveInput({ parentPath: node.path, isFolder: false });
                  }}
                  className="p-0.5 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition"
                  id={`btn-new-file-${node.path.replace(/\//g, "-")}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  title="New Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!node.isOpen) onToggleFolder(node.path);
                    setActiveInput({ parentPath: node.path, isFolder: true });
                  }}
                  className="p-0.5 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition"
                  id={`btn-new-folder-${node.path.replace(/\//g, "-")}`}
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </>
            )}
            <button
              title="Rename"
              onClick={(e) => {
                e.stopPropagation();
                setRenamingPath(node.path);
                setRenameValue(node.name);
              }}
              className="p-0.5 hover:text-white text-slate-400 hover:bg-slate-700 rounded transition"
              id={`btn-rename-${node.path.replace(/\//g, "-")}`}
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${node.name}?`)) {
                  onDeleteFile(node.path);
                }
              }}
              className="p-0.5 hover:text-red-400 text-slate-400 hover:bg-slate-700 rounded transition"
              id={`btn-delete-${node.path.replace(/\//g, "-")}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Input box for creating child elements */}
        {activeInput && activeInput.parentPath === node.path && (
          <div style={{ paddingLeft: `${(depth + 1) * 12 + 18}px` }} className="py-1 pr-2">
            <form onSubmit={handleCreateSubmit} className="flex items-center">
              <input
                type="text"
                placeholder={activeInput.isFolder ? "folder name..." : "file name..."}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onBlur={() => setActiveInput(null)}
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 text-white px-1 py-0.5 rounded text-[11px] outline-none"
                id="tree-new-item-input"
              />
            </form>
          </div>
        )}

        {/* Sub-Children */}
        {hasChildren && node.isOpen && (
          <div className="flex flex-col">
            {getChildren(node.path).map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render Root node inputs or initial level
  const rootNodes = getChildren("/");

  return (
    <div className="flex flex-col h-full bg-[#1e232b] select-none font-sans border-r border-[#15181f]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#15181f] shrink-0 bg-[#1e232b]">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Workspace</span>
        <div className="flex items-center space-x-1.5">
          <button
            title="Create File at root"
            onClick={() => setActiveInput({ parentPath: "/", isFolder: false })}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
            id="tree-add-root-file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Create Folder at root"
            onClick={() => setActiveInput({ parentPath: "/", isFolder: true })}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
            id="tree-add-root-folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Directory Content */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {activeInput && activeInput.parentPath === "/" && (
          <div className="px-3 py-1">
            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                placeholder={activeInput.isFolder ? "folder name..." : "file name..."}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onBlur={() => setActiveInput(null)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded text-xs outline-none"
              />
            </form>
          </div>
        )}

        {rootNodes.map(node => renderNode(node, 0))}

        {rootNodes.length === 0 && !activeInput && (
          <div className="px-3 py-8 text-center text-slate-500 text-xs">
            No files available.<br/>Click + to add.
          </div>
        )}
      </div>
    </div>
  );
}
