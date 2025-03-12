"use client"
import { useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const GenerateReportModal = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-opacity-50 shadow-lg flex items-center justify-center text-black">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">Generate Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 p-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded"
            >
              Upload and Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportModal;