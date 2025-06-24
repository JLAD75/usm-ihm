import {
  Download,
  Grid3x3,
  List,
  Plus
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

interface FloatingActionMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddUserStory: () => void;
  onExportExcel: () => void;
  mobileViewMode: "cards" | "list";
  onViewModeChange: (mode: "cards" | "list") => void;
  showViewModeToggle: boolean;
}

export default function FloatingActionMenu({
  isOpen,
  onToggle,
  onAddUserStory,
  onExportExcel,
  mobileViewMode,
  onViewModeChange,
  showViewModeToggle,
}: FloatingActionMenuProps) {
  const menuItems = [
    {
      id: "add",
      icon: Plus,
      label: "Nouvelle US",
      color: "bg-indigo-600 hover:bg-indigo-700",
      onClick: () => {
        onAddUserStory();
        onToggle();
      },
    },
    {
      id: "export",
      icon: Download,
      label: "Export Excel",
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => {
        onExportExcel();
        onToggle();
      },
    },
    ...(showViewModeToggle
      ? [
          {
            id: "view-cards",
            icon: Grid3x3,
            label: "Mode Cards",
            color: `${
              mobileViewMode === "cards"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`,
            onClick: () => {
              onViewModeChange("cards");
              onToggle();
            },
          },
          {
            id: "view-list",
            icon: List,
            label: "Mode Liste",
            color: `${
              mobileViewMode === "list"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`,
            onClick: () => {
              onViewModeChange("list");
              onToggle();
            },
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Injection des styles d'animation */}
      <style>{animationStyles}</style>

      {/* Conteneur du menu */}
      <div className="relative">
        {/* Boutons d'action en lignes organisées */}
        {isOpen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            {/* Conteneur principal avec backdrop et ombre */}
            <div
              className="flex flex-col items-center gap-3 px-4 py-4 pb-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 transition-all duration-200 ease-out"
              style={{
                animation: "slideUpFade 200ms ease-out forwards",
                transformOrigin: "bottom center",
              }}
            >
              {/* Première ligne : Nouvelle US et Export Excel */}
              <div className="flex items-center gap-4">
                {menuItems.slice(0, 2).map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <button
                        onClick={item.onClick}
                        className={cn(
                          "w-11 h-11 rounded-xl text-white transition-all duration-200 flex items-center justify-center",
                          "hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl",
                          "transform translate-y-4 opacity-0",
                          item.color
                        )}
                        style={{
                          animation: `slideUpFade 250ms ease-out ${
                            index * 60 + 100
                          }ms forwards`,
                        }}
                      >
                        <Icon className="w-5 h-5 drop-shadow-sm" />
                        <span className="sr-only">{item.label}</span>
                      </button>

                      {/* Label directement sous chaque bouton */}
                      <span
                        className="text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/80 rounded transform translate-y-4 opacity-0"
                        style={{
                          animation: `slideUpFade 250ms ease-out ${
                            index * 60 + 150
                          }ms forwards`,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Deuxième ligne : Mode Cards et Mode Liste */}
              {menuItems.length > 2 && (
                <div className="flex items-center gap-4">
                  {menuItems.slice(2).map((item, index) => {
                    const Icon = item.icon;
                    const globalIndex = index + 2; // Pour l'animation décalée

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col items-center gap-1"
                      >
                        <button
                          onClick={item.onClick}
                          className={cn(
                            "w-11 h-11 rounded-xl text-white transition-all duration-200 flex items-center justify-center",
                            "hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl",
                            "transform translate-y-4 opacity-0",
                            item.color
                          )}
                          style={{
                            animation: `slideUpFade 250ms ease-out ${
                              globalIndex * 60 + 100
                            }ms forwards`,
                          }}
                        >
                          <Icon className="w-5 h-5 drop-shadow-sm" />
                          <span className="sr-only">{item.label}</span>
                        </button>

                        {/* Label directement sous chaque bouton */}
                        <span
                          className="text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700/80 rounded transform translate-y-4 opacity-0"
                          style={{
                            animation: `slideUpFade 250ms ease-out ${
                              globalIndex * 60 + 150
                            }ms forwards`,
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton central FAB incrusté dans l'encoche */}
        <div className="relative">
          {/* Conteneur circulaire pour masquer les débordements */}
          <div className="w-16 h-16 rounded-full overflow-hidden absolute inset-0 z-0 ring-2 ring-white/20 dark:ring-gray-700/40"></div>

          <button
            onClick={onToggle}
            className={cn(
              "w-16 h-16 rounded-full transition-all duration-200 flex items-center justify-center relative z-10",
              "transform-gpu", // Améliore le rendu des transformations
              isOpen
                ? "bg-indigo-800"
                : "bg-indigo-600"
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
                  ? "bg-gradient-to-b from-black/45 to-transparent"
                  : "bg-gradient-to-b from-white/8 to-transparent"
              )}
            />

            {/* Icône avec rendu optimisé */}
            <div className="relative z-10 flex items-center justify-center">
              {isOpen ? (
                <Plus
                  className="w-7 h-7 text-white/50"
                  strokeWidth={2.5}
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
                    transform: "translateZ(0)", // Force hardware acceleration
                  }}
                />
              ) : (
                <Plus
                  className="w-7 h-7 text-white/90"
                  strokeWidth={3}
                  style={{
                    filter:
                      "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5)) blur(0.5px)",
                    transform: "translateZ(0)", // Force hardware acceleration
                  }}
                />
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
