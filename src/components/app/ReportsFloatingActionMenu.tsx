import {
    ArrowLeft,
    BarChart3,
    Brain,
    Calendar,
    FileText,
    MessageSquare,
    Plus,
    Table,
} from "lucide-react";
import { cn } from "../../lib/mobileUtils";

// Styles d'animation CSS personnalisés (accélérés)
const animationStyles = `
  @keyframes slideUpFade {
    0% {
      opacity: 0;
      transform: translateY(15px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface ReportsFloatingActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  reportView: "summary" | "sprints" | "gantt" | "llm" | "ai";
  onReportViewChange: (view: "summary" | "sprints" | "gantt" | "llm" | "ai") => void;
  sprintView?: "table" | "calendar";
  onSprintViewChange?: (view: "table" | "calendar") => void;
}

export default function ReportsFloatingActionMenu({
  isOpen,
  onToggle,
  reportView,
  onReportViewChange,
  sprintView = "table",
  onSprintViewChange,
}: ReportsFloatingActionMenuProps) {
  
  // Menu principal pour toutes les vues de rapports
  const mainMenuItems = [
    {
      id: "summary",
      icon: BarChart3,
      label: "Tableau",
      color: `${
        reportView === "summary"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      }`,
      onClick: () => {
        onReportViewChange("summary");
        onToggle();
      },
    },
    {
      id: "sprints",
      icon: Calendar,
      label: "Sprints",
      color: `${
        reportView === "sprints"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      }`,
      onClick: () => {
        onReportViewChange("sprints");
        onToggle();
      },
    },
    {
      id: "gantt",
      icon: FileText,
      label: "Gantt",
      color: `${
        reportView === "gantt"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      }`,
      onClick: () => {
        onReportViewChange("gantt");
        onToggle();
      },
    },
    {
      id: "llm",
      icon: Brain,
      label: "Prompt LLM",
      color: `${
        reportView === "llm"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      }`,
      onClick: () => {
        onReportViewChange("llm");
        onToggle();
      },
    },
    {
      id: "ai",
      icon: MessageSquare,
      label: "Chat IA",
      color: `${
        reportView === "ai"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      }`,
      onClick: () => {
        onReportViewChange("ai");
        onToggle();
      },
    },
  ];

  // Sous-menu pour les sprints (navigation hiérarchique)
  const sprintSubMenuItems = [
    {
      id: "back",
      icon: ArrowLeft,
      label: "Retour",
      color: "bg-gray-500 hover:bg-gray-600",
      onClick: () => {
        // Retourner au tableau synthétique et fermer le menu
        onReportViewChange("summary");
        onToggle();
      },
    },
    {
      id: "toggle-sprint-view",
      icon: sprintView === "table" ? Calendar : Table,
      label: sprintView === "table" ? "Calendrier" : "Tableau",
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => {
        if (onSprintViewChange) {
          onSprintViewChange(sprintView === "table" ? "calendar" : "table");
        }
        onToggle();
      },
    },
  ];

  // Choisir le bon menu selon le contexte
  const menuItems = reportView === "sprints" ? sprintSubMenuItems : mainMenuItems;

  return (
    <>
      {/* Injection des styles d'animation */}
      <style>{animationStyles}</style>

      {/* Overlay transparent pour fermer le menu en cliquant n'importe où */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40 transition-all duration-200"
          onClick={onToggle}
        />
      )}

      {/* Conteneur du menu */}
      <div className="relative">
        {/* Boutons d'action */}
        {isOpen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            {/* Conteneur principal avec backdrop et ombre */}
            <div
              className="flex flex-col items-center gap-3 px-4 py-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 transition-all duration-200 ease-out"
              style={{
                animation: "slideUpFade 200ms ease-out forwards",
                transformOrigin: "bottom center",
              }}
            >
              {/* Disposition adaptative selon le nombre d'items */}
              {menuItems.length <= 3 ? (
                // Une seule ligne pour 3 items ou moins
                <div className="flex items-center gap-4">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="flex flex-col items-center gap-1">
                        <button
                          onClick={item.onClick}
                          className={cn(
                            "w-11 h-11 rounded-xl text-white transition-all duration-200 flex items-center justify-center",
                            "hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl",
                            "transform translate-y-4 opacity-0",
                            item.color
                          )}
                          style={{
                            animation: `slideUpFade 250ms ease-out ${index * 60 + 100}ms forwards`,
                          }}
                        >
                          <Icon className="w-5 h-5 drop-shadow-sm" />
                          <span className="sr-only">{item.label}</span>
                        </button>

                        {/* Label directement sous chaque bouton */}
                        <span
                          className="text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/80 rounded transform translate-y-4 opacity-0"
                          style={{
                            animation: `slideUpFade 250ms ease-out ${index * 60 + 150}ms forwards`,
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Disposition en 2 lignes pour plus de 3 items
                <>
                  {/* Première ligne : 3 premiers items */}
                  <div className="flex items-center gap-4">
                    {menuItems.slice(0, 3).map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.id} className="flex flex-col items-center gap-1">
                          <button
                            onClick={item.onClick}
                            className={cn(
                              "w-11 h-11 rounded-xl text-white transition-all duration-200 flex items-center justify-center",
                              "hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl",
                              "transform translate-y-4 opacity-0",
                              item.color
                            )}
                            style={{
                              animation: `slideUpFade 250ms ease-out ${index * 60 + 100}ms forwards`,
                            }}
                          >
                            <Icon className="w-5 h-5 drop-shadow-sm" />
                            <span className="sr-only">{item.label}</span>
                          </button>

                          {/* Label directement sous chaque bouton */}
                          <span
                            className="text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/80 rounded transform translate-y-4 opacity-0"
                            style={{
                              animation: `slideUpFade 250ms ease-out ${index * 60 + 150}ms forwards`,
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Deuxième ligne : items restants */}
                  {menuItems.length > 3 && (
                    <div className="flex items-center gap-4">
                      {menuItems.slice(3).map((item, index) => {
                        const Icon = item.icon;
                        const globalIndex = index + 3; // Pour l'animation décalée

                        return (
                          <div key={item.id} className="flex flex-col items-center gap-1">
                            <button
                              onClick={item.onClick}
                              className={cn(
                                "w-11 h-11 rounded-xl text-white transition-all duration-200 flex items-center justify-center",
                                "hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl",
                                "transform translate-y-4 opacity-0",
                                item.color
                              )}
                              style={{
                                animation: `slideUpFade 250ms ease-out ${globalIndex * 60 + 100}ms forwards`,
                              }}
                            >
                              <Icon className="w-5 h-5 drop-shadow-sm" />
                              <span className="sr-only">{item.label}</span>
                            </button>

                            {/* Label directement sous chaque bouton */}
                            <span
                              className="text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/80 rounded transform translate-y-4 opacity-0"
                              style={{
                                animation: `slideUpFade 250ms ease-out ${globalIndex * 60 + 150}ms forwards`,
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Bouton central FAB incrusté dans l'encoche */}
        <button
          onClick={onToggle}
          className={cn(
            "w-16 h-16 rounded-full transition-all duration-200 flex items-center justify-center relative",
            "transform-gpu hover:scale-105", // Améliore le rendu des transformations
            "ring-2 ring-white/20 dark:ring-gray-700/40",
            isOpen
              ? "bg-indigo-800 hover:bg-indigo-900"
              : "bg-indigo-600 hover:bg-indigo-700"
          )}
          style={{
            boxShadow: isOpen
              ? "inset 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(99, 102, 241, 0.3)"
              : "0 6px 20px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
            // Assure un rendu net des icônes
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {/* Effet de relief interne - inversé quand ouvert */}
          <div
            className={cn(
              "absolute inset-0 rounded-full pointer-events-none transition-all duration-200",
              isOpen
                ? "bg-gradient-to-b from-black/20 to-transparent"
                : "bg-gradient-to-b from-white/8 to-transparent"
            )}
          />

          {/* Icône Plus toujours identique */}
          <div className="relative z-10 flex items-center justify-center">
            <Plus
              className="w-7 h-7 text-white"
              strokeWidth={2.5}
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                transform: "translateZ(0)", // Force hardware acceleration
              }}
            />
          </div>
        </button>
      </div>
    </>
  );
}
