import React from 'react';
import Editor from '@monaco-editor/react';

const RuleEditor = ({ value, onChange, height = '300px', isLoading = false, language = 'plaintext' }) => {
  const handleEditorChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative border border-gray-300 rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="mt-2 text-sm text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleEditor;