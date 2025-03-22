"use client"

import React from 'react';
import Avatar from 'react-avatar';

const LiveClient = ({ username }) => {
    return (
        <div className="client">
            <Avatar name={username} size={50} round="14px" />
            <span className="userName">{username}</span>
        </div>
    );
};

export default LiveClient;
