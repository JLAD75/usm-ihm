import {
    ChartBarIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import {
    ChartBarIcon as ChartBarIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    DocumentTextIcon as DocumentTextIconSolid,
    PresentationChartLineIcon as PresentationChartLineIconSolid,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import FloatingActionMenu from "./FloatingActionMenu";
import ReportsFloatingActionMenu from "./ReportsFloatingActionMenu";

interface BottomNavigationProps {
  activeTab: "userStories" | "reports" | "settings" | "progress";
  onTabChange: (tab: "userStories" | "reports" | "settings" | "progress") => void;
  // Props pour le FloatingActionMenu (optionnelles, seulement pour UserStories)
  onAddUserStory?: () => void;
  onExportExcel?: () => void;
  mobileViewMode?: "cards" | "list";
  onViewModeChange?: (mode: "cards" | "list") => void;
  // Props pour les Reports
  reportView?: "summary" | "sprints" | "gantt" | "llm" | "ai";
  onReportViewChange?: (view: "summary" | "sprints" | "gantt" | "llm" | "ai") => void;
  sprintView?: "table" | "calendar";
  onSprintViewChange?: (view: "table" | "calendar") => void;
}

export default function BottomNavigation({ 
  activeTab, 
  onTabChange,
  onAddUserStory,
  onExportExcel,
  mobileViewMode = "cards",
  onViewModeChange,
  reportView = "summary",
  onReportViewChange,
  sprintView = "table",
  onSprintViewChange,
}: BottomNavigationProps) {
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);

  const tabs = [
    {
      id: "userStories" as const,
      label: "Stories",
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
    },
    {
      id: "reports" as const,
      label: "Rapports", 
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
    {
      id: "progress" as const,
      label: "Avancement",
      icon: PresentationChartLineIcon,
      iconSolid: PresentationChartLineIconSolid,
    },
    {
      id: "settings" as const,
      label: "Paramètres",
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
    },
  ];

  // Diviser les onglets en deux groupes pour placer le FAB au centre
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  // Vérifier si on doit afficher le FloatingActionMenu
  const showFloatingMenu = 
    (activeTab === "userStories" && onAddUserStory && onExportExcel) ||
    (activeTab === "reports" && onReportViewChange);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* SVG pour créer la forme avec encoche profonde */}
      <svg
        viewBox="0 0 390 90"
        className="w-full h-20 absolute bottom-0"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.95)" />
          </linearGradient>
          <linearGradient id="navGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(17, 24, 39, 0.98)" />
            <stop offset="100%" stopColor="rgba(17, 24, 39, 0.95)" />
          </linearGradient>
          {/* Filtre pour l'ombre interne de l'encoche */}
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offset" />
            <feFlood floodColor="rgba(0, 0, 0, 0.15)"/>
            <feComposite in2="offset" operator="in"/>
            <feComposite in2="SourceGraphic" operator="over"/>
          </filter>
        </defs>
        
        {/* Forme principale avec encoche profonde et arrondie */}
        <path
          d="M 0,30 L 0,90 L 390,90 L 390,30 
             L 280,30 
             C 270,30 260,30 250,35
             C 240,40 230,50 220,55
             C 210,60 200,62 195,62
             C 190,62 180,60 170,55
             C 160,50 150,40 140,35
             C 130,30 120,30 110,30
             L 0,30 Z"
          className="fill-white/96 dark:fill-gray-900/96"
          style={{
            filter: "drop-shadow(0 -3px 12px rgba(0, 0, 0, 0.12))"
          }}
        />
        
        {/* Bordure supérieure subtile */}
        <path
          d="M 0,30 L 110,30 
             C 120,30 130,30 140,35
             C 150,40 160,50 170,55
             C 180,60 190,62 195,62
             C 200,62 210,60 220,55
             C 230,50 240,40 250,35
             C 260,30 270,30 280,30
             L 390,30"
          className="stroke-gray-200/80 dark:stroke-gray-700/80 fill-none"
          strokeWidth="1"
        />
      </svg>

      {/* Contenu de la navigation avec backdrop blur */}
      <div className="relative z-10 backdrop-blur-lg">
        <div className="flex items-center justify-between px-2 py-1 pt-6 pb-0 relative">
          {/* Onglets de gauche */}
          <div className="flex flex-1">
            {leftTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = isActive ? tab.iconSolid : tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 transition-all duration-200 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium truncate max-w-full ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* FloatingActionMenu au centre - incrusté dans l'encoche */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-8">
            {showFloatingMenu ? (
              activeTab === "userStories" ? (
                <FloatingActionMenu
                  isOpen={floatingMenuOpen}
                  onToggle={() => setFloatingMenuOpen(!floatingMenuOpen)}
                  onAddUserStory={onAddUserStory!}
                  onExportExcel={onExportExcel!}
                  mobileViewMode={mobileViewMode}
                  onViewModeChange={onViewModeChange || (() => {})}
                  showViewModeToggle={true}
                />
              ) : activeTab === "reports" ? (
                <ReportsFloatingActionMenu
                  isOpen={floatingMenuOpen}
                  onToggle={() => setFloatingMenuOpen(!floatingMenuOpen)}
                  reportView={reportView}
                  onReportViewChange={onReportViewChange!}
                  sprintView={sprintView}
                  onSprintViewChange={onSprintViewChange}
                />
              ) : null
            ) : (
              <div className="w-16 h-16" /> // Espace réservé pour maintenir l'alignement
            )}
          </div>

          {/* Onglets de droite */}
          <div className="flex flex-1">
            {rightTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = isActive ? tab.iconSolid : tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 transition-all duration-200 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""} transition-transform duration-200`} />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium truncate max-w-full ${
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
