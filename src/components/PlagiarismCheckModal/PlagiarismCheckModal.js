"use client";
import { useState } from "react";

export default function PlagiarismCheckModal({ isOpen, onClose }) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckPlagiarism = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          language: "c",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (!data || typeof data.is_ai_generated === 'undefined') {
        throw new Error("Invalid response format from server");
      }

      setResult({
        isAiGenerated: data.is_ai_generated,
        confidence: data.confidence,
        indicators: data.indicators || [],
        suspiciousSections: data.suspicious_sections || [],
        details: data.details || {},
        warnings: data.warnings || []
      });
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      setError(error.message || "Failed to check for AI-generated code");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCode("");
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? "block" : "hidden"}`}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={resetForm}>
          <div className="absolute inset-0 bg-gray-900 opacity-90"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-700">
          <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-100 mb-4">
              Detect AI-Generated Code
            </h3>
            <div className="mt-2">
              <textarea
                className="w-full h-64 p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your code here to check for AI generation..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            
            {isLoading && (
              <div className="mt-4 p-3 bg-gray-700 border border-gray-600 rounded-md">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-300">Analyzing code for AI patterns...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-gray-200">Analysis Results:</h4>
                
                <div className="p-3 rounded-md bg-gray-700 border border-gray-600">
                  <p className="font-medium text-gray-200">
                    AI Generation Likelihood:{" "}
                    <span
                      className={`font-bold ${
                        result.isAiGenerated ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {result.isAiGenerated ? "HIGH" : "LOW"}
                    </span>
                  </p>
                  <p className="mt-1 text-gray-300">
                    Confidence:{" "}
                    <span
                      className={`font-bold ${
                        result.confidence > 70
                          ? "text-red-400"
                          : result.confidence > 30
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {result.confidence.toFixed(1)}%
                    </span>
                  </p>
                </div>

                {result.indicators.length > 0 && (
                  <div className="p-3 rounded-md bg-gray-700 border border-gray-600">
                    <h5 className="font-medium text-gray-200">Key Indicators:</h5>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-300">
                      {result.indicators.map((indicator, index) => (
                        <li key={index} className="text-sm">
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suspiciousSections.length > 0 && (
                  <div className="p-3 rounded-md bg-gray-700 border border-gray-600">
                    <h5 className="font-medium text-gray-200">Suspicious Sections:</h5>
                    <div className="mt-2 space-y-2">
                      {result.suspiciousSections.map((section, index) => (
                        <div key={index} className="p-2 bg-gray-800 rounded border border-gray-600">
                          <pre className="text-xs text-gray-300 overflow-x-auto">{section}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.warnings?.length > 0 && (
                  <div className="p-3 rounded-md bg-yellow-900/30 border border-yellow-700">
                    <h5 className="font-medium text-yellow-200">Warnings:</h5>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-yellow-200">
                      {result.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-gray-800/80 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-700">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckPlagiarism}
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : "Check for AI Code"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={resetForm}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}