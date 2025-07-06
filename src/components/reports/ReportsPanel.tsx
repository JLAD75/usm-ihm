import React, { useState } from 'react';
import { useDeviceType } from "../../hooks/use-mobile";
import GanttChart from "./GanttChart";
import LLMPromptGenerator from "./LLMPromptGenerator";
import ProjectChatWithAI from "./ProjectChatWithAI";
import SprintTabsPanel from "./SprintTabsPanel";
import SummaryTable from "./SummaryTable";

const tabs = [
  { key: "summary", label: "Tableau synthétique" },
  { key: "sprints", label: "Sprints" },
  { key: "gantt", label: "Diagramme de Gantt" },
  { key: "llm", label: "Générateur de prompt LLM" },
  { key: "ai", label: "Chat IA Projet" },
];

interface ReportsPanelProps {
  activeView?: "summary" | "sprints" | "gantt" | "llm" | "ai";
  onViewChange?: (view: "summary" | "sprints" | "gantt" | "llm" | "ai") => void;
  sprintView?: "table" | "calendar";
  onSprintViewChange?: (view: "table" | "calendar") => void;
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({
  activeView,
  onViewChange,
  sprintView,
  onSprintViewChange,
}) => {
  const [activeTab, setActiveTab] = useState(activeView || "summary");
  const { isMobile } = useDeviceType();

  // Synchroniser l'état local avec les props externes
  React.useEffect(() => {
    if (activeView && activeView !== activeTab) {
      setActiveTab(activeView);
    }
  }, [activeView, activeTab]);

  // Gérer le changement de vue (local ou externe)
  const handleViewChange = (
    view: "summary" | "sprints" | "gantt" | "llm" | "ai"
  ) => {
    setActiveTab(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="space-y-0">
      {/* Onglets desktop uniquement */}
      {!isMobile && (
        <div className="flex gap-2 mb-0">
          {" "}
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                handleViewChange(
                  tab.key as "summary" | "sprints" | "gantt" | "llm" | "ai"
                )
              }
              className={`px-4 py-2 rounded-t-md font-medium border-b-2 transition-colors duration-150 focus:outline-none ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600 bg-white dark:bg-gray-800"
                  : "border-transparent text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 hover:text-indigo-600"
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div>
        {activeTab === "summary" && <SummaryTable />}
        {activeTab === "sprints" && (
          <SprintTabsPanel
            activeSprintView={sprintView}
            onSprintViewChange={onSprintViewChange}
          />
        )}
        {activeTab === "gantt" && <GanttChart />}
        {activeTab === "llm" && <LLMPromptGenerator />}
        {activeTab === "ai" && <ProjectChatWithAI />}
      </div>
    </div>
  );
};

export default ReportsPanel;
