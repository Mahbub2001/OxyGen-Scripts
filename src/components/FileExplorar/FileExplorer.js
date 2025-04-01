"use client";
import { useState, useEffect } from "react";
import {
  MdKeyboardArrowDown,
  MdFolder,
  MdInsertDriveFile,
  MdChevronRight,
  MdChevronLeft,
  MdCreateNewFolder,
  MdNoteAdd,
  MdDelete,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [createType, setCreateType] = useState(""); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const deleteItem = async () => {
    if (!itemToDelete || !window.gapi?.client?.drive) {
      setShowDeleteModal(false);
      return;
    }

    try {
      setIsLoading(true);
      await window.gapi.client.drive.files.delete({
        fileId: itemToDelete.id,
      });

      // Refresh the file list
      if (currentHandle) {
        const response = await window.gapi.client.drive.files.list({
          q: `'${currentHandle.id}' in parents`,
          fields: "files(id, name, mimeType, modifiedTime)",
        });
        setEntries(response.result.files);
      } else {
        await listDriveFiles();
      }

      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting item:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewItem = async () => {
    if (!newItemName.trim() || !window.gapi?.client?.drive) {
      setShowCreateModal(false);
      return;
    }

    try {
      setIsLoading(true);
      
      if (createType === "folder") {
        await window.gapi.client.drive.files.create({
          resource: {
            name: newItemName,
            mimeType: "application/vnd.google-apps.folder",
            parents: currentHandle ? [currentHandle.id] : [],
          },
        });
      } else {
        const metadata = {
          name: newItemName.endsWith('.c') ? newItemName : `${newItemName}.c`,
          mimeType: "text/plain",
          parents: currentHandle ? [currentHandle.id] : [],
        };

        const fileContent = ""; 
        
        const form = new FormData();
        form.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append("file", new Blob([fileContent], { type: "text/plain" }));

        await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${window.gapi.auth.getToken().access_token}`,
            },
            body: form,
          }
        );
      }
      if (currentHandle) {
        const response = await window.gapi.client.drive.files.list({
          q: `'${currentHandle.id}' in parents`,
          fields: "files(id, name, mimeType, modifiedTime)",
        });
        setEntries(response.result.files);
      } else {
        await listDriveFiles();
      }
      
      setShowCreateModal(false);
      setNewItemName("");
    } catch (err) {
      console.error("Error creating item:", err);
    } finally {
      setIsLoading(false);
    }
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252526] p-4 rounded-lg w-80">
            <h3 className="text-lg mb-4">
              New {createType === "file" ? "File" : "Folder"}
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter ${createType} name`}
              className="w-full bg-[#1E1E1E] text-white p-2 rounded mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && createNewItem()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewItemName("");
                }}
                className="px-4 py-2 bg-[#3E3E42] rounded"
              >
                Cancel
              </button>
              <button
                onClick={createNewItem}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
       {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252526] p-4 rounded-lg w-80">
            <h3 className="text-lg mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete {`${itemToDelete?.name}`} ?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-[#3E3E42] rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
                  onClick={() => {
                    setCreateType("file");
                    setShowCreateModal(true);
                  }}
                  className="p-1 hover:bg-[#3E3E42] rounded"
                  title="New File"
                >
                  <MdNoteAdd size={16} />
                </button>
                <button
                  onClick={() => {
                    setCreateType("folder");
                    setShowCreateModal(true);
                  }}
                  className="p-1 hover:bg-[#3E3E42] rounded"
                  title="New Folder"
                >
                  <MdCreateNewFolder size={16} />
                </button>
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
                  className="group flex items-center justify-between p-1 hover:bg-[#3E3E42] rounded cursor-pointer"
                >
                  <div 
                    className="flex items-center space-x-2 flex-1"
                    onClick={() =>
                      source === "local"
                        ? handleEntryClick(entry)
                        : handleDriveFileClick(entry)
                    }
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
                  </div>
                  {source === "drive" && isSignedIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(entry);
                        setShowDeleteModal(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                      title="Delete"
                    >
                      <MdDelete size={16} />
                    </button>
                  )}
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
