"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { FiFolder, FiFile, FiEdit2, FiSave, FiList, FiLogIn } from "react-icons/fi";
import styles from './GoogleDriveExplorer.module.css';

const SCOPES = "https://www.googleapis.com/auth/drive.file";

function GoogleDriveExplorer() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadGapi = async () => {
        try {
          setIsLoading(true);
          const gapi = await import("gapi-script");
          
          await gapi.gapi.load("client:auth2", () => {
            gapi.gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
              ],
              scope: SCOPES,
            }).then(() => {
              gapi.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
              updateSigninStatus(gapi.gapi.auth2.getAuthInstance().isSignedIn.get());
            });
          });
        } catch (err) {
          console.error("GAPI Initialization Error:", err);
          setError("Failed to initialize Google API");
        } finally {
          setIsLoading(false);
        }
      };

      loadGapi();
    }
  }, []);

  const updateSigninStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
    if (isSignedIn) {
      listFiles();
    }
  };

  const handleSignIn = () => {
    if (typeof window !== "undefined" && window.gapi) {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined" && window.gapi) {
      window.gapi.auth2.getAuthInstance().signOut();
      setFiles([]);
      setSelectedFile(null);
      setFileContent("");
    }
  };

  const listFiles = async () => {
    if (!window.gapi?.client?.drive) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' or name contains '.c'",
        fields: "files(id, name, mimeType, parents, modifiedTime)",
        orderBy: "modifiedTime desc",
      });

      const allFiles = response.result.files;
      const cFiles = allFiles.filter((file) => file.name.endsWith(".c"));
      const cFileFolderIds = new Set(
        cFiles.map((file) => file.parents?.[0]).filter(Boolean)
      );
      
      const filteredFolders = allFiles.filter(
        (file) =>
          file.mimeType === "application/vnd.google-apps.folder" &&
          cFileFolderIds.has(file.id)
      );

      setFiles([...filteredFolders, ...cFiles]);
    } catch (err) {
      console.error("Error listing files:", err);
      setError("Failed to list files from Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  const openFile = async (fileId) => {
    if (!window.gapi?.client?.drive) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await window.gapi.client.drive.files.get({
        fileId,
        alt: "media",
      });
      
      setSelectedFile(files.find(f => f.id === fileId));
      setFileContent(response.body);
    } catch (err) {
      console.error("Error opening file:", err);
      setError("Failed to open file");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !window.gapi?.auth) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const blob = new Blob([fileContent], { type: "text/plain" });
      const metadata = {
        name: selectedFile.name,
        mimeType: "text/plain",
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append("file", blob);

      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${selectedFile.id}?uploadType=multipart`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${window.gapi.auth.getToken().access_token}`,
          },
          body: form,
        }
      );
      await listFiles();
    } catch (err) {
      console.error("Error saving file:", err);
      setError("Failed to save file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="beforeInteractive"
      />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Google Drive Code Explorer</h1>
          <p className={styles.subtitle}>Browse and edit your C files directly from Google Drive</p>
        </header>

        <div className={styles.toolbar}>
          {!isSignedIn ? (
            <button 
              onClick={handleSignIn} 
              className={styles.buttonPrimary}
              disabled={isLoading}
            >
              <FiLogIn className={styles.icon} /> Sign in with Google
            </button>
          ) : (
            <>
              <button 
                onClick={listFiles} 
                className={styles.button}
                disabled={isLoading}
              >
                <FiList className={styles.icon} /> Refresh Files
              </button>
              <button 
                onClick={handleSignOut} 
                className={styles.buttonSecondary}
                disabled={isLoading}
              >
                Sign Out
              </button>
            </>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)} className={styles.closeError}>
              ×
            </button>
          </div>
        )}

        {isLoading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        )}

        {files.length > 0 && (
          <div className={styles.fileBrowser}>
            <h3 className={styles.sectionTitle}>Your Files and Folders</h3>
            <ul className={styles.fileList}>
              {files.map((file) => (
                <li key={file.id} className={styles.fileItem}>
                  <div className={styles.fileIcon}>
                    {file.mimeType === "application/vnd.google-apps.folder" ? (
                      <FiFolder size={20} />
                    ) : (
                      <FiFile size={20} />
                    )}
                  </div>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    {file.modifiedTime && (
                      <span className={styles.fileDate}>
                        Last modified: {new Date(file.modifiedTime).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {file.mimeType !== "application/vnd.google-apps.folder" && (
                    <button 
                      onClick={() => openFile(file.id)} 
                      className={styles.fileAction}
                      disabled={isLoading}
                    >
                      <FiEdit2 size={16} /> Open
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedFile && (
          <div className={styles.editorContainer}>
            <h3 className={styles.sectionTitle}>
              Editing: <span className={styles.fileName}>{selectedFile.name}</span>
            </h3>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className={styles.codeEditor}
              spellCheck="false"
            />
            <div className={styles.editorActions}>
              <button 
                onClick={saveFile} 
                className={styles.buttonPrimary}
                disabled={isLoading}
              >
                <FiSave className={styles.icon} /> Save Changes
              </button>
            </div>
          </div>
        )}

        {!isLoading && files.length === 0 && isSignedIn && (
          <div className={styles.emptyState}>
            <p>No C files or folders found in your Google Drive.</p>
            <p>Upload some .c files to get started!</p>
          </div>
        )}
      </div>
    </>
  );
}

export default GoogleDriveExplorer;