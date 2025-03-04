import React from "react";

function Editor({ fileContent }) {
  return (
    <div className="h-full bg-[#1E1E1E] text-white p-4 rounded-lg overflow-auto">
      <pre className="whitespace-pre-wrap font-mono custom-scrollbar h-full overflow-y-scroll">
        <code>{fileContent}</code>
      </pre>
    </div>
  );
}

export default Editor;
