import { ArrowLeftCircleIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useAuthStore } from "../../store/authStore";

interface UserMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserMenuModal({ isOpen, onClose }: UserMenuModalProps) {
  const { user, logout } = useAuthStore();

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenu de la modale */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-w-[90vw] mx-4 overflow-hidden">
        {/* Header avec info utilisateur */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
          <div className="flex items-center space-x-3">
            {user?.photos && user.photos[0]?.value ? (
              <img
                src={user.photos[0].value}
                alt={user.displayName || "Utilisateur"}
                className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {user?.displayName || "Utilisateur"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.emails?.[0]?.value || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            <ArrowLeftCircleIcon className="w-5 h-5" />
            Se déconnecter
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
