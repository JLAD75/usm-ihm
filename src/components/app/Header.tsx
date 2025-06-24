import {
    Bars3Icon,
    UserCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { useDeviceType } from "../../hooks/use-mobile";
import { useAuthStore } from "../../store/authStore";
import ProjectSelector from "../ProjectSelector";
import DateBar from "./DateBar";

interface HeaderProps {
  projectId: string | null;
  projects: any[];
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  setShowUserMenuModal: (show: boolean) => void;
  setProjectId: (id: string | null) => void;
  createProject: (name: string) => Promise<void>;
}

export default function Header({
  projectId,
  projects,
  showMobileMenu,
  setShowMobileMenu,
  setShowUserMenuModal,
  setProjectId,
  createProject,
}: HeaderProps) {
  const { isMobile } = useDeviceType();
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-md">
      {isMobile ? (
        // Header mobile compact
        <div className="flex items-center justify-between h-12 px-3">
          {/* Menu burger + Project selector */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {showMobileMenu ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 min-w-0 max-w-[200px]">
              <ProjectSelector
                selectedProjectId={projectId}
                onSelect={setProjectId}
                onCreate={createProject}
                projects={projects}
              />
            </div>
          </div>
          {/* User menu mobile */}
          <div className="flex items-center">
            <button 
              onClick={() => setShowUserMenuModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/40 dark:bg-gray-900/40 text-gray-900 dark:text-white text-xs font-medium shadow-md hover:bg-white/70 dark:hover:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 border-none transition-all duration-150 backdrop-blur-sm"
            >
              {user?.photos && user.photos[0]?.value ? (
                <img
                  src={user.photos[0].value}
                  alt={user.displayName || "Utilisateur"}
                  className="w-6 h-6 rounded-full object-cover border border-white shadow-sm bg-white"
                />
              ) : (
                <UserCircleIcon className="w-5 h-5" />
              )}
              <span className="sr-only">{user?.displayName}</span>
            </button>
          </div>
        </div>
      ) : (
        // Header desktop
        <div className="flex items-center justify-between h-10 px-4">
          {/* ProjectSelector aligné à gauche */}
          <div className="flex items-center min-w-[220px]">
            <ProjectSelector
              selectedProjectId={projectId}
              onSelect={setProjectId}
              onCreate={createProject}
              projects={projects}
            />
          </div>
          {/* Barre date/heure statique au centre */}
          <DateBar />
          {/* Menu utilisateur à droite */}
          <div className="flex items-center gap-2 min-w-[180px] justify-end">
            <button
              onClick={() => setShowUserMenuModal(true)}
              className="flex items-center gap-2 px-4 py-1 min-w-36 rounded-full bg-white/40 dark:bg-gray-900/40 text-gray-900 dark:text-white text-sm font-medium shadow-md hover:bg-white/70 dark:hover:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 border-none transition-all duration-150 backdrop-blur-sm"
              style={{ minWidth: "9rem", justifyContent: "flex-start" }}
              type="button"
            >
              {user?.photos && user.photos[0]?.value ? (
                <img
                  src={user.photos[0].value}
                  alt={user.displayName || "Utilisateur"}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm bg-white"
                  style={{ minWidth: "1.75rem", minHeight: "1.75rem" }}
                />
              ) : (
                <UserCircleIcon className="w-5 h-5" />
              )}
              <span className="truncate text-xs sm:text-sm max-w-32">
                {user?.displayName}
              </span>
              <svg
                className="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Menu mobile overlay */}
      {isMobile && showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="px-3 py-2">
            <DateBar />
          </div>
        </div>
      )}
    </header>
  );
}
