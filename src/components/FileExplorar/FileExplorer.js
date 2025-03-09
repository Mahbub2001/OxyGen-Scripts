"use client";
import { useState } from "react";
import {
  MdKeyboardArrowDown,
  MdFolder,
  MdInsertDriveFile,
  MdChevronRight,
  MdChevronLeft,
} from "react-icons/md";
import SearchBox from "../SearchBox/SearchBox";

export default function FileExplorer({ openTab }) {
  const [entries, setEntries] = useState([]);
  const [currentHandle, setCurrentHandle] = useState(null);
  const [handleStack, setHandleStack] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    explorer: true,
    search: false,
    sourceControl: false,
  });

  async function handleFolderSelect() {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      setCurrentHandle(directoryHandle);
      setHandleStack([directoryHandle]);
      await readDirectory(directoryHandle);
    } catch (err) {
      console.error("Folder access denied", err);
    }
  }

  async function readDirectory(directoryHandle) {
    const entryList = [];
    for await (const entry of directoryHandle.values()) {
      entryList.push(entry);
    }
    setEntries(entryList);
  }

  async function handleEntryClick(entry) {
    if (entry.kind === "directory") {
      setHandleStack([...handleStack, entry]);
      setCurrentHandle(entry);
      await readDirectory(entry);
    } else if (entry.kind === "file") {
      const file = await entry.getFile();
      const content = await file.text();
      openTab({ name: entry.name, content });
    }
  }

  async function goBack() {
    if (handleStack.length > 1) {
      handleStack.pop();
      const parentHandle = handleStack[handleStack.length - 1];
      setCurrentHandle(parentHandle);
      await readDirectory(parentHandle);
      setHandleStack([...handleStack]);
    }
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="h-full bg-[#252526] text-[#CCCCCC] p-2 text-sm">
      <div className="max-w-sm mx-auto border border-gray-600 rounded-sm shadow-lg">
        <SearchBox />
      </div>
      <hr className="my-1 text-gray-600" />
      <div className="">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("explorer")}
        >
          <div className="flex items-center space-x-2">
            <MdKeyboardArrowDown
              className={`transition-transform ${
                expandedSections.explorer ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span>Files</span>
          </div>
          <button
            onClick={handleFolderSelect}
            className="p-1 hover:bg-[#3E3E42] rounded"
          >
            Open Folder
          </button>
        </div>
        {expandedSections.explorer && (
          <div className="mt-2">
            {handleStack.length > 1 && (
              <button
                onClick={goBack}
                className="flex items-center space-x-2 p-1 hover:bg-[#3E3E42] rounded w-full text-left"
              >
                <MdChevronLeft />
                <span>Back</span>
              </button>
            )}
            <ul className="mt-2">
              {entries.map((entry, index) => (
                <li
                  key={index}
                  onClick={() => handleEntryClick(entry)}
                  className="flex items-center space-x-2 p-1 hover:bg-[#3E3E42] rounded cursor-pointer"
                >
                  {entry.kind === "directory" ? (
                    <MdFolder />
                  ) : (
                    <MdInsertDriveFile />
                  )}
                  <span>{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <hr className="my-1 text-gray-600" />
      <div className="mb-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("sourceControl")}
        >
          <div className="flex items-center space-x-2">
            <MdKeyboardArrowDown
              className={`transition-transform ${
                expandedSections.sourceControl ? "rotate-0" : "-rotate-90"
              }`}
            />
            <span>Widgets</span>
          </div>
        </div>
        {expandedSections.sourceControl && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">No changes</p>
          </div>
        )}
      </div>
    </div>
  );
}
