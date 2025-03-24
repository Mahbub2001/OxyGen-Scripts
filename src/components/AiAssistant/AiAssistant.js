"use client";
import React, { useRef, useState } from "react";
import { RiGeminiLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { FiPaperclip, FiPlus, FiSend } from "react-icons/fi";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import { DropdownMenu } from "../DropDown/DropDown";
import { processQuery } from "@/api/ai_assistant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

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

function AiAssistant({ getContent }) {
  const [scenario, setSelectedScenario] = useState(scenario_map[0]);
  const [sessionId, setSessionId] = useState(null);
  const [query, setUserQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  // console.log(getContent);
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };
  
  const handleSendMessage = async () => {
    // if (query.trim() === "") return;

    const userMessage = { text: query, sender: "user", images: imagePreviews };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    console.log("User input:", query);
    if (!sessionId) {
      setSessionId("");
    }
    setIsLoading(true);
    try {
      const codeScenarios = [
        "Code Shortener",
        "Code Explanation",
        "Code Commenting",
        "Code Optimization",
        "Code Completion",
        "Code Correction",
      ];

      const code = codeScenarios.includes(scenario) ? getContent : "";

      const imageBase64Array = await Promise.all(
        images.map((file) => convertToBase64(file))
      );

      const response = await processQuery(
        query,
        code,
        scenario,
        sessionId,
        imageBase64Array
      );
      // const response = await processQuery(query, scenario == "" , scenario, sessionId);

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
    setIsLoading(false);
    setUserQuery("");
    setImages([]);
    setImagePreviews([]);
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }
  
    const newImages = [...images, ...files.slice(0, 3 - images.length)];
    setImages(newImages);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
        e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); 
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderers = {
    code({ inline, className, children }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      const copyToClipboard = () => {
        navigator.clipboard.writeText(codeString);
        alert("Code copied to clipboard!");
      };

      return !inline && match ? (
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Copy
          </button>
          <SyntaxHighlighter
            style={dracula}
            language={match[1]}
            PreTag="div"
            className="rounded-md"
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-800 text-white p-1 rounded">{children}</code>
      );
    },
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
        <div className="p-4 overflow-y-auto flex-grow h-[500px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-1.5 rounded-lg max-w-[100%] ${
                  message.sender === "user"
                    ? "bg-[#28282c] self-end"
                    : "bg-[#252526] self-start"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={renderers}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="p-2 rounded-lg max-w-[70%] bg-[#252526] self-start flex items-center gap-2"
              >
                <motion.span
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                />
                <motion.span
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.4, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.4, delay: 0.4 }}
                />
                <span className="ml-2">Processing...</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="pb-18 border-t border-gray-600 p-2">
          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 mb-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between p-2 bg-[#1e1e20]">
            <div className="flex items-center">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                id="file-upload" 
              />
              <label
                htmlFor="file-upload" 
                className="flex items-center p-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <FiPaperclip className="mr-2" />
                Add an attachment ({images.length}/3)
              </label>
            </div>
            <button
              className="cursor-pointer p-2 text-gray-400 hover:text-white"
              onClick={handleSendMessage}
              disabled={
                isLoading || (query.trim() === "" && images.length === 0)
              }
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
