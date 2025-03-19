"use client";

import React, { useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const CodeUploadForm = () => {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("question", question);

    try {
      const response = await axios.post(
        "http://localhost:8000/analyze-codes",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResults(response.data);
      createAndDownloadZip(response.data);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const createAndDownloadZip = (results) => {
    const zip = new JSZip();

    results.forEach((result) => {
      const fileName = result.student_name.replace(/\.[^/.]+$/, "");
      const fileContent = `
// Original student code
${result.file_content}

// Comments and suggestions
${result.comments.join("\n")}
`;
      zip.file(`${fileName}_commented.c`, fileContent);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "commented_codes.zip");
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question"
        />
        <button type="submit">Upload and Analyze</button>
      </form>
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <h3>{result.student_name}</h3>
            <p>Rank: {result.rank}</p>
            <ul>
              {result.comments.map((comment, i) => (
                <li key={i}>{comment}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeUploadForm;
