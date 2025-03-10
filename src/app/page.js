"use client";
import { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Menu } from "lucide-react";
import FileExplorer from "@/components/FileExplorar/FileExplorer";
import AiAssistant from "@/components/AiAssistant/AiAssistant";
import React from "react";
import EditorPanel from "@/components/EditorPanel/EditorPanel";
export default function Home() {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [tabs, setTabs] = useState([]);
  const [currentTab, setCurrentTab] = useState(null);

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

  const openTab = (file) => {
    const existingTab = tabs.find((tab) => tab.name === file.name);
    if (!existingTab) {
      setTabs((prevTabs) => [...prevTabs, file]);
    }
    setCurrentTab(file.name);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="h-screen w-full sticky md:fixed">
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
            <FileExplorer openTab={openTab} />
          </div>
        </Panel>

        <PanelResizeHandle className="border-3 border-transparent cursor-col-resize hidden md:block" />

        <Panel defaultSize={70} minSize={40}>
          <EditorPanel
            tabs={tabs}
            setTabs={setTabs}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
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
