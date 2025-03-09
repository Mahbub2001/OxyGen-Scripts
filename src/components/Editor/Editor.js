"use client";
import React, { useState, useEffect, useRef } from "react";

function Editor({ fileContent, onContentChange }) {
  const [content, setContent] = useState(fileContent);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

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

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lines = content.split("\n");

  return (
    <div className="h-full bg-[#1E1E1E] text-white p-4 rounded-lg ">
      <div className="flex h-full">
        <div
          ref={lineNumbersRef}
          className="w-10 pr-2 text-right text-[#858585] select-none overflow-hidden"
          style={{ scrollBehavior: "smooth" }}
        >
          {lines.map((_, index) => (
            <div key={index + 1}>{index + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          className="flex-1 bg-transparent text-white font-mono resize-none outline-none pl-2 overflow-y-auto"
          style={{ lineHeight: "1.5", scrollBehavior: "smooth" }}
        />
      </div>
    </div>
  );
}

export default Editor;
