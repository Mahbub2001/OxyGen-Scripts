"use client";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between  text-white px-4 py-2">
      {/* Left side */}
      <div className="flex items-center space-x-3">
        <button className="text-lg font-medium">Neon</button>
      </div>

      {/* Center */}
      <div className="flex items-center">
        {/* <input
          type="text"
          placeholder="Ask AI & Search"
          className="bg-gray-800 text-white text-sm px-3 py-1 rounded-md w-60 outline-none"
        />
        <span className="ml-2 text-gray-400 text-xs">Ctrl + K</span> */}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        <button className="p-2">
          <FiMoreVertical size={18} />
        </button>
        <button className="p-2">
          <FaUserCircle size={22} />
        </button>
      </div>
    </nav>
  );
}
