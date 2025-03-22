"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import ACTIONS from "@/Action";
import { initSocket } from "@/socket";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LiveEditor from "@/components/LiveEditor/LiveEditor";
import LiveClient from "@/components/LiveClient/LiveClient";

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const [username, setUsername] = useState("");
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const router = useRouter();
  const { roomId } = useParams(); 
  const searchParams = useSearchParams();

  useEffect(() => {
    const usernameFromParams = searchParams.get("username");
    if (usernameFromParams) {
      setUsername(usernameFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!roomId || !username) {
        router.push("/");
      }
    }, 500); // Delay by 500ms
  
    return () => clearTimeout(timeout);
  }, [roomId, username, router]);
  
  useEffect(() => {
    if (!roomId || !username) return; 

    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        router.push("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };

    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [roomId, username, router]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    router.push("/");
  }

  if (!roomId || !username) {
    return null;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            {/* <img className="logoImage" src="/code-sync.png" alt="logo" /> */}
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <LiveClient key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <LiveEditor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;