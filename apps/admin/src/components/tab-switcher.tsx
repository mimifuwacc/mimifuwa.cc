"use client";

interface TabSwitcherProps {
  activeTab: "edit" | "preview";
  onTabChange: (tab: "edit" | "preview") => void;
  isSplitView: boolean;
  onSplitViewToggle: () => void;
}

export function TabSwitcher({
  activeTab,
  onTabChange,
  isSplitView,
  onSplitViewToggle,
}: TabSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        type="button"
        onClick={() => onTabChange("edit")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === "edit" || isSplitView
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onTabChange("preview")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === "preview" || isSplitView
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        Preview
      </button>
      <div className="ml-auto">
        <button
          type="button"
          onClick={onSplitViewToggle}
          className={`hidden md:flex px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSplitView
              ? "bg-purple-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          title="Toggle split view (desktop only)"
        >
          {isSplitView ? "Single View" : "Split View"}
        </button>
      </div>
    </div>
  );
}
