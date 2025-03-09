import React, { useState, useEffect } from "react";

function Editor({ fileContent, onContentChange }) {
  const [content, setContent] = useState(fileContent);

  useEffect(() => {
    setContent(fileContent);
  }, [fileContent]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  return (
    <div className="h-full bg-[#1E1E1E] text-white p-4 rounded-lg overflow-auto">
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full h-full bg-transparent text-white font-mono resize-none outline-none"
        style={{ lineHeight: "1.5" }}
      />
    </div>
  );
}

export default Editor;
