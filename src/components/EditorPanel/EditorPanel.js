"use client";

import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@/components/Editor/Editor";
import Terminal from "@/components/Terminal/Terminal";
import Tabs from "../Tabs/Tabs";

function EditorPanel({ tabs, setTabs,currentTab, setCurrentTab }) {
  const closeTab = (tabName) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.name !== tabName));
    if (currentTab === tabName) {
      setCurrentTab(tabs.length > 1 ? tabs[0].name : null);
    }
  };

  return (
    <div className="h-full rounded-md">
      <PanelGroup direction="vertical">
        <Panel defaultSize={70} minSize={30} className="">
          <div className="h-full bg-[#202020] rounded-lg shadow-lg p-4">
            <Tabs
              tabs={tabs}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              closeTab={closeTab}
            />
            <Editor
              fileContent={
                tabs.find((tab) => tab.name === currentTab)?.content || ""
              }
            />
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
  );
}

export default EditorPanel;
