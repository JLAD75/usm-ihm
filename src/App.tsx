import { format } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Suspense, lazy, useEffect, useState } from "react";
import "./App.css";
import BottomNavigation from "./components/app/BottomNavigation";
import Header from "./components/app/Header";
import LoadingScreen from "./components/app/LoadingScreen";
import MainNavigation from "./components/app/MainNavigation";
import NoProjectModal from "./components/app/NoProjectModal";
import SaveErrorModal from "./components/app/SaveErrorModal";
import SavingIndicator from "./components/app/SavingIndicator";
import UserMenuModal from "./components/app/UserMenuModal";
import WelcomeScreen from "./components/app/WelcomeScreen";
import Login from "./components/Login";
import { useDeviceType } from "./hooks/use-mobile";
import { useAppStore } from "./store/appStore";
import { useAuthStore } from "./store/authStore";

// Lazy loading des composants lourds
const KanbanPanel = lazy(() => import("./components/kanban/KanbanPanel"));
const ReportsPanel = lazy(() => import("./components/reports/ReportsPanel"));
const SettingsPanel = lazy(() => import("./components/settings/SettingsPanel"));
const UserStoriesPanel = lazy(
  () => import("./components/userStories/UserStoriesPanel")
);

export type TabType = "userStories" | "reports" | "settings" | "progress";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("userStories");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenuModal, setShowUserMenuModal] = useState(false);

  // États pour le UserStoriesPanel et FloatingActionMenu
  const [mobileViewMode, setMobileViewMode] = useState<"cards" | "list">(
    "cards"
  );
  const [showUserStoryForm, setShowUserStoryForm] = useState(false);

  // États pour les Reports
  const [reportView, setReportView] = useState<
    "summary" | "sprints" | "gantt" | "llm" | "ai"
  >("summary");
  const [sprintView, setSprintView] = useState<"table" | "calendar">("table");

  const { isMobile } = useDeviceType();

  const {
    setProjectId,
    projectId,
    projects,
    fetchProjects,
    createProject,
    loadUserStories,
    theme,
    fetchUserTheme,
    isSaving,
    saveError,
    recalculateDates,
  } = useAppStore();

  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStart, setLoaderStart] = useState<number | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);

  // Gestion modale "aucun projet" (après chargement)
  const showNoProjectModal =
    !showLoading && user && Array.isArray(projects) && projects.length === 0;

  // Gestion import direct depuis la modale
  const handleImportFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      await useAppStore.getState().importData(text);
      setActiveTab("userStories");
    } catch (e) {
      alert("Erreur lors de l'import : " + (e as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string) => {
    setLoading(true);
    try {
      await createProject(name);
      setActiveTab("settings");
    } catch (e) {
      alert("Erreur lors de la création : " + (e as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la réinitialisation en cas d'erreur de sauvegarde
  const handleRetrySave = () => {
    recalculateDates();
  };

  const handleReload = () => {
    if (projectId) loadUserStories(projectId);
  };

  // Fonctions pour le FloatingActionMenu des User Stories
  const handleAddUserStory = () => {
    // Déclencher l'affichage du formulaire dans UserStoriesPanel
    setShowUserStoryForm(true);
  };

  const handleExportExcel = async () => {
    const { userStories } = useAppStore.getState();
    if (userStories.length === 0) return;

    const wsData = [
      [
        "ID",
        "Epic",
        "Titre",
        "Rôle",
        "Critères",
        "Priorité",
        "Estimation (j)",
        "Dépendance",
        "Début",
        "Fin",
        "Justification",
      ],
      ...userStories.map((story) => [
        story.id,
        story.epic,
        story.title,
        story.userRole,
        story.acceptanceCriteria
          ? story.acceptanceCriteria.map((ac) => ac.label).join("\n")
          : "",
        story.priority,
        story.estimation,
        story.dependency || "",
        story.estimatedStartDate
          ? format(new Date(story.estimatedStartDate), "dd/MM/yyyy")
          : "",
        story.estimatedEndDate
          ? format(new Date(story.estimatedEndDate), "dd/MM/yyyy")
          : "",
        story.justification || "",
      ]),
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Stories");
    wsData.forEach((row) => worksheet.addRow(row));
    worksheet.columns = [
      { header: "ID", width: 10 },
      { header: "Epic", width: 18 },
      { header: "Titre", width: 28 },
      { header: "Rôle", width: 18 },
      { header: "Critères", width: 40 },
      { header: "Priorité", width: 14 },
      { header: "Estimation (j)", width: 14 },
      { header: "Dépendance", width: 18 },
      { header: "Début", width: 14 },
      { header: "Fin", width: 14 },
      { header: "Justification", width: 32 },
    ];
    worksheet.getRow(1).font = { bold: true };
    worksheet.getColumn(5).alignment = { wrapText: true };
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) row.height = 22;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "user-stories.xlsx"
    );
  };

  useEffect(() => {
    setShowLoading(true);
    fetchUser().finally(() => setUserLoaded(true));
  }, []);

  useEffect(() => {
    if (userLoaded && user) {
      setShowLoading(true);
      fetchProjects().finally(() => setShowLoading(false));
      fetchUserTheme();
    } else if (userLoaded && user === null) {
      setShowLoading(false);
    }
  }, [user, userLoaded, fetchProjects, fetchUserTheme]);

  useEffect(() => {
    if (projectId) {
      loadUserStories(projectId);
    }
  }, [projectId, loadUserStories]);

  useEffect(() => {
    const applyTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark"
        );
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    };
    applyTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme();
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    if (!projectId && (!projects || projects.length === 0)) {
      setActiveTab("userStories");
    }
  }, [projectId, projects]);

  // Loader minimum 2s
  useEffect(() => {
    if (showLoading && !showLoader) {
      setShowLoader(true);
      setLoaderStart(Date.now());
    }
    if (!showLoading && showLoader) {
      const elapsed = loaderStart ? Date.now() - loaderStart : 0;
      if (elapsed < 2000) {
        const timeout = setTimeout(() => setShowLoader(false), 2000 - elapsed);
        return () => clearTimeout(timeout);
      } else {
        setShowLoader(false);
      }
    }
  }, [showLoading, showLoader, loaderStart]);

  // Affichage conditionnel du loader
  if (showLoader) {
    if (userLoaded && user !== null) {
      return <LoadingScreen />;
    } else {
      return <WelcomeScreen />;
    }
  }

  if (userLoaded && user === null) return <Login />;

  if (showNoProjectModal)
    return (
      <NoProjectModal
        onCreate={handleCreateProject}
        onImport={handleImportFile}
        loading={loading}
      />
    );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden">
      <SavingIndicator isSaving={isSaving} />

      {saveError && (
        <SaveErrorModal
          error={saveError}
          onRetry={handleRetrySave}
          onReload={handleReload}
        />
      )}

      <Header
        projectId={projectId}
        projects={projects}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        setShowUserMenuModal={setShowUserMenuModal}
        setProjectId={setProjectId}
        createProject={createProject}
      />

      <main className="flex-1 w-full flex flex-col mb-20 md:mb-0 pt-12 md:pt-10">
        <div className="mb-0 w-full">
          <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          }
        >
          {activeTab === "userStories" && (
            <UserStoriesPanel
              mobileViewMode={mobileViewMode}
              onShowForm={handleAddUserStory}
              externalShowForm={showUserStoryForm}
              onFormClose={() => setShowUserStoryForm(false)}
            />
          )}
          {activeTab === "reports" && (
            <ReportsPanel
              activeView={reportView}
              onViewChange={setReportView}
              sprintView={sprintView}
              onSprintViewChange={setSprintView}
            />
          )}
          {activeTab === "progress" && <KanbanPanel />}
          {activeTab === "settings" && (
            <SettingsPanel setActiveTab={setActiveTab} />
          )}
        </Suspense>
      </main>

      <footer
        className={`bg-white dark:bg-gray-800 shadow-inner mt-1 w-full ${
          isMobile ? "py-2" : "py-3"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
            isMobile ? "py-1" : "py-3"
          }`}
        >
          <p
            className={`text-center text-gray-500 dark:text-gray-400 ${
              isMobile ? "text-xs" : "text-sm"
            }`}
          >
            {isMobile ? "© 2025 USM" : "Gestionnaire de User Stories - 2025"}
          </p>
        </div>
      </footer>

      <UserMenuModal
        isOpen={showUserMenuModal}
        onClose={() => setShowUserMenuModal(false)}
      />

      {isMobile && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddUserStory={handleAddUserStory}
          onExportExcel={handleExportExcel}
          mobileViewMode={mobileViewMode}
          onViewModeChange={setMobileViewMode}
          reportView={reportView}
          onReportViewChange={setReportView}
          sprintView={sprintView}
          onSprintViewChange={setSprintView}
        />
      )}
    </div>
  );
}

export default App;
