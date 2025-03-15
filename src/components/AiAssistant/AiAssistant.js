"use client";
import React, { useState } from "react";
import { RiGeminiLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { FiPaperclip, FiPlus, FiSend } from "react-icons/fi";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import { DropdownMenu } from "../DropDown/DropDown";
import { processQuery } from "@/api/ai_assistant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const scenario_map = [
  "General Assistant",
  "Code Correction",
  "Code Completion",
  "Code Optimization",
  "Code Generation",
  "Code Commenting",
  "Code Explanation",
  "Extract From Book",
  "LeetCode Solver",
  "Code Shortener",
];

function AiAssistant() {
  const [scenario, setSelectedScenario] = useState(scenario_map[0]);
  const [sessionId, setSessionId] = useState(null);
  const [query, setUserQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (query.trim() === "") return;

    const userMessage = { text: query, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    console.log("User input:", query);
    if (!sessionId) {
      setSessionId("");
    }
    try {
      const response = await processQuery(query, "", scenario, sessionId);

      console.log("AI response:", response.data);
      const aiMessage = { text: response.data.response, sender: "ai" };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error("Error processing query:", error);
      const errorMessage = {
        text: "Failed to get a response from the AI.",
        sender: "error",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setUserQuery("");
  };

  return (
    <div className="flex flex-col text-white min-h-screen text-xs">
      <div className="flex flex-col justify-between flex-grow">
        <div className="border-b border-gray-700 flex items-center">
          <div className="flex gap-2 items-center border-r border-gray-600 pr-2">
            <div className="flex items-center gap-2 pl-2 pt-2 pb-3">
              <RiGeminiLine size={10} />
              <p>AI Chat</p>
              <RxCross2 />
            </div>
          </div>
          <div className="pt-2 pl-2 pb-3">
            <FiPlus />
          </div>
        </div>
        <div className="border-b border-gray-700 flex items-center justify-between px-2 py-2">
          <div>
            <TbLayoutSidebarLeftExpand className="text-[1rem]" />
          </div>
          <div>
            <DropdownMenu
              scenario={scenario}
              setSelectedScenario={setSelectedScenario}
              scenario_map={scenario_map}
            />
          </div>
          <div>
            <CiMenuKebab className="transform-flat" />
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-1.5 rounded-lg max-w-[70%] ${
                  message.sender === "user"
                    ? "bg-[#28282c] self-end"
                    : "self-start"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
        <div className="pb-18 border-t border-gray-600 p-2">
          <textarea
            placeholder="Type your message..."
            className="w-full p-2 bg-[#252526] text-white rounded-lg focus:outline-none resize-none overflow-y-auto max-h-48"
            rows={1}
            value={query}
            onChange={(e) => setUserQuery(e.target.value)}
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
            <button
              className="cursor-pointer p-2 text-gray-400 hover:text-white"
              onClick={handleSendMessage}
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
