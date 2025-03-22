"use client";
import { useState } from "react";
import { FaUserCircle, FaCog, FaComments, FaDownload } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import { MdOutlineNoteAlt, MdOutlinePlagiarism } from "react-icons/md";
import GenerateReportModal from "../GenerateReport/GenerateReportModal ";
import CollaborationModal from "../CollaborationModal/CollaborationModal";
import LiveCollaborationForm from "../LiveCollaborationForm/LiveCollaborationForm";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] =
    useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const openModal = () => {
    setIsModalOpen(true);
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const openCollaborationModal = () => {
    setIsCollaborationModalOpen(true);
    setIsOpen(!isOpen);
  };

  const closeCollaborationModal = () => {
    setIsCollaborationModalOpen(false);
  };

  return (
    <nav className="flex items-center justify-between text-white px-4 py-2">
      <div className="flex items-center space-x-3">
        <button className="text-lg font-medium">OxyGen</button>
      </div>

      <div className="flex items-center">
        {/* <input
          type="text"
          placeholder="Ask AI & Search"
          className="bg-gray-800 text-white text-sm px-3 py-1 rounded-md w-60 outline-none"
        />
        <span className="ml-2 text-gray-400 text-xs">Ctrl + K</span> */}
      </div>

      {/* Right side */}
      <div className="relative">
        <button
          className="p-2 focus:outline-none cursor-pointer"
          onClick={toggleMenu}
        >
          <FiMoreVertical size={18} />
        </button>
        <button className="p-2">
          <FaUserCircle size={22} />
        </button>
        {isOpen && (
          <div className="z-50 absolute right-0  top-10 w-40 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <button
              type="button"
              onClick={openModal}
              className="cursor-pointer relative inline-flex items-center w-full px-4 py-2 text-xs font-medium border-b border-gray-200 rounded-t-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white"
            >
              <MdOutlineNoteAlt className="w-3 h-3 me-1" />
              Generate Report
            </button>
            <button
              type="button"
              className="cursor-pointer relative inline-flex items-center w-full px-4 py-2 text-xs font-medium border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white"
            >
              <MdOutlinePlagiarism className="w-3 h-3 me-1" />
              Check Plagiarism
            </button>
            <button
              onClick={openCollaborationModal}
              type="button"
              className="cursor-pointer relative inline-flex items-center w-full px-4 py-2 text-xs font-medium border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white"
            >
              <FaComments className="w-3 h-3 me-1" />
              Live Collaboration
            </button>
            <button
              type="button"
              className="cursor-pointer relative inline-flex items-center w-full px-4 py-2 text-xs font-medium rounded-b-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white"
            >
              <FaDownload className="w-3 h-3 me-1" />
              Download
            </button>
          </div>
        )}
      </div>
      <GenerateReportModal isOpen={isModalOpen} onClose={closeModal} />
      <CollaborationModal
        isOpen={isCollaborationModalOpen}
        onClose={closeCollaborationModal}
      >
        <LiveCollaborationForm onClose={closeCollaborationModal} />
      </CollaborationModal>
    </nav>
  );
}
