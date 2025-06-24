import { Dialog } from "@headlessui/react";
import React from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";

interface DependencyBlockModalProps {
  open: boolean;
  onClose: () => void;
  dependencyId?: string | null;
}

const DependencyBlockModal: React.FC<DependencyBlockModalProps> = ({
  open,
  onClose,
  dependencyId,
}) => {
  const { isMobile } = useDeviceType();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-white dark:bg-gray-900 shadow-xl z-10",
          isMobile
            ? "fixed inset-4 rounded-2xl p-6 max-h-[calc(100vh-2rem)] overflow-y-auto"
            : "rounded-lg max-w-sm w-full mx-4 p-6"
        )}
      >
        <h2
          className={cn(
            "font-bold text-indigo-600 dark:text-indigo-400",
            isMobile ? "text-xl mb-6" : "text-lg mb-4"
          )}
        >
          Dépendance non respectée
        </h2>

        <p
          className={cn(
            "text-gray-700 dark:text-gray-200",
            isMobile ? "mb-8 text-base leading-relaxed" : "mb-6"
          )}
        >
          Vous ne pouvez pas déplacer cette User Story avant celle dont elle
          dépend
          {dependencyId && (
            <span className="font-semibold"> ({dependencyId})</span>
          )}
          .
          <br />
          Veuillez d'abord déplacer la dépendance ou modifier la relation.
        </p>

        <div
          className={cn(isMobile ? "flex justify-center" : "flex justify-end")}
        >
          <button
            onClick={onClose}
            className={cn(
              "rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors",
              isMobile
                ? "px-8 py-3 text-base w-full" // Pleine largeur sur mobile
                : "px-4 py-2"
            )}
            autoFocus={!isMobile} // Pas d'autofocus sur mobile
          >
            Fermer
          </button>{" "}
        </div>
      </div>
    </Dialog>
  );
};

export default DependencyBlockModal;
