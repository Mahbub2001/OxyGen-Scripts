"use client";
import { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Menu } from "lucide-react";
import FileExplorer from "@/components/FileExplorar/FileExplorer";
import AiAssistant from "@/components/AiAssistant/AiAssistant";
import Editor from "@/components/Editor/Editor";
import Terminal from "@/components/Terminal/Terminal";

export default function Home() {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [fileContent, setFileContent] = useState("");

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!isLeftSidebarOpen);
    setRightSidebarOpen(false);
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(!isRightSidebarOpen);
    setLeftSidebarOpen(false);
  };

  const handleEditorChange = (newContent) => {
    setFileContent(newContent);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="h-screen w-full sticky">
      <div className="md:hidden flex justify-between p-4">
        <button onClick={toggleLeftSidebar}>
          <Menu className="h-6 w-6" />
        </button>
        <button onClick={toggleRightSidebar}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <PanelGroup direction="horizontal">
        <Panel
          defaultSize={15}
          minSize={0}
          maxSize={30}
          className={`${isLeftSidebarOpen ? "block" : "hidden"} md:block`}
        >
          <div className="bg-[#202020] h-full p-2 shadow-2xl rounded-md">
            <FileExplorer setFileContent={setFileContent} />
          </div>
        </Panel>

        <PanelResizeHandle className="border-3 border-transparent cursor-col-resize hidden md:block" />

        <Panel defaultSize={70} minSize={40}>
          <div className="h-full rounded-md">
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30} className="">
                <div className="h-full bg-[#202020] rounded-lg shadow-lg p-4">
                  <Editor fileContent={fileContent} onContentChange={handleEditorChange} />
                </div>
              </Panel>

              <PanelResizeHandle className="border-3 border-transparent cursor-col-resize block" />

              <Panel defaultSize={30} minSize={30} className="">
                <div className="bg-[#202020] h-full rounded-lg shadow-lg p-4">
                  <Terminal />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>

        <PanelResizeHandle className="border-3 border-transparent cursor-col-resize hidden md:block" />

        <Panel
          defaultSize={15}
          minSize={0}
          maxSize={30}
          className={`${isRightSidebarOpen ? "block" : "hidden"} md:block`}
        >
          <div className="rounded-md h-full bg-[#202020] p-4">
            <AiAssistant />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}