import React from 'react';
import { useDeviceType } from "../../hooks/use-mobile";
import SprintCalendar from "./SprintCalendar";
import SprintTable from "./SprintTable";

interface SprintTabsPanelProps {
  activeSprintView?: "table" | "calendar";
  onSprintViewChange?: (view: "table" | "calendar") => void;
}

const SprintTabsPanel: React.FC<SprintTabsPanelProps> = ({
  activeSprintView,
  onSprintViewChange,
}) => {
  const [tab, setTab] = React.useState<"table" | "calendar">(
    activeSprintView || "table"
  );
  const { isMobile } = useDeviceType();

  // Synchroniser l'état local avec les props externes
  React.useEffect(() => {
    if (activeSprintView && activeSprintView !== tab) {
      setTab(activeSprintView);
    }
  }, [activeSprintView, tab]);

  // Gérer le changement de vue (local ou externe)
  const handleViewChange = (view: "table" | "calendar") => {
    setTab(view);
    if (onSprintViewChange) {
      onSprintViewChange(view);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-0 ${
        isMobile ? "p-2" : "p-3 pt-1"
      }`}
    >
      {/* Onglets - masqués sur mobile car on utilisera le FAB pour naviguer */}
      {!isMobile && (
        <div className="flex space-x-2 mb-0">
          <button
            className={`px-4 py-2 rounded-t-md font-medium focus:outline-none transition-colors ${
              tab === "table"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
            onClick={() => handleViewChange("table")}
          >
            Tableau des sprints
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-medium focus:outline-none transition-colors ${
              tab === "calendar"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
            onClick={() => handleViewChange("calendar")}
          >
            Calendrier des sprints
          </button>
        </div>
      )}

      <div className={isMobile ? "px-1" : ""}>
        {tab === "table" && <SprintTable />}
        {tab === "calendar" && <SprintCalendar />}
      </div>
    </div>
  );
};

export default SprintTabsPanel;
