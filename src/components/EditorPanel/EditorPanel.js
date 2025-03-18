"use client";

import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@/components/Editor/Editor";
import Terminal from "@/components/Terminal/Terminal";
import Tabs from "../Tabs/Tabs";
import InputTaking from "../InputTaking/InputTaking";
import axios from "axios";

function EditorPanel({
  tabs,
  setTabs,
  currentTab,
  setCurrentTab,
  setGetContent,
  getContent,
}) {
  const [currentInput, setCurrentInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");

  const closeTab = (tabName) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.name !== tabName));
    if (currentTab === tabName) {
      setCurrentTab(tabs.length > 1 ? tabs[0].name : null);
    }
  };

  const encode = (str) => {
    return Buffer.from(str, "binary").toString("base64");
  };

  const decode = (str) => {
    return Buffer.from(str, "base64").toString();
  };

  const postSubmission = async (language_id, source_code, stdin) => {
    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_JUDGE_API,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      data: JSON.stringify({
        language_id: language_id,
        source_code: source_code,
        stdin: stdin,
      }),
    };

    try {
      const res = await axios.request(options);
      return res.data.token;
    } catch (error) {
      console.error("Error posting submission:", error);
      throw error;
    }
  };

  const getOutput = async (token) => {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Key": process.env.NEXT_PUBLIC_JUDGE_API,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      const res = await axios.request(options);

      if (res.data.status_id <= 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return getOutput(token);
      }

      return res.data;
    } catch (error) {
      console.error("Error fetching output:", error);
      throw error;
    }
  };

  const runCode = async () => {
    try {
      const language_id = 103; // For C
      const source_code = encode(getContent);
      const stdin = encode(currentInput);

      const token = await postSubmission(language_id, source_code, stdin);
      // console.log("Submission token:", token);

      const res = await getOutput(token);

      const status_name = res.status.description;
      const decoded_output = decode(res.stdout ? res.stdout : "");
      const decoded_compile_output = decode(
        res.compile_output ? res.compile_output : ""
      );
      const decoded_error = decode(res.stderr ? res.stderr : "");

      let final_output = "";
      if (res.status_id !== 3) {
        final_output =
          decoded_compile_output === ""
            ? decoded_error
            : decoded_compile_output;
      } else {
        final_output = decoded_output;
      }

      setCurrentOutput(status_name + "\n\n" + final_output);
    } catch (error) {
      console.error("Error running code:", error);
      setCurrentOutput("Error: Failed to execute code. Please try again.");
    }
  };

  return (
    <div className="h-full rounded-md">
      <PanelGroup direction="vertical">
        <Panel defaultSize={70} minSize={30} className="">
          <div className="h-full bg-[#202020] rounded-lg shadow-lg p-2">
            <div className="flex justify-between">
              <Tabs
                tabs={tabs}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                closeTab={closeTab}
              />
              <button
                type="button"
                onClick={runCode}
                className="focus:outline-none cursor-pointer text-white bg-purple-900 hover:bg-purple-900 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-1.5 mb-2 dark:bg-purple-900 dark:hover:bg-purple-900 dark:focus:ring-purple-900"
              >
                Run
              </button>
            </div>
            <Editor
              fileContent={
                tabs.find((tab) => tab.name === currentTab)?.content || ""
              }
              setGetContent={setGetContent}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="border-3 border-transparent cursor-col-resize block" />

        <Panel defaultSize={30} minSize={0} className="">
          <div className="bg-[#202020] h-full rounded-lg shadow-lg p-4">
            <PanelGroup direction="horizontal">
              <Panel defaultSize={50} minSize={30} className="">
                <Terminal currentOutput={currentOutput} />
              </Panel>

              <PanelResizeHandle className="border-3 border-black cursor-row-resize block" />

              <Panel defaultSize={50} minSize={30} className="">
                <div className="h-full bg-[#202020] text-white px-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Input</h3>
                  <InputTaking
                    currentInput={currentInput}
                    setCurrentInput={setCurrentInput}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default EditorPanel;
