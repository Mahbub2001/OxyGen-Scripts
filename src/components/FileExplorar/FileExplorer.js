"use client";
import { useState, useEffect } from "react";
import {
  MdKeyboardArrowDown,
  MdFolder,
  MdInsertDriveFile,
  MdChevronRight,
  MdChevronLeft,
} from "react-icons/md";
import SearchBox from "../SearchBox/SearchBox";
import { FiLogIn, FiLogOut, FiRefreshCw } from "react-icons/fi";

export default function FileExplorer({ openTab }) {
  const [entries, setEntries] = useState([]);
  const [currentHandle, setCurrentHandle] = useState(null);
  const [handleStack, setHandleStack] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    explorer: true,
    search: false,
    sourceControl: false,
  });
  const [source, setSource] = useState("local");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (source === "drive" && typeof window !== "undefined") {
      const loadGapi = async () => {
        try {
          const gapi = await import("gapi-script");
          await gapi.gapi.load("client:auth2", () => {
            gapi.gapi.client
              .init({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                discoveryDocs: [
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
                scope: "https://www.googleapis.com/auth/drive.file",
              })
              .then(() => {
                gapi.gapi.auth2
                  .getAuthInstance()
                  .isSignedIn.listen(updateSigninStatus);
                updateSigninStatus(
                  gapi.gapi.auth2.getAuthInstance().isSignedIn.get()
                );
              });
          });
        } catch (err) {
          console.error("GAPI Initialization Error:", err);
        }
      };

      loadGapi();
    }
  }, [source]);

  const updateSigninStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
    if (isSignedIn) {
      listDriveFiles();
    }
  };

  const handleDriveSignIn = () => {
    if (typeof window !== "undefined" && window.gapi) {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  };

  const handleDriveSignOut = () => {
    if (typeof window !== "undefined" && window.gapi) {
      window.gapi.auth2.getAuthInstance().signOut();
      setEntries([]);
    }
  };

  const listDriveFiles = async () => {
    if (!window.gapi?.client?.drive) return;
  
    try {
      setIsLoading(true);
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' or name contains '.c'",
        fields: "files(id, name, mimeType, parents, modifiedTime)",
        orderBy: "modifiedTime desc",
      });
  
      const allFiles = response.result.files;
      const cFiles = allFiles.filter((file) => file.name.endsWith(".c"));
      
      const rootCFiles = cFiles.filter(file => {
        if (!file.parents || file.parents.length === 0) return true;
        return !allFiles.some(f => f.id === file.parents[0]);
      });
      const foldersWithCFiles = allFiles.filter(file => {
        if (file.mimeType !== "application/vnd.google-apps.folder") return false;
        
        const hasDirectCFiles = cFiles.some(cFile => 
          cFile.parents && cFile.parents.includes(file.id)
        );
        
        const hasChildFoldersWithCFiles = allFiles.some(f => 
          f.mimeType === "application/vnd.google-apps.folder" &&
          f.parents && f.parents.includes(file.id) &&
          cFiles.some(cFile => cFile.parents && cFile.parents.includes(f.id))
        );
        
        return hasDirectCFiles || hasChildFoldersWithCFiles;
      });
  
      setEntries([...foldersWithCFiles, ...rootCFiles]);
    } catch (err) {
      console.error("Error listing files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleDriveFileClick(file) {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      const response = await window.gapi.client.drive.files.list({
        q: `'${file.id}' in parents`,
        fields: "files(id, name, mimeType, modifiedTime)",
      });
      setEntries(response.result.files);
      setHandleStack([...handleStack, file]);
      setCurrentHandle(file);
    } else {
      try {
        setIsLoading(true);
        const response = await window.gapi.client.drive.files.get({
          fileId: file.id,
          alt: "media",
        });
        openTab({
          name: file.name,
          content: response.body,
          driveFileId: file.id,
        });
      } catch (err) {
        console.error("Error opening file:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }

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
    if (source === "local") {
      if (handleStack.length > 1) {
        handleStack.pop();
        const parentHandle = handleStack[handleStack.length - 1];
        setCurrentHandle(parentHandle);
        await readDirectory(parentHandle);
        setHandleStack([...handleStack]);
      }
    } else {
      if (handleStack.length > 1) {
        handleStack.pop();
        const parentHandle = handleStack[handleStack.length - 1];
        setCurrentHandle(parentHandle);
        const response = await window.gapi.client.drive.files.list({
          q: `'${parentHandle.id}' in parents`,
          fields: "files(id, name, mimeType, modifiedTime)",
        });
        setEntries(response.result.files);
        setHandleStack([...handleStack]);
      } else {
        // Go back to root
        await listDriveFiles();
        setHandleStack([]);
        setCurrentHandle(null);
      }
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

      <div className="mb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setSource("local")}
            className={`px-2 py-1 rounded ${
              source === "local" ? "bg-[#3E3E42]" : "bg-[#2D2D2D]"
            }`}
          >
            Local Files
          </button>
          <button
            onClick={() => setSource("drive")}
            className={`px-2 py-1 rounded ${
              source === "drive" ? "bg-[#3E3E42]" : "bg-[#2D2D2D]"
            }`}
          >
            Google Drive
          </button>
        </div>
      </div>

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
          {source === "local" ? (
            <button
              onClick={handleFolderSelect}
              className="p-1 hover:bg-[#3E3E42] rounded"
            >
              Open Folder
            </button>
          ) : (
            <div className="flex space-x-1">
              {isSignedIn ? (
                <>
                  <button
                    onClick={listDriveFiles}
                    className="p-1 hover:bg-[#3E3E42] rounded"
                    title="Refresh"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                  <button
                    onClick={handleDriveSignOut}
                    className="p-1 hover:bg-[#3E3E42] rounded"
                  >
                    <FiLogOut size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDriveSignIn}
                  className="p-1 hover:bg-[#3E3E42] rounded flex items-center"
                >
                  <FiLogIn size={16} className="mr-1" />
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
        {expandedSections.explorer && (
          <div className="mt-2">
            {(handleStack.length > 0 ||
              (source === "drive" && isSignedIn && currentHandle)) && (
              <button
                onClick={goBack}
                className="flex items-center space-x-2 p-1 hover:bg-[#3E3E42] rounded w-full text-left"
              >
                <MdChevronLeft />
                <span>Back</span>
              </button>
            )}

            {isLoading ? (
              <div className="p-2 text-center">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="p-2 text-gray-400">
                {source === "local"
                  ? "No folder selected"
                  : isSignedIn
                  ? "No files found"
                  : "Sign in to view files"}
              </div>
            ) : (
              <ul className="mt-2">
                {entries.map((entry, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      source === "local"
                        ? handleEntryClick(entry)
                        : handleDriveFileClick(entry)
                    }
                    className="flex items-center space-x-2 p-1 hover:bg-[#3E3E42] rounded cursor-pointer"
                  >
                    {source === "local" ? (
                      entry.kind === "directory" ? (
                        <MdFolder />
                      ) : (
                        <MdInsertDriveFile />
                      )
                    ) : entry.mimeType ===
                      "application/vnd.google-apps.folder" ? (
                      <MdFolder />
                    ) : (
                      <MdInsertDriveFile />
                    )}
                    <span>{entry.name}</span>
                  </li>
                ))}
              </ul>
            )}
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
