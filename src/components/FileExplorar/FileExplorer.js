"use client";
import { useState } from "react";
import SearchBox from "../SearchBox/SearchBox";

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
      handleStack.pop();
      const parentHandle = handleStack[handleStack.length - 1];
      setCurrentHandle(parentHandle);
      await readDirectory(parentHandle);
      setHandleStack([...handleStack]);
    }
  }

  return (
    <div>
      <div className="max-w-sm mx-auto border border-gray-600 rounded-sm shadow-lg">
        <SearchBox />
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
