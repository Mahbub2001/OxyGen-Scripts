'use client';

import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const LiveCollaborationForm = ({ onClose }) => {
    const router = useRouter();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }
        router.push(`/editor/${[roomId]}?username=${username}`);
        onClose();
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
            <div className="p-6 rounded-2xl shadow-lg w-[90%] max-w-md transform transition-all ">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Join or Create a Room</h4>
                    <button 
                        onClick={onClose} 
                        className="text-gray-600 hover:text-gray-900 transition"
                    >
                        ✖
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                </div>

                <div className="mt-5 flex flex-col gap-3">
                    <button 
                        className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        onClick={joinRoom}
                    >
                        Join Room
                    </button>
                    <button 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                        onClick={createNewRoom}
                    >
                        Create New Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveCollaborationForm;