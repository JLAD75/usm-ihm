import { Dialog } from "@headlessui/react";
import { ChangeEvent, useRef, useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";

interface Props {
  onCreate: (name: string) => void;
  onImport: (file: File) => void;
  loading: boolean;
}

function NoProjectModal({ onCreate, onImport, loading }: Props) {
  const { isMobile } = useDeviceType();
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!projectName.trim()) {
      setError("Le nom du projet est requis.");
      return;
    }
    setError("");
    onCreate(projectName.trim());
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open
      onClose={() => {}}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative shadow-2xl z-10 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6",
          isMobile
            ? "fixed inset-4 rounded-2xl p-6 max-h-[calc(100vh-2rem)] overflow-y-auto"
            : "rounded-2xl w-full max-w-md mx-auto p-8"
        )}
      >
        <h2
          className={cn(
            "font-bold text-indigo-700 dark:text-indigo-300 text-center",
            isMobile ? "text-3xl" : "text-2xl"
          )}
        >
          Bienvenue !
        </h2>

        <p
          className={cn(
            "text-center text-gray-700 dark:text-gray-200",
            isMobile ? "text-lg leading-relaxed" : "text-base"
          )}
        >
          Pour commencer, créez un projet ou importez-en un existant.
        </p>

        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label
              className={cn(
                "font-medium text-gray-700 dark:text-gray-200",
                isMobile ? "text-base" : "text-sm"
              )}
            >
              Créer un projet
            </label>
            <input
              type="text"
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white",
                isMobile ? "h-12 text-base" : "h-10 text-sm"
              )}
              placeholder="Nom du projet"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              disabled={loading}
            />
            {error && (
              <p
                className={cn("text-red-500", isMobile ? "text-sm" : "text-xs")}
              >
                {error}
              </p>
            )}
            <button
              className={cn(
                "w-full mt-1 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60",
                isMobile ? "px-6 py-4 text-base" : "px-4 py-2"
              )}
              onClick={handleCreate}
              disabled={loading}
            >
              Créer
            </button>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <label
              className={cn(
                "font-medium text-gray-700 dark:text-gray-200",
                isMobile ? "text-base" : "text-sm"
              )}
            >
              Ou importer un projet
            </label>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className={cn(
                "block w-full text-gray-500 file:mr-4 file:rounded file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100",
                isMobile
                  ? "text-base file:py-3 file:px-6 file:text-base"
                  : "text-sm file:py-2 file:px-4 file:text-sm"
              )}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default NoProjectModal;
