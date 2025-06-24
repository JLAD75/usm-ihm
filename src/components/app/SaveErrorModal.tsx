import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface SaveErrorModalProps {
  error: string;
  onRetry: () => void;
  onReload: () => void;
}

export default function SaveErrorModal({ error, onRetry, onReload }: SaveErrorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-red-300 dark:border-red-700 flex flex-col items-center">
        <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mb-2" />
        <h2 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">
          Erreur de sauvegarde
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 text-center">
          {error}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onRetry}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Réessayer
          </button>
          <button
            onClick={onReload}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold py-2 rounded-lg transition"
          >
            Recharger
          </button>
        </div>
      </div>
    </div>
  );
}
