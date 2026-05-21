export interface VirtualFile {
  path: string; // full path e.g. "/src/App.js"
  name: string;
  content: string;
  isFolder: boolean;
  isOpen?: boolean; // for folders in tree
}

export type AtomTheme = "one-dark" | "one-light" | "solarized-dark" | "monokai" | "github-light";

export interface AtomPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  downloads: number;
}

export interface CommandPaletteAction {
  id: string;
  name: string; // label e.g. "Editor: Toggle Minimap"
  shortcut?: string;
  group: string; // group header
  action: () => void;
}

export interface SearchOptions {
  find: string;
  replace: string;
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface LinterMessage {
  line: number;
  column: number;
  severity: "error" | "warning";
  message: string;
  source: string;
}

export interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  filePath: string | null;
  cursor: { line: number; col: number } | null;
}

export interface ChatMessage {
  sender: string;
  color: string;
  text: string;
  timestamp: string;
}
