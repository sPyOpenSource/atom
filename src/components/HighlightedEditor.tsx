import React, { useEffect, useRef, useState } from "react";
import Prism from "prismjs";

// Import core languages for Prism to make sure tokenizing is supported
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup"; // HTML
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";

import { AtomTheme } from "../types";

interface HighlightedEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  fontFamily: string;
  fontSize: number;
  tabLength: number;
  wordWrap: boolean;
  theme: AtomTheme;
  style: any;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileName: string;
}

export default function HighlightedEditor({
  value,
  onChange,
  onSelect,
  fontFamily,
  fontSize,
  tabLength,
  wordWrap,
  theme,
  style,
  textareaRef,
  fileName,
}: HighlightedEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  // Detect correct Prism grammar based on file name or fallback
  const getPrismLanguage = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
        return { grammar: Prism.languages.javascript, name: "javascript" };
      case "jsx":
        return { grammar: Prism.languages.jsx || Prism.languages.javascript, name: "jsx" };
      case "ts":
        return { grammar: Prism.languages.typescript, name: "typescript" };
      case "tsx":
        return { grammar: Prism.languages.tsx || Prism.languages.typescript, name: "tsx" };
      case "py":
        return { grammar: Prism.languages.python, name: "python" };
      case "html":
        return { grammar: Prism.languages.markup, name: "markup" };
      case "css":
        return { grammar: Prism.languages.css, name: "css" };
      case "json":
        return { grammar: Prism.languages.json || Prism.languages.javascript, name: "json" };
      case "md":
        return { grammar: Prism.languages.markdown || Prism.languages.markup, name: "markdown" };
      default:
        return { grammar: Prism.languages.markup || Prism.languages.clike, name: "markup" };
    }
  };

  // Safe Highlighting handler
  useEffect(() => {
    try {
      const { grammar, name } = getPrismLanguage(fileName);
      if (grammar) {
        // Prism.highlight expects string
        const highlighted = Prism.highlight(value || "", grammar, name);
        // Add a zero-width space or newline at the end so if the file ends on an empty line,
        // the scrolling heights and caret positions match up perfectly.
        setHighlightedCode(highlighted + (value.endsWith("\n") ? "\n " : ""));
      } else {
        // Safe escape fallback
        const escaped = (value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        setHighlightedCode(escaped + (value.endsWith("\n") ? "\n " : ""));
      }
    } catch (err) {
      console.error("Syntax Highlighter Error:", err);
      // Fallback
      setHighlightedCode(value || "");
    }
  }, [value, fileName]);

  // Handle synchronized scrolling
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = textarea.scrollTop;
      preRef.current.scrollLeft = textarea.scrollLeft;
    }
  };

  // Caret color and selection styling depending on theme selection
  const getCaretColor = (editorTheme: AtomTheme) => {
    switch (editorTheme) {
      case "one-light":
        return "#528bff";
      case "solarized-dark":
        return "#b58900";
      case "monokai":
        return "#f92672";
      case "github-light":
        return "#f9826c";
      case "one-dark":
      default:
        return "#528bff";
    }
  };

  const getSelectionBg = (editorTheme: AtomTheme) => {
    switch (editorTheme) {
      case "one-light":
        return "rgba(82, 139, 255, 0.25)";
      case "solarized-dark":
        return "rgba(181, 137, 0, 0.3)";
      case "monokai":
        return "rgba(249, 38, 114, 0.35)";
      case "github-light":
        return "rgba(249, 130, 108, 0.25)";
      case "one-dark":
      default:
        return "rgba(82, 139, 255, 0.35)";
    }
  };

  const getTokenStyles = (editorTheme: AtomTheme) => {
    switch (editorTheme) {
      case "one-light":
        return `
          .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #a0a1a7; font-style: italic; }
          .token.punctuation { color: #383a42; }
          .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #986801; }
          .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #50a14f; }
          .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #0184bc; }
          .token.atrule, .token.attr-value, .token.keyword { color: #a626a4; }
          .token.function, .token.class-name { color: #4078f2; }
          .token.regex, .token.important, .token.variable { color: #e45649; }
        `;
      case "solarized-dark":
        return `
          .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #586e75; font-style: italic; }
          .token.punctuation { color: #93a1a1; }
          .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #d33682; }
          .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #2aa198; }
          .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #93a1a1; }
          .token.atrule, .token.attr-value, .token.keyword { color: #859900; }
          .token.function, .token.class-name { color: #268bd2; }
          .token.regex, .token.important, .token.variable { color: #cb4b16; }
        `;
      case "monokai":
        return `
          .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #75715e; font-style: italic; }
          .token.punctuation { color: #f8f8f2; }
          .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #ae81ff; }
          .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #e6db74; }
          .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #f8f8f2; }
          .token.atrule, .token.attr-value, .token.keyword { color: #f92672; }
          .token.function, .token.class-name { color: #a6e22e; }
          .token.regex, .token.important, .token.variable { color: #fd971f; }
        `;
      case "github-light":
        return `
          .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #6a737d; font-style: italic; }
          .token.punctuation { color: #24292e; }
          .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #005cc5; }
          .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #032f62; }
          .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #24292e; }
          .token.atrule, .token.attr-value, .token.keyword { color: #d73a49; }
          .token.function, .token.class-name { color: #6f42c1; }
          .token.regex, .token.important, .token.variable { color: #e36209; }
        `;
      case "one-dark":
      default:
        return `
          .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #5c6370; font-style: italic; }
          .token.punctuation { color: #abb2bf; }
          .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #d19a66; }
          .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #98c379; }
          .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #56b6c2; }
          .token.atrule, .token.attr-value, .token.keyword { color: #c678dd; }
          .token.function, .token.class-name { color: #61afef; }
          .token.regex, .token.important, .token.variable { color: #e06c75; }
        `;
    }
  };

  const caretColor = getCaretColor(theme);
  const selectionBg = getSelectionBg(theme);
  const tokenStyles = getTokenStyles(theme);

  return (
    <div className="relative w-full h-full overflow-hidden" id="syntax-highlighted-editor-container">
      {/* Dynamic Inject Style Tag to ensure 100% theme consistency and overrides */}
      <style>{`
        .shared-editor-style {
          margin: 0 !important;
          border: 0 !important;
          padding: 16px !important;
          width: 100% !important;
          height: 100% !important;
          font-family: inherit !important;
          font-size: inherit !important;
          line-height: inherit !important;
          tab-size: ${tabLength} !important;
          -moz-tab-size: ${tabLength} !important;
          white-space: ${wordWrap ? "pre-wrap" : "pre"} !important;
          word-wrap: ${wordWrap ? "break-word" : "normal"} !important;
          word-break: ${wordWrap ? "break-all" : "keep-all"} !important;
          box-sizing: border-box !important;
        }

        .editor-textarea {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 2 !important;
          background: transparent !important;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          resize: none !important;
          outline: none !important;
          caret-color: ${caretColor} !important;
        }

        .editor-textarea::selection {
          background: ${selectionBg} !important;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
        }

        .editor-highlighted {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 1 !important;
          pointer-events: none !important;
          overflow: auto !important;
          background-color: transparent !important;
        }

        /* Hide Scrollbar for background highlighter only to avoid overlapping double scrollbars */
        .editor-highlighted::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .editor-highlighted {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        /* Prism customization rules */
        ${tokenStyles}
      `}</style>

      {/* Background Highlighted Elements */}
      <pre
        ref={preRef}
        className={`editor-highlighted shared-editor-style ${fontFamily} ${style.textareaText}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.625",
        }}
        aria-hidden="true"
      >
        <code
          className={`language-${getPrismLanguage(fileName).name}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>

      {/* Overlay interactive Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={onSelect}
        onScroll={handleScroll}
        className={`editor-textarea shared-editor-style custom-scrollbar ${fontFamily}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.625",
        }}
        id="editor-workspace-textarea"
        spellCheck="false"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
