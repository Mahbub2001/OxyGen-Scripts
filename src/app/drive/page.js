"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script"; // Import Script from Next.js

const SCOPES = "https://www.googleapis.com/auth/drive.file";

function GoogleDriveExplorer() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("gapi-script").then((gapi) => {
        gapi.gapi.load("client:auth2", () => {
          gapi.gapi.client
            .init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
              ],
              scope: SCOPES,
            })
            .catch((error) =>
              console.error("GAPI Initialization Error:", error)
            );
        });
      });
    }
  }, []);

  const handleSignIn = () => {
    if (typeof window !== "undefined" && window.gapi) {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  };

  const listFiles = async () => {
    if (!window.gapi?.client?.drive) return;

    const response = await window.gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' or name contains '.c'",
      fields: "files(id, name, mimeType, parents)",
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
  };

  const openFile = async (fileId) => {
    if (!window.gapi?.client?.drive) return;

    const response = await window.gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });
    setSelectedFile(fileId);
    setFileContent(response.body);
  };

  const saveFile = async () => {
    if (!selectedFile || !window.gapi?.auth) return;

    const blob = new Blob([fileContent], { type: "text/plain" });
    const metadata = {
      name: "updated_code.c",
      mimeType: "text/plain",
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", blob);

    await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${selectedFile}?uploadType=multipart`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${window.gapi.auth.getToken().access_token}`,
        },
        body: form,
      }
    );

    alert("File saved successfully!");
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="beforeInteractive"
      />
      <div>
        <h2>Google Drive Explorer</h2>
        <button onClick={handleSignIn}>Sign in with Google</button>
        <button onClick={listFiles}>List Folders & .c Files</button>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.mimeType === "application/vnd.google-apps.folder"
                ? "📁"
                : "📄"}{" "}
              {file.name}
              {file.mimeType !== "application/vnd.google-apps.folder" && (
                <button onClick={() => openFile(file.id)}>Open</button>
              )}
            </li>
          ))}
        </ul>

        {selectedFile && (
          <div>
            <h3>Editing: {selectedFile}</h3>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              rows={10}
              cols={50}
            />
            <button onClick={saveFile}>Save</button>
          </div>
        )}
      </div>
    </>
  );
}

export default GoogleDriveExplorer;
