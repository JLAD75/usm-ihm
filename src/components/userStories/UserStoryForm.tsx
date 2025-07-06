import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";
import { useAppStore } from "../../store/appStore";
import { AcceptanceCriterion, Priority } from "../../types/UserStory";

interface UserStoryFormProps {
  editId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const UserStoryForm: React.FC<UserStoryFormProps> = ({
  editId,
  onClose,
  isModal = false,
}) => {
  const { isMobile } = useDeviceType();
  const {
    userStories,
    addUserStory,
    updateUserStory,
    getExistingEpics,
    projectId,
  } = useAppStore();

  // État du formulaire
  const [id, setId] = useState<string>("");
  const [epic, setEpic] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string>("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [estimation, setEstimation] = useState<string>("");
  const [justification, setJustification] = useState<string>("");
  const [dependency, setDependency] = useState<string>("");
  const [epicSuggestions, setEpicSuggestions] = useState<string[]>([]);
  const [showEpicSuggestions, setShowEpicSuggestions] =
    useState<boolean>(false);
  const [idError, setIdError] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const idInputRef = React.useRef<HTMLInputElement>(null);
  const [initialStory, setInitialStory] = useState<any>(null);

  // Charger les données si en mode édition
  useEffect(() => {
    console.log("🔧 UserStoryForm useEffect - editId:", editId, "projectId:", projectId);
    if (editId) {
      const story = userStories.find(
        (s) => s.id === editId && s.projectId === projectId
      );
      console.log("🔧 Story trouvée:", story);
      if (story) {
        setId(story.id ?? "");
        setEpic(story.epic ?? "");
        setUserRole(story.userRole ?? "");
        setTitle(story.title ?? "");
        setAcceptanceCriteria(
          Array.isArray(story.acceptanceCriteria)
            ? story.acceptanceCriteria.map((ac) => ac.label ?? "").join("\n")
            : ""
        );
        setPriority(story.priority ?? "");
        setEstimation(
          story.estimation != null ? story.estimation.toString() : ""
        );
        setJustification(story.justification ?? "");
        setDependency(story.dependency ?? "");
        setComment(story.comment ?? "");
        setInitialStory({
          id: story.id ?? "",
          epic: story.epic ?? "",
          userRole: story.userRole ?? "",
          title: story.title ?? "",
          acceptanceCriteria: Array.isArray(story.acceptanceCriteria)
            ? story.acceptanceCriteria.map((ac) => ac.label ?? "").join("\n")
            : "",
          priority: story.priority ?? "",
          estimation:
            story.estimation != null ? story.estimation.toString() : "",
          justification: story.justification ?? "",
          dependency: story.dependency ?? "",
          comment: story.comment ?? "",
        });
      }
    } else {
      setId("");
      setEpic("");
      setUserRole("");
      setTitle("");
      setAcceptanceCriteria("");
      setPriority("");
      setEstimation("");
      setJustification("");
      setDependency("");
      setComment("");
      setInitialStory(null);
    }
  }, [editId, userStories, projectId]);

  // Gérer les suggestions d'epics
  useEffect(() => {
    if ((epic ?? "").trim() !== "") {
      const existingEpics = getExistingEpics();
      const filtered = existingEpics.filter(
        (e) =>
          (e ?? "").toLowerCase().includes((epic ?? "").toLowerCase()) &&
          (e ?? "").toLowerCase() !== (epic ?? "").toLowerCase()
      );
      setEpicSuggestions(filtered);
    } else {
      setEpicSuggestions([]);
    }
  }, [epic, getExistingEpics]);

  // Focus sur le champ ID en création
  useEffect(() => {
    if (!editId && idInputRef.current) {
      idInputRef.current.focus();
    }
  }, [editId]);

  // Fonction utilitaire pour trim sur blur
  const handleTrim = (setter: (v: string) => void, value: string) => {
    setter(value.trim());
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdError("");
    setId(id.trim());
    setEpic(epic.trim());
    setTitle(title.trim());
    setUserRole(userRole.trim());
    setAcceptanceCriteria(acceptanceCriteria.trim());
    setJustification(justification.trim());
    // Vérification unicité de l'ID (dans le projet courant uniquement)
    const idExists = userStories.some(
      (story) =>
        story.id === id &&
        story.projectId === projectId &&
        (!editId || story.id !== editId)
    );
    if (idExists) {
      setIdError(
        "Cet ID existe déjà dans ce projet. Veuillez en choisir un autre."
      );
      return;
    }
    if (!priority) {
      setIdError("Veuillez sélectionner une priorité.");
      return;
    }
    if (!estimation || isNaN(Number(estimation)) || Number(estimation) <= 0) {
      setIdError("Veuillez saisir une estimation valide (nombre > 0).");
      return;
    }
    // Correction : préserver l'état des AC lors de l'édition
    let criteriaArray: AcceptanceCriterion[] = acceptanceCriteria
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((line) => ({ label: line }));
    if (editId) {
      const story = userStories.find(
        (s) => s.id === editId && s.projectId === projectId
      );
      if (story) {
        // On fait correspondre les labels (insensible à la casse/espaces)
        criteriaArray = criteriaArray.map((newAC) => {
          const found = story.acceptanceCriteria.find(
            (oldAC) =>
              oldAC.label.trim().toLowerCase() ===
              newAC.label.trim().toLowerCase()
          );
          return found ? { ...found, label: newAC.label } : newAC;
        });
      }
    }
    const userStoryData = {
      id,
      epic,
      userRole,
      title,
      acceptanceCriteria: criteriaArray,
      priority: priority as Priority,
      estimation: Number(estimation),
      justification,
      dependency,
      comment,
    };
    if (editId) {
      await updateUserStory(editId, userStoryData);
      if (
        typeof window !== "undefined" &&
        useAppStore.getState().recalculateDates
      ) {
        // Recalcule les dates après édition
        await useAppStore.getState().recalculateDates();
      }
    } else if (projectId) {
      await addUserStory({ ...userStoryData, status: "todo", projectId });
      if (
        typeof window !== "undefined" &&
        useAppStore.getState().recalculateDates
      ) {
        // Recalcule les dates après ajout
        await useAppStore.getState().recalculateDates();
      }
    }
    if (!editId) {
      setId("");
      setEpic("");
      setUserRole("");
      setTitle("");
      setAcceptanceCriteria("");
      setPriority("");
      setEstimation("");
      setJustification("");
      setDependency("");
      setComment("");
    }
    if (onClose) {
      onClose();
    }
  };

  // Obtenir les user stories disponibles pour la dépendance (même projet uniquement)
  const getAvailableUserStories = () => {
    return userStories
      .filter(
        (story) =>
          (!editId || story.id !== editId) && story.projectId === projectId
      )
      .sort((a, b) => a.order - b.order);
  };

  // Fonction utilitaire pour la couleur de la carte Priorité
  const getPriorityCardClasses = (priority: Priority | "") => {
    switch (priority) {
      case "Must Have":
        return {
          card: "bg-red-50/80 dark:bg-red-900/40 border-red-100 dark:border-red-900",
          label: "text-red-700 dark:text-red-200",
        };
      case "Should Have":
        return {
          card: "bg-orange-50/80 dark:bg-orange-900/40 border-orange-100 dark:border-orange-900",
          label: "text-orange-700 dark:text-orange-200",
        };
      case "Could Have":
        return {
          card: "bg-green-50/80 dark:bg-green-900/40 border-green-100 dark:border-green-900",
          label: "text-green-700 dark:text-green-200",
        };
      default:
        // Couleur neutre pour aucune sélection
        return {
          card: "bg-gray-50/80 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700",
          label: "text-gray-700 dark:text-gray-200",
        };
    }
  };

  // Vérifie si le formulaire a été modifié (pour désactiver le bouton Mettre à jour)
  function isUnchanged() {
    if (!editId || !initialStory) return false;
    // Helper pour normaliser les strings (trim, pas de CRLF)
    const norm = (v: string) => (v ?? "").replace(/\r/g, "").trim();
    // Helper pour normaliser les critères d'acceptation (un par ligne, trim)
    const normAC = (v: string) =>
      (v ?? "")
        .replace(/\r/g, "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .join("\n");
    return (
      norm(id) === norm(initialStory.id) &&
      norm(epic) === norm(initialStory.epic) &&
      norm(userRole) === norm(initialStory.userRole) &&
      norm(title) === norm(initialStory.title) &&
      normAC(acceptanceCriteria) === normAC(initialStory.acceptanceCriteria) &&
      norm(priority) === norm(initialStory.priority) &&
      Number(estimation) === Number(initialStory.estimation) &&
      norm(justification) === norm(initialStory.justification) &&
      norm(dependency) === norm(initialStory.dependency) &&
      norm(comment) === norm(initialStory.comment)
    );
  }
  // Contenu du formulaire (bento cards)
  const formContent = (
    <div
      style={{ overflowX: "hidden" }}
      className="bg-transparent flex flex-col gap-2 max-h-[95vh] overflow-y-auto p-0"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div
          className={cn(
            "grid gap-2",
            isMobile
              ? "grid-cols-1" // Une colonne sur mobile
              : "grid-cols-1 sm:grid-cols-[10rem_1fr_1fr]" // Grid responsive sur desktop
          )}
        >
          {/* Carte ID */}
          <div
            className="bento-bounce rounded-xl bg-gray-50/80 dark:bg-gray-800/40 shadow p-3 flex flex-col backdrop-blur-sm border border-gray-100 dark:border-gray-800 min-w-0 w-full"
            style={{ animationDelay: "0.02s" }}
          >
            <label
              className={cn(
                "font-semibold mb-1 text-gray-700 dark:text-gray-200",
                isMobile ? "text-sm" : "text-xs"
              )}
            >
              ID
            </label>
            <input
              ref={idInputRef}
              type="text"
              value={id ?? ""}
              onChange={(e) => setId(e.target.value)}
              onBlur={(e) => handleTrim(setId, e.target.value)}
              className={cn(
                "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                isMobile ? "w-full text-base" : "w-32"
              )}
              maxLength={10}
              required
            />
            {idError && (
              <p
                className={cn(
                  "text-red-500 mt-1",
                  isMobile ? "text-sm" : "text-xs"
                )}
              >
                {idError}
              </p>
            )}
          </div>
          {/* Carte Epic */}
          <div
            className="bento-bounce rounded-xl bg-indigo-50/80 dark:bg-indigo-900/40 shadow p-3 flex flex-col backdrop-blur-sm border border-indigo-100 dark:border-indigo-900 min-w-0 w-full relative"
            style={{ animationDelay: "0.06s" }}
          >
            <label
              className={cn(
                "font-semibold mb-1 text-indigo-700 dark:text-indigo-200",
                isMobile ? "text-sm" : "text-xs"
              )}
            >
              Epic
            </label>
            <input
              type="text"
              value={epic ?? ""}
              onChange={(e) => {
                setEpic(e.target.value);
                setShowEpicSuggestions(true);
              }}
              onFocus={() => setShowEpicSuggestions(true)}
              onBlur={(e) => {
                handleTrim(setEpic, e.target.value);
                setTimeout(() => setShowEpicSuggestions(false), 200);
              }}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                isMobile && "text-base"
              )}
              required
            />
            {showEpicSuggestions && epicSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto top-full mt-1">
                {epicSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => {
                      setEpic(suggestion);
                      setShowEpicSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>{" "}
          {/* Carte Titre */}
          <div
            className="bento-bounce rounded-xl bg-pink-50/80 dark:bg-pink-900/40 shadow p-3 flex flex-col backdrop-blur-sm border border-pink-100 dark:border-pink-900 min-w-0 w-full"
            style={{ animationDelay: "0.10s" }}
          >
            <label
              className={cn(
                "font-semibold mb-1 text-pink-700 dark:text-pink-200",
                isMobile ? "text-sm" : "text-xs"
              )}
            >
              Titre
            </label>
            <input
              type="text"
              value={title ?? ""}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={(e) => handleTrim(setTitle, e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                isMobile && "text-base"
              )}
              required
            />
          </div>
        </div>

        <div
          className={cn(
            "grid gap-2",
            isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {/* Carte Rôle */}
          <div
            className="bento-bounce rounded-xl bg-purple-50/80 dark:bg-purple-900/40 shadow p-3 flex flex-col backdrop-blur-sm border border-purple-100 dark:border-purple-900"
            style={{ animationDelay: "0.14s" }}
          >
            <label
              className={cn(
                "font-semibold mb-1 text-purple-700 dark:text-purple-200",
                isMobile ? "text-sm" : "text-xs"
              )}
            >
              En tant que...
            </label>
            <textarea
              value={userRole ?? ""}
              onChange={(e) => setUserRole(e.target.value)}
              onBlur={(e) => handleTrim(setUserRole, e.target.value)}
              rows={isMobile ? 4 : 10}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none",
                isMobile && "text-base"
              )}
              required
            />
          </div>{" "}
          {/* Carte Critères d'acceptation */}
          <div
            className="bento-bounce rounded-xl bg-blue-50/80 dark:bg-blue-900/40 shadow p-3 flex flex-col backdrop-blur-sm border border-blue-100 dark:border-blue-900"
            style={{ animationDelay: "0.18s" }}
          >
            <label
              className={cn(
                "font-semibold mb-1 text-blue-700 dark:text-blue-200",
                isMobile ? "text-sm" : "text-xs"
              )}
            >
              Critères d'acceptation (un par ligne)
            </label>
            <textarea
              value={acceptanceCriteria ?? ""}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              onBlur={(e) => handleTrim(setAcceptanceCriteria, e.target.value)}
              rows={isMobile ? 6 : 10}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none",
                isMobile && "text-base"
              )}
              required
            />
          </div>
        </div>

        <div
          className={cn(
            "grid gap-2",
            isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          <div className="flex flex-col gap-2">
            {/* Ligne Priorité + Estimation */}
            <div
              className={cn(
                "grid gap-2",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              {/* Carte Priorité */}
              <div
                className={`bento-bounce rounded-xl shadow p-3 flex flex-col backdrop-blur-sm border transition-colors duration-300 ${
                  getPriorityCardClasses(priority).card
                }`}
                style={{ animationDelay: "0.22s" }}
              >
                <label
                  className={cn(
                    "font-semibold mb-1 transition-colors duration-300",
                    getPriorityCardClasses(priority).label,
                    isMobile ? "text-sm" : "text-xs"
                  )}
                >
                  Priorité
                </label>
                <select
                  value={priority ?? ""}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    isMobile && "text-base"
                  )}
                  required
                >
                  <option value="">Sélectionner la priorité</option>
                  <option value="Must Have">Must Have</option>
                  <option value="Should Have">Should Have</option>
                  <option value="Could Have">Could Have</option>
                </select>
              </div>
              {/* Carte Estimation */}
              <div
                className="bento-bounce rounded-xl bg-green-50/80 dark:bg-green-900/40 shadow p-3 flex flex-col backdrop-blur-sm border border-green-100 dark:border-green-900"
                style={{ animationDelay: "0.26s" }}
              >
                <label className="text-xs text-green-700 dark:text-green-200 font-semibold mb-1">
                  Estimation (jours)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={estimation ?? ""}
                  onChange={(e) => setEstimation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            {/* Carte Dépendance (en dessous, sur la moitié gauche) */}
            <div
              className="bento-bounce rounded-xl bg-gray-100/80 dark:bg-gray-800/40 shadow p-3 flex flex-col backdrop-blur-sm border border-gray-200 dark:border-gray-700 mt-0.5"
              style={{ animationDelay: "0.30s" }}
            >
              <label className="text-xs text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Dépendance
              </label>
              <select
                value={dependency ?? ""}
                onChange={(e) => setDependency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Aucune dépendance</option>
                {getAvailableUserStories().map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.id} - {story.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Carte Justification (sur la moitié droite, prend toute la hauteur) */}
          <div
            className="bento-bounce rounded-xl bg-yellow-50/80 dark:bg-yellow-900/40 shadow p-2 flex flex-col h-full backdrop-blur-sm border border-yellow-100 dark:border-yellow-900"
            style={{ animationDelay: "0.34s" }}
          >
            <label className="text-xs text-yellow-700 dark:text-yellow-200 font-semibold mb-1">
              Justification
            </label>
            <textarea
              value={justification ?? ""}
              onChange={(e) => setJustification(e.target.value)}
              onBlur={(e) => handleTrim(setJustification, e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-2 shrink-0 bg-transparent sticky bottom-0 z-20 px-0 pb-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className={`px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 transition-colors duration-150
              ${
                editId && isUnchanged()
                  ? "opacity-60 cursor-not-allowed bg-indigo-400 dark:bg-indigo-700 hover:bg-indigo-400 dark:hover:bg-indigo-700"
                  : "hover:bg-indigo-700 dark:hover:bg-indigo-600"
              }`}
            disabled={editId ? isUnchanged() : false}
          >
            {editId ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
      {/* Bouton commentaire */}
      <div className="flex justify-end items-center mb-2">
        <button
          type="button"
          onClick={() => setShowCommentModal(true)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${
              comment
                ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
                : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}
          title={
            comment ? "Voir/modifier le commentaire" : "Ajouter un commentaire"
          }
        >
          <span>💬</span>
          <span>{comment ? "Commentaire" : "Ajouter un commentaire"}</span>
          {comment && (
            <span className="ml-1 w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          )}
        </button>
      </div>
      {/* Modale commentaire */}
      {showCommentModal && (
        <Dialog
          open={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setShowCommentModal(false)}
          />
          <div className="relative rounded-2xl shadow-2xl w-full sm:w-[95vw] mx-4 max-h-[97vh] z-10 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/30 dark:border-gray-700/40">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white z-20"
              onClick={() => setShowCommentModal(false)}
              type="button"
              tabIndex={-1}
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300">
              Commentaire
            </h3>
            <textarea
              value={comment ?? ""}
              onChange={(e) => setComment(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Saisissez ici un commentaire libre pour cette User Story..."
              autoFocus
            />
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={() => setShowCommentModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );

  // Si c'est en mode modale, encapsuler dans un Dialog avec le style du GanttChart
  if (isModal) {
    // Animation state for fade-in/fade-out
    const [isClosing, setIsClosing] = React.useState(false);
    React.useEffect(() => {
      if (!isModal) return;
      if (!isClosing) return;
      const timeout = setTimeout(() => {
        setIsClosing(false);
        if (onClose) onClose();
      }, 160);
      return () => clearTimeout(timeout);
    }, [isClosing, onClose, isModal]);
    return (
      <Dialog
        open={true}
        onClose={() => setIsClosing(true)}
        className="fixed inset-0 z-50"
      >
        {/* Arrière-plan avec blur et animation fade-in/fade-out */}
        <div
          className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-150 opacity-100 bento-modal-anim ${
            isClosing ? "animate-fadeout" : "animate-fadein"
          }`}
          aria-hidden="true"
          onClick={() => setIsClosing(true)}
        />

        {isMobile ? (
          // Version mobile: bottom sheet full screen
          <div className="fixed inset-x-0 bottom-0 top-8 z-10">
            <div
              className={`bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 h-full flex flex-col transition-all duration-300 ${
                isClosing ? "animate-fadeout" : "animate-fadein"
              }`}
            >
              {/* Header fixe */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-2xl flex-shrink-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editId ? "Modifier User Story" : "Nouvelle User Story"}
                </h3>
                <button
                  onClick={() => setIsClosing(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">{formContent}</div>
              </div>
            </div>
          </div>
        ) : (
          // Version desktop: modale centrée
          <div className="fixed inset-0 flex items-center justify-center">
            <div
              className={`bento-modal-anim relative rounded-2xl shadow-2xl w-full sm:w-[95vw] mx-4 max-h-[97vh] z-10 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-white/30 dark:border-gray-700/40 transition-all duration-300 ${
                isClosing ? "animate-fadeout" : "animate-fadein"
              } bento-modal-bounce`}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white z-20"
                onClick={() => setIsClosing(true)}
                type="button"
                tabIndex={-1}
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
              {formContent}
            </div>
          </div>
        )}
      </Dialog>
    );
  }

  // Mode normal (sans modale)
  return formContent;
};

export default UserStoryForm;
