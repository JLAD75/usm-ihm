import { useDeviceType } from "../../hooks/use-mobile";

interface SavingIndicatorProps {
  isSaving: boolean;
}

export default function SavingIndicator({ isSaving }: SavingIndicatorProps) {
  const { isMobile } = useDeviceType();

  if (!isSaving) return null;

  return (
    <div
      className={`fixed z-50 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-full shadow-lg border border-indigo-200 dark:border-indigo-700 animate-pulse ${
        isMobile ? "top-14 right-2 text-xs" : "top-12 right-4"
      }`}
    >
      <svg
        className="w-4 h-4 text-indigo-600 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-200">
        {isMobile ? "Sauvegarde..." : "Sauvegarde en cours…"}
      </span>
    </div>
  );
}
