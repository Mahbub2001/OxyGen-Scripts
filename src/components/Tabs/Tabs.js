function Tabs({ tabs, currentTab, setCurrentTab, closeTab }) {
  return (
    <div className="flex items-center bg-[#1E1E1E] border-b border-[#333333]">
      {tabs.map((tab) => (
        <div
          key={tab.name}
          className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
            currentTab === tab.name
              ? "bg-[#2D2D2D] text-white"
              : "bg-[#1E1E1E] text-[#CCCCCC] hover:bg-[#2D2D2D]"
          }`}
          onClick={() => setCurrentTab(tab.name)}
        >
          <span>{tab.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.name);
            }}
            className="ml-2 hover:text-red-500 cursor-pointer"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default Tabs;
