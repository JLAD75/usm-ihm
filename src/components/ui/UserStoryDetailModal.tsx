import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import React, { useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";
import { UserStory } from "../../types/UserStory";

interface UserStoryDetailModalProps {
  userStory: UserStory | null;
  isOpen: boolean;
  onClose: () => void;
}

// Obtenir la couleur de priorité
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Must Have":
      return "bg-red-500 dark:bg-red-600";
    case "Should Have":
      return "bg-yellow-500 dark:bg-yellow-600";
    case "Could Have":
      return "bg-green-500 dark:bg-green-600";
    default:
      return "bg-gray-500 dark:bg-gray-600";
  }
};

const UserStoryDetailModal: React.FC<UserStoryDetailModalProps> = ({
  userStory,
  isOpen,
  onClose,
}) => {
  const { isMobile } = useDeviceType();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Délai pour l'animation de fermeture
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  if (!userStory) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Arrière-plan avec blur et fade-in/fade-out */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-150 opacity-100 bento-modal-anim ${
          isClosing ? "animate-fadeout" : "animate-fadein"
        }`}
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Contenu responsive adapté aux mobiles */}
      <div
        className={cn(
          "bento-modal-anim relative shadow-2xl z-10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg",
          "transition-all duration-150",
          isClosing ? "animate-fadeout" : "animate-fadein",
          // Mobile: plein écran avec marges minimales
          isMobile
            ? "fixed inset-4 rounded-2xl overflow-y-auto max-h-[calc(100vh-2rem)]"
            : "rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        )}
      >
        {/* Header avec bouton de fermeture mobile-friendly */}
        <div
          className={cn(
            "sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200/50 dark:border-gray-700/50 z-20",
            isMobile ? "p-4 rounded-t-2xl" : "p-6 rounded-t-2xl"
          )}
        >
          <button
            className={cn(
              "absolute text-gray-400 hover:text-gray-700 z-40 dark:hover:text-white transition-colors",
              isMobile
                ? "top-3 right-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-full" // Plus grand sur mobile
                : "top-4 right-4 p-1"
            )}
            onClick={handleClose}
          >
            <XMarkIcon
              className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")}
            />
          </button>

          {/* Titre responsive */}
          <h2
            className={cn(
              "font-extrabold text-gray-900 dark:text-white text-center break-words tracking-tight drop-shadow pr-12",
              isMobile ? "text-xl mb-3" : "text-3xl mb-2"
            )}
          >
            {userStory.title}
          </h2>

          {/* ID et priorité */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span
              className={cn(
                "font-bold text-indigo-600 dark:text-indigo-300",
                isMobile ? "text-base" : "text-lg"
              )}
            >
              {userStory.id}
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded text-sm font-bold uppercase text-white shadow",
                getPriorityColor(userStory.priority),
                isMobile && "px-4 py-2" // Plus grand sur mobile
              )}
              title={userStory.priority}
            >
              {userStory.priority}
            </span>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className={cn(isMobile ? "p-4" : "p-6")}>
          <div
            className={cn(
              "grid gap-4",
              // Sur mobile: 1 colonne, sur desktop: 2 colonnes
              isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            )}
          >
            {/* Carte Epic */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-indigo-50/80 dark:bg-indigo-900/40 shadow flex flex-col items-start transition-transform",
                isMobile ? "p-4 hover:scale-[1.02]" : "p-4 hover:scale-[1.03]"
              )}
            >
              <span className="text-xs text-indigo-700 dark:text-indigo-200 font-semibold mb-1">
                Epic
              </span>
              <span className="font-medium text-gray-900 dark:text-white break-words w-full">
                {userStory.epic}
              </span>
            </div>

            {/* Carte Estimation */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-green-50/80 dark:bg-green-900/40 shadow flex flex-col items-start transition-transform",
                isMobile ? "p-4 hover:scale-[1.02]" : "p-4 hover:scale-[1.03]"
              )}
              style={{ animationDelay: "0.04s" }}
            >
              <span className="text-xs text-green-700 dark:text-green-200 font-semibold mb-1">
                Estimation
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userStory.estimation} jours
              </span>
            </div>

            {/* Carte Début */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-blue-50/80 dark:bg-blue-900/40 shadow flex flex-col items-start transition-transform",
                isMobile ? "p-4 hover:scale-[1.02]" : "p-4 hover:scale-[1.03]"
              )}
              style={{ animationDelay: "0.08s" }}
            >
              <span className="text-xs text-blue-700 dark:text-blue-200 font-semibold mb-1">
                Début
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userStory.estimatedStartDate
                  ? format(userStory.estimatedStartDate, "dd/MM/yyyy")
                  : "-"}
              </span>
            </div>

            {/* Carte Fin */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-pink-50/80 dark:bg-pink-900/40 shadow flex flex-col items-start transition-transform",
                isMobile ? "p-4 hover:scale-[1.02]" : "p-4 hover:scale-[1.03]"
              )}
              style={{ animationDelay: "0.12s" }}
            >
              <span className="text-xs text-pink-700 dark:text-pink-200 font-semibold mb-1">
                Fin
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userStory.estimatedEndDate
                  ? format(userStory.estimatedEndDate, "dd/MM/yyyy")
                  : "-"}
              </span>
            </div>

            {/* Carte Rôle */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-purple-50/80 dark:bg-purple-900/40 shadow flex flex-col items-start transition-transform",
                isMobile ? "p-4 hover:scale-[1.02]" : "p-4 hover:scale-[1.03]"
              )}
              style={{ animationDelay: "0.16s" }}
            >
              <span className="text-xs text-purple-700 dark:text-purple-200 font-semibold mb-1">
                Rôle
              </span>
              <span className="font-medium text-gray-900 dark:text-white break-words w-full">
                {userStory.userRole}
              </span>
            </div>

            {/* Carte Dépendance */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-gray-50/80 dark:bg-gray-800/40 shadow flex flex-col items-start transition-transform",
                isMobile ? "p-4 hover:scale-[1.02]" : "p-4 hover:scale-[1.03]"
              )}
              style={{ animationDelay: "0.20s" }}
            >
              <span className="text-xs text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Dépendance
              </span>
              <span className="font-medium text-gray-900 dark:text-white break-words w-full">
                {userStory.dependency ? userStory.dependency : "Aucune"}
              </span>
            </div>

            {/* Carte Justification - Pleine largeur */}
            <div
              className={cn(
                "bento-bounce rounded-xl bg-yellow-50/80 dark:bg-yellow-900/40 shadow flex flex-col items-start transition-transform",
                isMobile
                  ? "p-4 hover:scale-[1.02] col-span-1"
                  : "p-4 hover:scale-[1.03] sm:col-span-2"
              )}
              style={{ animationDelay: "0.24s" }}
            >
              <span className="text-xs text-yellow-700 dark:text-yellow-200 font-semibold mb-1">
                Justification
              </span>
              <span className="font-medium text-gray-900 dark:text-white break-words w-full">
                {userStory.justification || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default UserStoryDetailModal;
