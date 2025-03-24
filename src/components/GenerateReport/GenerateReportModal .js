"use client";
import { useState } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const GenerateReportModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("question", question);
    const toastId = toast.info("Uploading files and analyzing...", {
      autoClose: false,
      closeButton: false,
    });
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
      await createAndDownloadZip(response.data);
      toast.dismiss(toastId);
      toast.success("Files uploaded and analyzed successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.dismiss(toastId);
      toast.error("An error occurred while processing the files.");
    }
  };

  const createAndDownloadZip = async(results) => {
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

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-1/3 shadow-xl dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
        <h2 className="text-sm font-semibold mb-6 text-gray-800 text-center dark:text-white">
          Generate Report
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop File Upload */}
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  .c file
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Uploaded Files ({files.length})
              </h3>
              <ul className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-lg dark:bg-gray-600"
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="block text-gray-700 font-medium mb-2 dark:text-gray-300 text-xs">
              Enter Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="text-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex flex-col md:flex-row justify-end space-x-3 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-2 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
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
