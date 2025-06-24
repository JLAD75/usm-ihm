import { Dialog } from "@headlessui/react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { AlertTriangle, MoreHorizontal, X } from "lucide-react";
import React from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";
import { useAppStore } from "../../store/appStore";
import { KanbanStatus, UserStory } from "../../types/UserStory";

const KANBAN_COLUMNS: { key: KanbanStatus; label: string; color: string }[] = [
  { key: "todo", label: "À faire", color: "bg-gray-100 dark:bg-gray-800" },
  {
    key: "inProgress",
    label: "En cours",
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    key: "blocked",
    label: "En difficulté",
    color: "bg-red-100 dark:bg-red-900",
  },
  {
    key: "toTest",
    label: "À recetter",
    color: "bg-yellow-100 dark:bg-yellow-900",
  },
  { key: "done", label: "Terminée", color: "bg-green-100 dark:bg-green-900" },
];

function KanbanCard({
  us,
  column,
  index,
  onComment,
}: {
  us: UserStory;
  column: KanbanStatus;
  index: number;
  onComment: (us: UserStory) => void;
}) {
  const { updateUserStory } = useAppStore();
  const { isMobile } = useDeviceType();
  // Helper pour AC dev
  const handleDevCheck = (acIdx: number) => {
    // Merge défensif : toujours partir de l'US complète
    const fullUS =
      useAppStore.getState().userStories.find((s) => s.id === us.id) || us;
    const newAC = (fullUS.acceptanceCriteria || []).map((a, idx) => {
      if (idx !== acIdx) return a;
      const checked = !a.checkedDev;
      return {
        ...a,
        checkedDev: checked,
        checkedDevAt: checked ? new Date() : null,
      };
    });
    updateUserStory(us.id, { acceptanceCriteria: newAC });
  };
  // Helper pour AC test
  const handleTestCheck = (acIdx: number) => {
    const fullUS =
      useAppStore.getState().userStories.find((s) => s.id === us.id) || us;
    const newAC = (fullUS.acceptanceCriteria || []).map((a, idx) => {
      if (idx !== acIdx) return a;
      const checked = !a.checkedTest;
      return {
        ...a,
        checkedTest: checked,
        checkedTestAt: checked ? new Date() : null,
      };
    });
    updateUserStory(us.id, { acceptanceCriteria: newAC });
  };
  // Helper pour tout recetter
  const handleToutRecetter = () => {
    const fullUS =
      useAppStore.getState().userStories.find((s) => s.id === us.id) || us;
    const newAC = (fullUS.acceptanceCriteria || []).map((a) =>
      a.checkedDev
        ? {
            ...a,
            checkedTest: true,
            checkedTestAt: a.checkedTest ? a.checkedTestAt : new Date(),
          }
        : a
    );
    updateUserStory(us.id, { acceptanceCriteria: newAC });
  };
  return (
    <Draggable draggableId={us.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-700 transition-all select-none mb-2",
            isMobile ? "p-2" : "p-3",
            snapshot.isDragging ? "scale-105 ring-2 ring-indigo-400 z-50" : ""
          )}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.95 : 1,
            boxShadow: snapshot.isDragging ? "0 8px 32px #6366f1cc" : undefined,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {" "}
          <div className="flex justify-between items-center">
            <div
              className={cn(
                "font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              {us.id} - {us.title}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onComment(us);
              }}
              className={cn(
                "ml-2 flex items-center justify-center rounded-full border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 grow-0",
                us.comment
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
                  : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700",
                isMobile ? "p-0.5" : "p-1"
              )}
              style={{
                width: isMobile ? 18 : 22,
                height: isMobile ? 18 : 22,
                minWidth: isMobile ? 18 : 22,
                minHeight: isMobile ? 18 : 22,
                maxWidth: isMobile ? 18 : 22,
                maxHeight: isMobile ? 18 : 22,
                boxSizing: "border-box",
              }}
              title={
                us.comment
                  ? "Voir/modifier le commentaire"
                  : "Ajouter un commentaire"
              }
            >
              <MoreHorizontal
                className={cn(isMobile ? "w-3 h-3" : "w-3.5 h-3.5")}
              />
            </button>
          </div>{" "}
          <div
            className={cn(
              "text-gray-500 dark:text-gray-400 mb-1",
              isMobile ? "text-[10px]" : "text-xs"
            )}
          >
            {us.epic}
          </div>
          {/* userRole retiré de l'affichage en colonne Terminée */}
          {column !== "done" && (
            <div
              className={cn(
                "text-gray-600 dark:text-gray-300",
                isMobile ? "text-[10px]" : "text-xs"
              )}
            >
              {us.userRole}
            </div>
          )}{" "}
          {column === "blocked" ? (
            <div
              className={cn(
                "mt-2 space-y-1",
                isMobile ? "text-[10px]" : "text-xs"
              )}
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-300 font-semibold">
                <AlertTriangle
                  className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")}
                />{" "}
                En difficulté
              </div>{" "}
              {us.blockedSince && (
                <div
                  className={cn(
                    "text-gray-500 dark:text-gray-400",
                    isMobile ? "text-[10px]" : "text-xs"
                  )}
                >
                  Depuis le{" "}
                  {us.blockedSince instanceof Date
                    ? us.blockedSince.toLocaleDateString()
                    : us.blockedSince}
                </div>
              )}
              {us.comment && (
                <div
                  className={cn(
                    "mt-1 px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
                    isMobile ? "text-[10px]" : "text-xs"
                  )}
                >
                  <span className="font-semibold">Commentaire :</span>{" "}
                  {us.comment}
                </div>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() =>
                    updateUserStory(us.id, { status: "inProgress" })
                  }
                  className={cn(
                    "rounded bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400",
                    isMobile ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
                  )}
                >
                  Marquer comme débloqué
                </button>
              </div>
            </div>
          ) : column === "inProgress" ? (
            <div className={cn("mt-2", isMobile ? "text-[10px]" : "text-xs")}>
              <span className="font-semibold">AC (développement) :</span>
              <ul className="list-disc list-inside ml-3">
                {us.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!ac.checkedDev}
                      onChange={() => handleDevCheck(i)}
                      className={cn(
                        "accent-indigo-600 rounded border-gray-300 focus:ring-indigo-500",
                        isMobile ? "h-3 w-3" : "h-4 w-4"
                      )}
                    />
                    <span
                      className={
                        ac.checkedDev
                          ? "line-through text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      {ac.label}
                    </span>
                    {ac.checkedDev && ac.checkedDevAt && (
                      <span
                        className={cn(
                          "ml-1 text-gray-400",
                          isMobile ? "text-[9px]" : "text-xs"
                        )}
                      >
                        {(ac.checkedDevAt instanceof Date
                          ? ac.checkedDevAt
                          : new Date(ac.checkedDevAt)
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : column === "toTest" ? (
            <div
              className={cn(
                "mt-2 space-y-1",
                isMobile ? "text-[10px]" : "text-xs"
              )}
            >
              <div className="font-semibold mb-1">AC développés :</div>
              <ul className="list-disc list-inside ml-3 mb-2">
                {us.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-center gap-2 opacity-70">
                    <span
                      className={
                        ac.checkedDev
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400"
                      }
                    >
                      {ac.label}
                    </span>
                    {ac.checkedDev && ac.checkedDevAt && (
                      <span
                        className={cn(
                          "ml-1 text-gray-400",
                          isMobile ? "text-[9px]" : "text-xs"
                        )}
                      >
                        {(ac.checkedDevAt instanceof Date
                          ? ac.checkedDevAt
                          : new Date(ac.checkedDevAt)
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="font-semibold mb-1">Recette :</div>
              <ul className="list-disc list-inside ml-3">
                {us.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!ac.checkedTest}
                      disabled={!ac.checkedDev}
                      onChange={() => handleTestCheck(i)}
                      className={cn(
                        "accent-yellow-600 rounded border-gray-300 focus:ring-yellow-500",
                        isMobile ? "h-3 w-3" : "h-4 w-4"
                      )}
                    />
                    <span
                      className={
                        ac.checkedTest
                          ? "line-through text-yellow-700 dark:text-yellow-200"
                          : ""
                      }
                    >
                      {ac.label}
                    </span>
                    {ac.checkedTest && ac.checkedTestAt && (
                      <span
                        className={cn(
                          "ml-1 text-gray-400",
                          isMobile ? "text-[9px]" : "text-xs"
                        )}
                      >
                        {(ac.checkedTestAt instanceof Date
                          ? ac.checkedTestAt
                          : new Date(ac.checkedTestAt)
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>{" "}
              {/* Boutons d'action rapide et badge */}
              <div
                className={cn(
                  "flex items-center gap-2 mt-2",
                  isMobile && "flex-col items-start gap-1"
                )}
              >
                <span
                  className={cn(
                    us.acceptanceCriteria.every((ac) => ac.checkedTest)
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100",
                    "px-2 py-0.5 rounded-full font-semibold",
                    isMobile ? "text-[10px]" : "text-xs"
                  )}
                >
                  {us.acceptanceCriteria.every((ac) => ac.checkedTest)
                    ? "Tous les AC recettés !"
                    : `${
                        us.acceptanceCriteria.filter((ac) => !ac.checkedTest)
                          .length
                      } AC à recetter`}
                </span>
                {us.acceptanceCriteria.some(
                  (ac) => ac.checkedDev && !ac.checkedTest
                ) && (
                  <button
                    type="button"
                    className={cn(
                      "rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400",
                      isMobile
                        ? "ml-0 px-1.5 py-0.5 text-[10px]"
                        : "ml-2 px-2 py-0.5 text-xs"
                    )}
                    onClick={handleToutRecetter}
                  >
                    Tout recetter
                  </button>
                )}
                {us.acceptanceCriteria.length > 0 &&
                  us.acceptanceCriteria.every((ac) => ac.checkedTest) && (
                    <button
                      type="button"
                      className={cn(
                        "rounded bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400",
                        isMobile
                          ? "ml-0 px-1.5 py-0.5 text-[10px]"
                          : "ml-2 px-2 py-0.5 text-xs"
                      )}
                      onClick={() => updateUserStory(us.id, { status: "done" })}
                    >
                      Passer en Terminé
                    </button>
                  )}
              </div>
              {us.comment && (
                <div className="text-xs mt-1 px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">Commentaire :</span>{" "}
                  {us.comment}
                </div>
              )}
            </div>
          ) : column === "done" ? (
            <div
              className={cn(
                "mt-2 flex flex-col gap-1",
                isMobile ? "text-[10px]" : "text-xs"
              )}
            >
              {/* Indicateurs synthétiques avec boutons pour afficher les AC en modale */}
              {(() => {
                const ac = us.acceptanceCriteria || [];
                const devDates = ac
                  .filter((a) => a.checkedDevAt)
                  .map((a) =>
                    a.checkedDevAt instanceof Date
                      ? a.checkedDevAt
                      : new Date(a.checkedDevAt!)
                  );
                const testDates = ac
                  .filter((a) => a.checkedTestAt)
                  .map((a) =>
                    a.checkedTestAt instanceof Date
                      ? a.checkedTestAt
                      : new Date(a.checkedTestAt!)
                  );
                const nbDev = ac.filter((a) => a.checkedDev).length;
                const nbTest = ac.filter((a) => a.checkedTest).length;
                const firstDev = devDates.length
                  ? devDates.reduce(
                      (min, d) => (d < min ? d : min),
                      devDates[0]
                    )
                  : null;
                const lastTest = testDates.length
                  ? testDates.reduce(
                      (max, d) => (d > max ? d : max),
                      testDates[0]
                    )
                  : null;
                // Ajout pour modale AC
                const [acModal, setAcModal] = React.useState<{
                  type: "dev" | "test" | null;
                  open: boolean;
                }>({ type: null, open: false });
                // Hack : on place le composant modale ici pour garder le state local
                const showAcModal = (type: "dev" | "test") =>
                  setAcModal({ type, open: true });
                const closeAcModal = () =>
                  setAcModal({ type: null, open: false });
                return (
                  <>
                    {" "}
                    <div
                      className={cn(
                        "flex gap-2 items-center",
                        isMobile ? "flex-col items-start gap-1" : "flex-wrap"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => showAcModal("dev")}
                        className={cn(
                          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full font-semibold hover:underline focus:outline-none",
                          isMobile ? "text-[9px]" : "text-xs"
                        )}
                      >
                        {nbDev} AC développées
                      </button>
                      <button
                        type="button"
                        onClick={() => showAcModal("test")}
                        className={cn(
                          "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 px-2 py-0.5 rounded-full font-semibold hover:underline focus:outline-none",
                          isMobile ? "text-[9px]" : "text-xs"
                        )}
                      >
                        {nbTest} AC recettées
                      </button>
                    </div>{" "}
                    <div
                      className={cn(
                        "flex gap-2 items-center text-gray-500",
                        isMobile ? "flex-col items-start gap-1" : "flex-wrap"
                      )}
                    >
                      {firstDev && (
                        <span>1er dev : {firstDev.toLocaleDateString()}</span>
                      )}
                      {lastTest && (
                        <span>
                          Dernière recette : {lastTest.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {/* Modale AC dev/test */}
                    {acModal.open && (
                      <Dialog
                        open={acModal.open}
                        onClose={closeAcModal}
                        className="fixed inset-0 z-50 flex items-center justify-center"
                      >
                        <div
                          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                          aria-hidden="true"
                          onClick={closeAcModal}
                        />
                        <div className="relative rounded-2xl shadow-2xl w-full sm:w-[95vw] mx-4 max-h-[97vh] z-10 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/30 dark:border-gray-700/40">
                          <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white z-20"
                            onClick={closeAcModal}
                            type="button"
                            tabIndex={-1}
                            aria-label="Fermer"
                          >
                            <X className="h-6 w-6" />
                          </button>
                          <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300">
                            {acModal.type === "dev"
                              ? "AC développées"
                              : "AC recettées"}
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {acModal.type === "dev"
                              ? ac.map((a, i) => (
                                  <li
                                    key={i}
                                    className={
                                      a.checkedDev
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-gray-400"
                                    }
                                  >
                                    {a.label}{" "}
                                    {a.checkedDev ? (
                                      <span className="ml-1">&#10003;</span>
                                    ) : (
                                      <span className="ml-1">—</span>
                                    )}
                                  </li>
                                ))
                              : ac.map((a, i) => (
                                  <li
                                    key={i}
                                    className={
                                      a.checkedTest
                                        ? "text-green-900 dark:text-green-100"
                                        : "text-gray-400"
                                    }
                                  >
                                    {a.label}{" "}
                                    {a.checkedTest ? (
                                      <span className="ml-1">&#10003;</span>
                                    ) : (
                                      <span className="ml-1">—</span>
                                    )}
                                  </li>
                                ))}
                          </ul>
                        </div>
                      </Dialog>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            column !== "todo" &&
            column !== "inProgress" &&
            column !== "toTest" && (
              <div className={cn("mt-2", isMobile ? "text-[10px]" : "text-xs")}>
                <span className="font-semibold">AC :</span>
                <ul className="list-disc list-inside ml-3">
                  {us.acceptanceCriteria.map((ac, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!ac.checkedTest}
                        readOnly
                        className={cn(
                          "accent-green-600 rounded border-gray-300 focus:ring-green-500",
                          isMobile ? "h-3 w-3" : "h-4 w-4"
                        )}
                      />
                      <span
                        className={
                          ac.checkedTest
                            ? "line-through text-green-600 dark:text-green-400"
                            : ""
                        }
                      >
                        {ac.label}
                      </span>
                      {ac.checkedTest && ac.checkedTestAt && (
                        <span
                          className={cn(
                            "ml-1 text-gray-400",
                            isMobile ? "text-[9px]" : "text-xs"
                          )}
                        >
                          (
                          {ac.checkedTestAt instanceof Date
                            ? ac.checkedTestAt.toLocaleDateString()
                            : ac.checkedTestAt}
                          )
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </Draggable>
  );
}

const KanbanPanel: React.FC = () => {
  const { userStories, updateUserStory } = useAppStore();
  const { isMobile } = useDeviceType();
  const [commentModal, setCommentModal] = React.useState<{
    open: boolean;
    us: UserStory | null;
  }>({ open: false, us: null });

  // Regroupe les US par colonne Kanban
  const grouped: Record<KanbanStatus, UserStory[]> = {
    todo: [],
    inProgress: [],
    blocked: [],
    toTest: [],
    done: [],
  };
  userStories.forEach((us) => {
    grouped[us.status || "todo"].push(us);
  });
  // Trie par kanbanOrder puis par order
  KANBAN_COLUMNS.forEach((col) => {
    grouped[col.key].sort(
      (a, b) => (a.kanbanOrder ?? 0) - (b.kanbanOrder ?? 0) || a.order - b.order
    );
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const fromCol = source.droppableId as KanbanStatus;
    const toCol = destination.droppableId as KanbanStatus;
    // On prend un snapshot des US AVANT toute mutation
    const userStoriesSnapshot = [...userStories];
    if (fromCol === toCol) {
      // Réordonner dans la même colonne
      const colStories = userStoriesSnapshot.filter(
        (us) => (us.status || "todo") === fromCol
      );
      const newColStories = Array.from(colStories);
      const [removed] = newColStories.splice(source.index, 1);
      newColStories.splice(destination.index, 0, removed);
      newColStories.forEach((us, idx) => {
        updateUserStory(us.id, { ...us, kanbanOrder: idx });
      });
    } else {
      // Déplacement inter-colonnes
      const us = userStoriesSnapshot.find((us) => us.id === draggableId);
      if (us) {
        const newColStories = userStoriesSnapshot.filter(
          (u) => (u.status || "todo") === toCol
        );
        newColStories.splice(destination.index, 0, us);
        newColStories.forEach((us, idx) => {
          updateUserStory(us.id, { ...us, status: toCol, kanbanOrder: idx });
        });
      }
    }
  };
  return (
    <div className={cn("flex flex-col", isMobile ? "p-2" : "p-4")}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={cn(
            "flex flex-1 gap-4 pb-0 overflow-x-auto",
            isMobile && "gap-2"
          )}
          style={{ minWidth: 0 }}
        >
          {KANBAN_COLUMNS.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex-1 rounded-lg shadow-md p-2 pb-0 flex flex-col",
                    col.color,
                    isMobile
                      ? "min-w-[200px] max-w-[240px]" // Plus étroit sur mobile
                      : "min-w-[260px] max-w-[340px]"
                  )}
                  style={{
                    overflowY: "auto",
                    maxHeight: isMobile ? "75vh" : "82vh", // Plus court sur mobile
                    minWidth: 0,
                    background: snapshot.isDraggingOver ? "#e0e7ff" : undefined,
                  }}
                >
                  <div
                    className={cn(
                      "font-semibold mb-2 text-center",
                      isMobile ? "text-base" : "text-lg"
                    )}
                  >
                    {col.label}
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {grouped[col.key].length === 0 && (
                      <div
                        className={cn(
                          "text-gray-400 text-center italic py-4",
                          isMobile ? "text-xs" : "text-sm"
                        )}
                      >
                        Aucune US
                      </div>
                    )}
                    {grouped[col.key].map((us, idx) => (
                      <KanbanCard
                        key={us.id}
                        us={us}
                        column={col.key}
                        index={idx}
                        onComment={(us) => setCommentModal({ open: true, us })}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>{" "}
      {/* Modale commentaire */}
      {commentModal.open && commentModal.us && (
        <Dialog
          open={commentModal.open}
          onClose={() => setCommentModal({ open: false, us: null })}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setCommentModal({ open: false, us: null })}
          />
          <div
            className={cn(
              "relative rounded-2xl shadow-2xl z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/30 dark:border-gray-700/40",
              isMobile
                ? "fixed inset-4 max-h-[calc(100vh-2rem)] p-3"
                : "w-full sm:w-[95vw] mx-4 max-h-[97vh] p-4"
            )}
          >
            <button
              className={cn(
                "absolute text-gray-400 hover:text-gray-700 dark:hover:text-white z-20",
                isMobile ? "top-2 right-2" : "top-3 right-3"
              )}
              onClick={() => setCommentModal({ open: false, us: null })}
              type="button"
              tabIndex={-1}
              aria-label="Fermer"
            >
              <X className={cn(isMobile ? "h-5 w-5" : "h-6 w-6")} />
            </button>
            <h3
              className={cn(
                "font-bold mb-2 text-indigo-700 dark:text-indigo-300",
                isMobile ? "text-base" : "text-lg"
              )}
            >
              Commentaire
            </h3>
            <textarea
              value={commentModal.us.comment || ""}
              onChange={(e) => {
                const newComment = e.target.value;
                setCommentModal((cm) =>
                  cm.us ? { ...cm, us: { ...cm.us, comment: newComment } } : cm
                );
              }}
              rows={isMobile ? 6 : 8}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                isMobile ? "text-sm" : "text-base"
              )}
              placeholder="Saisissez ici un commentaire libre pour cette User Story..."
              autoFocus
            />
            <div
              className={cn(
                "flex justify-end mt-3 gap-2",
                isMobile && "flex-col"
              )}
            >
              <button
                type="button"
                onClick={() => setCommentModal({ open: false, us: null })}
                className={cn(
                  "border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600",
                  isMobile ? "px-3 py-2 text-sm" : "px-3 py-1.5 text-sm"
                )}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (commentModal.us) {
                    updateUserStory(commentModal.us.id, {
                      comment: commentModal.us.comment,
                    });
                  }
                  setCommentModal({ open: false, us: null });
                }}
                className={cn(
                  "border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600",
                  isMobile ? "px-3 py-2 text-sm" : "px-3 py-1.5 text-sm"
                )}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default KanbanPanel;
