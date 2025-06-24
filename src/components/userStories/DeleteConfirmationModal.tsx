import { Dialog } from "@headlessui/react";
import { Trash } from "lucide-react";
import React from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";
import { UserStory } from "../../types/UserStory";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userStory?: UserStory | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  userStory,
}) => {
  const { isMobile } = useDeviceType();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-linear-to-br from-white/90 via-blue-50/90 to-blue-100/90 dark:from-gray-900/95 dark:via-blue-950/90 dark:to-gray-900/90 shadow-2xl z-10 border border-blue-200/60 dark:border-blue-800/60 flex flex-col items-center animate-fade-in",
          isMobile
            ? "fixed inset-4 rounded-2xl p-6 max-h-[calc(100vh-2rem)] overflow-y-auto"
            : "rounded-2xl max-w-md w-full mx-4 p-8"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 shadow-lg",
            isMobile ? "w-20 h-20 mb-6" : "w-16 h-16 mb-4"
          )}
        >
          <Trash
            className={cn(
              "text-red-600 dark:text-red-300",
              isMobile ? "h-10 w-10" : "h-8 w-8"
            )}
          />
        </div>

        {userStory && (
          <div className={cn("text-center", isMobile ? "mb-6" : "mb-3")}>
            <div
              className={cn(
                "text-gray-400 dark:text-gray-500 font-mono mb-2",
                isMobile ? "text-sm" : "text-xs"
              )}
            >
              ID :{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {userStory.id}
              </span>
            </div>
            <div
              className={cn(
                "font-semibold text-gray-800 dark:text-gray-100 mx-auto",
                isMobile
                  ? "text-lg max-w-sm break-words"
                  : "text-base truncate max-w-xs"
              )}
            >
              {userStory.title}
            </div>
          </div>
        )}

        <h2
          className={cn(
            "font-bold text-red-700 dark:text-red-300 text-center",
            isMobile ? "text-2xl mb-4" : "text-xl mb-2"
          )}
        >
          Confirmer la suppression
        </h2>

        <p
          className={cn(
            "text-gray-700 dark:text-gray-200 text-center",
            isMobile ? "mb-8 text-base leading-relaxed" : "mb-6"
          )}
        >
          Voulez-vous vraiment supprimer cette User Story&nbsp;?
          <br />
          <span className="text-sm text-gray-400">
            (Cette action est irréversible)
          </span>
        </p>

        <div
          className={cn(
            "flex w-full mt-2",
            isMobile
              ? "flex-col gap-3" // Stack vertical sur mobile
              : "justify-center gap-4"
          )}
        >
          <button
            onClick={onClose}
            className={cn(
              "rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors",
              isMobile
                ? "px-6 py-4 text-base w-full order-2" // Plus grand sur mobile, après le bouton principal
                : "px-5 py-2"
            )}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold shadow-md transition-colors",
              isMobile
                ? "px-6 py-4 text-base w-full order-1" // Plus grand sur mobile, en premier
                : "px-5 py-2"
            )}
          >
            Supprimer
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
