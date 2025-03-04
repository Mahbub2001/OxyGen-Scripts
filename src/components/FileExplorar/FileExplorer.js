"use client";
import { useState } from "react";

export default function FileExplorer() {
  const [entries, setEntries] = useState([]);
  const [currentHandle, setCurrentHandle] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [handleStack, setHandleStack] = useState([]);

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
    setFileContent("");
  }

  async function handleEntryClick(entry) {
    if (entry.kind === "directory") {
      setHandleStack([...handleStack, entry]);
      setCurrentHandle(entry);
      await readDirectory(entry);
    } else if (entry.kind === "file") {
      const file = await entry.getFile();
      const content = await file.text();
      setFileContent(content);
    }
  }

  async function goBack() {
    if (handleStack.length > 1) {
      handleStack.pop(); // Remove current folder
      const parentHandle = handleStack[handleStack.length - 1]; // Get previous folder
      setCurrentHandle(parentHandle);
      await readDirectory(parentHandle);
      setHandleStack([...handleStack]); // Update stack state
    }
  }

  return (
    <div>
      <div class="max-w-sm mx-auto border border-gray-600 rounded-sm shadow-lg">
        <div className="flex items-center w-full px-5">
          <label for="simple-search" class="sr-only">
            Search
          </label>
          <div class="relative w-full">
            <input
              type="text"
              id="simple-search"
              class="text-sm rounded-lg block w-full p-2 focus:outline-0"
              placeholder="Search branch name..."
              required
            />
          </div>
          <button type="submit" class="">
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <span class="sr-only">Search</span>
          </button>
        </div>
      </div>

      <button onClick={handleFolderSelect}>Select Folder</button>
      {handleStack.length > 1 && <button onClick={goBack}>Go Back</button>}
      <ul>
        {entries.map((entry, index) => (
          <li
            key={index}
            onClick={() => handleEntryClick(entry)}
            style={{
              cursor: "pointer",
              fontWeight: entry.kind === "directory" ? "bold" : "normal",
            }}
          >
            {entry.name}
          </li>
        ))}
      </ul>
      {fileContent && (
        <div>
          <h3>File Content:</h3>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
}
