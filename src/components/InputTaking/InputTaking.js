import React from "react";

function InputTaking({currentInput,setCurrentInput}) {
  return (
    <textarea
      className="w-full h-full bg-transparent text-white font-mono resize-none outline-none"
      placeholder="Enter input here..."
      value={currentInput}
      onChange={(e) => setCurrentInput(e.target.value)}
      style={{
        lineHeight: "1.5",
        fontSize: "14px",
        scrollbarWidth: "thin",
        scrollbarColor: "#858585 transparent",
      }}
    />
  );
}

export default InputTaking;
