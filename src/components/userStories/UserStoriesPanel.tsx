import { format } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { AlignJustify, AlignLeft, Download, Plus } from "lucide-react";
import React, { useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { useAppStore } from "../../store/appStore";
import { Toggle } from "../ui/toggle";
import UserStoriesMobileView from "./UserStoriesMobileView";
import UserStoriesTable from "./UserStoriesTable";
import UserStoryForm from "./UserStoryForm";

const UserStoriesPanel: React.FC<{
  mobileViewMode?: "cards" | "list";
  onShowForm?: () => void;
  externalShowForm?: boolean;
  onFormClose?: () => void;
}> = ({
  mobileViewMode = "cards",
  onShowForm,
  externalShowForm,
  onFormClose,
}) => {
  const { isMobile } = useDeviceType();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [compactMode, setCompactMode] = useState(() => {
    const saved = localStorage.getItem("us-compact-mode");
    return saved === "true";
  });
  const { userStories } = useAppStore();

  // Contrôle externe du formulaire
  const isFormVisible =
    externalShowForm !== undefined ? externalShowForm : showForm;

  // Sauvegarde du mode compact dans le localStorage
  React.useEffect(() => {
    localStorage.setItem("us-compact-mode", compactMode ? "true" : "false");
  }, [compactMode]);

  // Effet pour synchroniser l'état externe avec l'état local
  React.useEffect(() => {
    if (externalShowForm) {
      setEditId(null); // Toujours un nouveau formulaire quand déclenché depuis l'extérieur
      setShowForm(true);
    }
  }, [externalShowForm]);

  const handleAddClick = () => {
    if (onShowForm) {
      onShowForm();
    } else {
      setEditId(null);
      setShowForm(true);
    }
  };

  const handleEditClick = (id: string) => {
    setEditId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    if (onFormClose) {
      onFormClose();
    }
  };

  const handleExportExcel = async () => {
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
  return (
    <div className="space-y-6 w-full flex flex-col flex-1 justify-start">
      {/* Header responsive */}
      <div className="flex flex-col space-y-3 md:flex-row md:justify-end md:items-center md:space-y-0 gap-2">
        {/* Desktop controls */}
        <div className="flex items-center gap-2">
          {/* Compact mode toggle - Desktop only */}
          {!isMobile && (
            <Toggle
              pressed={compactMode}
              onPressedChange={setCompactMode}
              aria-label={
                compactMode ? "Mode compact activé" : "Mode auto activé"
              }
              variant="outline"
              size="lg"
            >
              {compactMode ? (
                <AlignJustify className="w-4 h-4" />
              ) : (
                <AlignLeft className="w-4 h-4" />
              )}
              <span className="sr-only">Basculer mode compact</span>
            </Toggle>
          )}

          {/* Add and Export buttons - Desktop only */}
          {!isMobile && (
            <>
              <button
                onClick={handleAddClick}
                className="px-4 py-2 text-sm border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une User Story
              </button>

              <button
                onClick={handleExportExcel}
                className="px-3 py-2 text-sm inline-flex items-center border border-transparent font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 transition-colors gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter Excel
              </button>
            </>
          )}
        </div>
      </div>

      {userStories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400">
            Aucune User Story n'a été ajoutée. Cliquez sur "
            {isMobile ? "Nouvelle User Story" : "Ajouter une User Story"}" pour
            commencer.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full">
          {isMobile ? (
            <UserStoriesMobileView
              onEdit={handleEditClick}
              viewMode={mobileViewMode}
            />
          ) : (
            <div className="overflow-x-auto">
              <UserStoriesTable
                onEdit={handleEditClick}
                compactMode={compactMode}
              />
            </div>
          )}
        </div>
      )}

      {/* Modale du formulaire */}
      {isFormVisible && (
        <UserStoryForm
          editId={editId || undefined}
          onClose={handleCloseForm}
          isModal={true}
        />
      )}
    </div>
  );
};

export default UserStoriesPanel;
