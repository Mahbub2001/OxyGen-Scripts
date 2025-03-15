import { useState } from "react";

export const DropdownMenu = ({scenario,setSelectedScenario,scenario_map}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer text-white p-1 rounded-lg focus:outline-none flex items-center"
        >
          {scenario}
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute mt-2 w-48 bg-[#252526] rounded-lg shadow-lg z-10">
            <ul>
              {scenario_map.map((scenario, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setIsOpen(false);
                  }}
                  className="p-2 text-white hover:bg-gray-700 cursor-pointer"
                >
                  {scenario}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };