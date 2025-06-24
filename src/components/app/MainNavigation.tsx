import { useDeviceType } from "../../hooks/use-mobile";

type TabType = "userStories" | "reports" | "settings" | "progress";

interface MainNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function MainNavigation({ activeTab, setActiveTab }: MainNavigationProps) {
  const { isMobile } = useDeviceType();

  const tabs = [
    { id: "userStories" as const, label: "User Stories" },
    { id: "reports" as const, label: "Rapports" },
    { id: "progress" as const, label: "Avancement" },
    { id: "settings" as const, label: "Paramètres" },
  ];

  // Ne s'affiche que sur desktop - la navigation mobile est maintenant en bas
  if (isMobile) {
    return null;
  }

  return (
    <nav className="flex space-x-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            activeTab === tab.id
              ? "bg-indigo-600 text-white"
              : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
