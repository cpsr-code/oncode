import React from "react";
import Editor from "@monaco-editor/react";
import { Settings } from "lucide-react";

const ProblemCodeEditor = ({
  code,
  setCode,
  selectedLanguage,
  setSelectedLanguage,
  fontSize,
  setFontSize,
  languages,
  fontSizes,
  handleEditorDidMount
}) => {
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('daisyui-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000', // transparent
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      {/* --- Toolbar: Language & Settings --- */}
      <div className="flex items-center justify-between px-4 h-12 bg-base-200 shrink-0 border-b border-base-content/10">
        
        {/* Language Selection */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="select select-sm bg-base-100 border-base-content/20 text-base-content focus:outline-none focus:border-primary font-medium"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>

        {/* Font Size Configuration */}
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-base-content/50" />
          <span className="text-xs text-base-content/60 font-medium">Font Size:</span>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="select select-sm bg-base-100 border-base-content/20 text-base-content focus:outline-none focus:border-primary"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Monaco Editor Wrapper --- */}
      <div className="flex-1 relative bg-black">
        <Editor
          height="100%"
          language={selectedLanguage === "cpp" ? "cpp" : selectedLanguage}
          theme="daisyui-dark"
          beforeMount={handleEditorWillMount}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
          }}
        />
      </div>
      
    </div>
  );
};

export default ProblemCodeEditor;