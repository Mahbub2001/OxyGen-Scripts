
'use client'
import React from 'react';

const CollaborationModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className=" rounded-lg p-6 w-11/12 max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default CollaborationModal;