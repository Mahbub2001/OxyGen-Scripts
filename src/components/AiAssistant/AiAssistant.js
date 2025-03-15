"use client";
import React from "react";
import { RiGeminiLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { FiPaperclip, FiPlus, FiSend } from "react-icons/fi";

function AiAssistant() {
  return (
    <div className="flex flex-col text-white min-h-screen text-xs">
      <div className="flex flex-col justify-between flex-grow">
        <div className="border-b border-gray-700 flex items-center">
          <div className="flex gap-2 items-center border-r border-gray-600 pr-2">
            <div className="flex items-center gap-2 pl-2 pt-1.5 pb-3">
              <RiGeminiLine size={10} />
              <p>AI Chat</p>
              <RxCross2 />
            </div>
          </div>
          <div className="pt-1.5 pl-2 pb-3">
            <FiPlus />
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="flex flex-col gap-4">
            <div className="bg-[#28282c] p-1.5 rounded-lg max-w-[70%] self-end">
              <p>Hi! I need help with my project.</p>
            </div>
            <div className="bg-[#252526] p-2 rounded-lg max-w-[60%]">
              <p>Hello! How can I assist you today?</p>
            </div>
          </div>
        </div>
        <div className="pb-18 border-t border-gray-600 p-2">
          <textarea
            placeholder="Type your message..."
            className="w-full p-2 bg-[#252526] text-white rounded-lg focus:outline-none resize-none overflow-y-auto max-h-48"
            rows={1} 
            onInput={(e) => {
              e.target.style.height = "auto"; 
              e.target.style.height = `${e.target.scrollHeight}px`; 
            }}
          />
          <div className="flex items-center justify-between p-2 bg-[#1e1e20]">
            <label className="flex items-center cursor-pointer">
              <input type="file" className="hidden" />
              <span className="flex items-center p-2 text-gray-400 hover:text-white">
                <FiPaperclip className="mr-2" />
                Add an attachment
              </span>
            </label>
            <button className="p-2 text-gray-400 hover:text-white">
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
