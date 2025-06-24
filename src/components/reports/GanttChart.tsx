import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { addDays, differenceInDays, format, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import html2canvas from "html2canvas";
import React, { useMemo, useRef, useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn, responsiveClasses } from "../../lib/mobileUtils";
import { useAppStore } from "../../store/appStore";
import { UserStory } from "../../types/UserStory";
import UserStoryDetailModal from "../ui/UserStoryDetailModal";

const GanttChart: React.FC = () => {
  const { userStories = [], settings } = useAppStore();
  const { isMobile } = useDeviceType();
  const [filter, setFilter] = useState<string>("all");
  const [zoom, setZoom] = useState<number>(isMobile ? 0.8 : 1); // Zoom par défaut plus petit sur mobile
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<"timeline" | "list">(
    "list"
  ); // Mode d'affichage mobile
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0); // Navigation par semaine sur mobile  // Ajout d'un état pour la classe no-select
  const [noSelect, setNoSelect] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [forceFullRender, setForceFullRender] = useState(false);
  const ganttRef = useRef<HTMLDivElement>(null);

  // Trier les user stories par ordre
  const sortedStories = [...(userStories || [])].sort(
    (a, b) => a.order - b.order
  );
  // Obtenir tous les epics uniques pour le filtre
  const epics = [
    "all",
    ...new Set((userStories || []).map((story) => story.epic)),
  ];

  // Filtrer les user stories par epic si nécessaire, directement dans la virtualisation
  const filteredStories =
    filter === "all"
      ? sortedStories
      : sortedStories.filter((story) => story.epic === filter);

  // Calculer les dates min et max pour le diagramme à partir des stories filtrées
  const dateRange = useMemo(() => {
    if (filteredStories.length === 0) {
      return {
        minDate: new Date(),
        maxDate: addDays(new Date(), 30),
      };
    }
    const allStartDates = filteredStories
      .map((story) => story.estimatedStartDate)
      .filter(Boolean) as Date[];
    const allEndDates = filteredStories
      .map((story) => story.estimatedEndDate)
      .filter(Boolean) as Date[];
    let minDate =
      allStartDates.length > 0
        ? new Date(Math.min(...allStartDates.map((d) => d.getTime())))
        : settings.projectStartDate;
    let maxDate =
      allEndDates.length > 0
        ? new Date(Math.max(...allEndDates.map((d) => d.getTime())))
        : settings.projectStartDate;
    minDate = addDays(minDate, -3);
    maxDate = addDays(maxDate, 3);
    return { minDate, maxDate };
  }, [filteredStories, settings.projectStartDate]);

  // Calculer le nombre total de jours
  const totalDays = differenceInDays(dateRange.maxDate, dateRange.minDate) + 1;
  const dates = useMemo(
    () =>
      Array.from({ length: totalDays }, (_, i) =>
        addDays(dateRange.minDate, i)
      ),
    [dateRange, totalDays]
  );

  // Générer les informations de mois pour l'en-tête fusionnée à partir des dates visibles
  const months = useMemo(() => {
    if (dates.length === 0) return [];
    const result: { label: string; start: number; end: number }[] = [];
    let currentMonth = dates[0].getMonth();
    let currentYear = dates[0].getFullYear();
    let startIdx = 0;
    for (let i = 1; i < dates.length; i++) {
      if (
        dates[i].getMonth() !== currentMonth ||
        dates[i].getFullYear() !== currentYear
      ) {
        result.push({
          label: format(dates[startIdx], "MMMM yyyy", { locale: fr }),
          start: startIdx,
          end: i - 1,
        });
        startIdx = i;
        currentMonth = dates[i].getMonth();
        currentYear = dates[i].getFullYear();
      }
    }
    result.push({
      label: format(dates[startIdx], "MMMM yyyy", { locale: fr }),
      start: startIdx,
      end: dates.length - 1,
    });
    return result;
  }, [dates]);

  // Vérifier si une date est un jour ouvré
  const isWorkday = (date: Date) => {
    const day = date.getDay();
    const dayMap: Record<number, keyof typeof settings.workdays> = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };

    // Vérifier si c'est un jour de la semaine travaillé
    if (!settings.workdays[dayMap[day]]) {
      return false;
    }

    // Vérifier si c'est un jour férié
    for (const holiday of settings.holidays) {
      if (
        isWithinInterval(date, {
          start: holiday.startDate,
          end: holiday.endDate,
        })
      ) {
        return false;
      }
    }

    return true;
  };

  // Utilitaire pour forcer les styles de troncature, police ET alignement vertical en inline sur tous les éléments critiques
  function forceTruncateInlineStylesAndFont(apply: boolean) {
    // Cible les éléments critiques du Gantt (badges, .truncate, .font-bold, .flex, .items-center)
    const elements = document.querySelectorAll(
      ".truncate, .font-bold, .flex, .items-center"
    );
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (apply) {
        htmlEl.setAttribute(
          "data-old-style",
          htmlEl.getAttribute("style") || ""
        );
        // Troncature
        if (htmlEl.classList.contains("truncate")) {
          htmlEl.style.overflow = "hidden";
          htmlEl.style.textOverflow = "ellipsis";
          htmlEl.style.whiteSpace = "nowrap";
          htmlEl.style.maxWidth = "100%";
          htmlEl.style.display = "block";
        }
        // Police et alignement vertical (copie les styles calculés)
        const computed = window.getComputedStyle(htmlEl);
        htmlEl.style.fontFamily = computed.fontFamily;
        htmlEl.style.fontWeight = computed.fontWeight;
        htmlEl.style.fontSize = computed.fontSize;
        htmlEl.style.letterSpacing = computed.letterSpacing;
        htmlEl.style.fontStyle = computed.fontStyle;
        htmlEl.style.lineHeight = computed.lineHeight;
        htmlEl.style.color = computed.color;
        htmlEl.style.textAlign = computed.textAlign;
        // Alignement vertical et padding
        htmlEl.style.display = computed.display;
        htmlEl.style.alignItems = computed.alignItems;
        htmlEl.style.justifyContent = computed.justifyContent;
        htmlEl.style.height = computed.height;
        htmlEl.style.paddingTop = computed.paddingTop;
        htmlEl.style.paddingBottom = computed.paddingBottom;
        htmlEl.style.marginTop = computed.marginTop;
        htmlEl.style.marginBottom = computed.marginBottom;
        htmlEl.style.verticalAlign = computed.verticalAlign;
      } else {
        const oldStyle = htmlEl.getAttribute("data-old-style");
        if (oldStyle !== null) {
          htmlEl.setAttribute("style", oldStyle);
          htmlEl.removeAttribute("data-old-style");
        }
      }
    });
  }

  // Exporter le diagramme en PNG
  const exportToPng = async () => {
    if (!ganttRef.current) return;
    setIsExporting(true);
    setForceFullRender(true); // Désactive la virtualisation
    try {
      await new Promise((resolve) => setTimeout(resolve, 60));
      // Forcer la hauteur du conteneur à son scrollHeight pour l'export
      const scrollContainer = document.querySelector(
        ".gantt-scroll-container"
      ) as HTMLDivElement;
      const originalContainerStyle =
        scrollContainer?.getAttribute("style") || "";
      if (scrollContainer) {
        scrollContainer.style.maxHeight = "none";
        scrollContainer.style.minHeight = "0";
        scrollContainer.style.overflowY = "visible";
        scrollContainer.style.overflowX = "visible";
      }
      const originalHeight = ganttRef.current.style.height;
      const originalMaxHeight = ganttRef.current.style.maxHeight;
      const originalMinHeight = ganttRef.current.style.minHeight;
      ganttRef.current.style.height = ganttRef.current.scrollHeight + "px";
      ganttRef.current.style.maxHeight = "none";
      ganttRef.current.style.minHeight = "0";
      await new Promise((resolve) => setTimeout(resolve, 30));
      // Appliquer les styles de troncature ET de police en inline
      forceTruncateInlineStylesAndFont(true);
      const canvas = await html2canvas(ganttRef.current, {
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        useCORS: true,
        scale: 2,
      });
      // Restaurer les styles
      forceTruncateInlineStylesAndFont(false);
      // Restaurer la hauteur d'origine
      ganttRef.current.style.height = originalHeight;
      ganttRef.current.style.maxHeight = originalMaxHeight;
      ganttRef.current.style.minHeight = originalMinHeight;
      if (scrollContainer) {
        scrollContainer.setAttribute("style", originalContainerStyle);
      }
      const link = document.createElement("a");
      link.download = `gantt-chart-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Erreur lors de l'export du diagramme:", error);
    } finally {
      setForceFullRender(false); // Réactive la virtualisation
      setIsExporting(false);
    }
  };

  // Obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Must Have":
        return "bg-red-500 dark:bg-red-600";
      case "Should Have":
        return "bg-yellow-500 dark:bg-yellow-600";
      case "Could Have":
        return "bg-green-500 dark:bg-green-600";
      default:
        return "bg-gray-500 dark:bg-gray-600";
    }
  };

  // Largeur de colonne dynamique selon le zoom
  const baseColWidth = 30; // px
  const colWidth = baseColWidth * zoom;

  if (userStories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Diagramme de Gantt
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune donnée disponible. Ajoutez des User Stories pour générer le
          diagramme de Gantt.
        </p>
      </div>
    );
  }

  // Gestion du drag-to-scroll (pan) horizontal et vertical optimisée
  const isPanning = useRef(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollStart = useRef<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const animationFrame = useRef<number | null>(null);

  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    setNoSelect(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    const container = (e.currentTarget as HTMLDivElement).closest(
      ".gantt-scroll-container"
    ) as HTMLDivElement;
    if (container) {
      scrollStart.current = {
        left: container.scrollLeft,
        top: container.scrollTop,
      };
      container.style.cursor = "grabbing";
    }
    // Appel immédiat du déplacement pour éviter l'accoup initial
    handlePanMove({ clientX: e.clientX, clientY: e.clientY } as MouseEvent);
    window.addEventListener("mousemove", handlePanMove, { passive: true });
    window.addEventListener("mouseup", handlePanEnd);
  };

  const handlePanMove = (e: MouseEvent) => {
    if (!isPanning.current) return;
    if (animationFrame.current) return; // throttle to animation frame
    animationFrame.current = requestAnimationFrame(() => {
      const container = document.querySelector(
        ".gantt-scroll-container"
      ) as HTMLDivElement;
      if (container) {
        const dx = panStart.current.x - e.clientX;
        const dy = panStart.current.y - e.clientY;
        container.scrollLeft = scrollStart.current.left + dx;
        container.scrollTop = scrollStart.current.top + dy;
      }
      animationFrame.current = null;
    });
  };

  const handlePanEnd = () => {
    isPanning.current = false;
    setNoSelect(false);
    const container = document.querySelector(
      ".gantt-scroll-container"
    ) as HTMLDivElement;
    if (container) {
      container.style.cursor = "";
    }
    window.removeEventListener("mousemove", handlePanMove);
    window.removeEventListener("mouseup", handlePanEnd);
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };

  // Virtualisation verticale et horizontale combinée
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const rowHeight = 40; // hauteur d'une ligne (h-10 = 2.5rem = 40px)
  const rowBuffer = 5; // nombre de lignes en plus au-dessus et en dessous
  const colBuffer = 5; // nombre de jours en plus à gauche/droite

  // Calcul des bornes de virtualisation (désactivées si forceFullRender)
  const totalRows = filteredStories.length;
  const totalCols = totalDays;
  const virtualized = !forceFullRender;
  const visibleRowStart = virtualized
    ? Math.max(0, Math.floor(scrollTop / rowHeight) - rowBuffer)
    : 0;
  const visibleRowEnd = virtualized
    ? Math.min(
        totalRows,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + rowBuffer
      )
    : totalRows;
  const visibleColStart = virtualized
    ? Math.max(0, Math.floor(scrollLeft / colWidth) - colBuffer)
    : 0;
  const visibleColEnd = virtualized
    ? Math.min(
        totalCols,
        Math.ceil((scrollLeft + containerWidth) / colWidth) + colBuffer
      )
    : totalCols;
  const visibleStories = filteredStories.slice(visibleRowStart, visibleRowEnd);
  const visibleDates = dates.slice(visibleColStart, visibleColEnd);
  const leftColSpacer = visibleColStart * colWidth;
  const rightColSpacer = (totalCols - visibleColEnd) * colWidth;
  const topSpacer = visibleRowStart * rowHeight;
  const bottomSpacer = (totalRows - visibleRowEnd) * rowHeight;
  // Calcul du nombre d'US par Epic pour affichage dans le filtre
  const epicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (userStories || []).forEach((story) => {
      counts[story.epic] = (counts[story.epic] || 0) + 1;
    });
    return counts;
  }, [userStories]);

  // Mobile List View Component
  const MobileListView = () => (
    <div className="space-y-3">
      {filteredStories.map((story) => (
        <div
          key={story.id}
          className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm"
          onClick={() => {
            setSelectedStory(story);
            setIsModalOpen(true);
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {story.id}
            </h4>
            <span
              className={cn(
                "px-2 py-1 rounded text-xs font-bold text-white",
                getPriorityColor(story.priority)
              )}
            >
              {story.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {story.title}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Epic:</span>
              <span className="ml-1 font-medium">{story.epic}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Estimation:
              </span>
              <span className="ml-1 font-medium">{story.estimation}j</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Début:</span>
              <span className="ml-1 font-medium">
                {story.estimatedStartDate
                  ? format(story.estimatedStartDate, "dd/MM")
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Fin:</span>
              <span className="ml-1 font-medium">
                {story.estimatedEndDate
                  ? format(story.estimatedEndDate, "dd/MM")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Mobile Timeline View Component (simplified)
  const MobileTimelineView = () => {
    // Calculer la semaine courante à afficher
    const weekStart = addDays(dateRange.minDate, currentWeekOffset * 7);
    const weekEnd = addDays(weekStart, 6);
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      addDays(weekStart, i)
    );

    return (
      <div className="space-y-4">
        {/* Navigation par semaine */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <button
            onClick={() =>
              setCurrentWeekOffset(Math.max(0, currentWeekOffset - 1))
            }
            className="p-2 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
            disabled={currentWeekOffset === 0}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="font-semibold text-sm">
              {format(weekStart, "dd MMM", { locale: fr })} -{" "}
              {format(weekEnd, "dd MMM yyyy", { locale: fr })}
            </div>
          </div>
          <button
            onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            className="p-2 rounded-lg bg-white dark:bg-gray-600 shadow-sm"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* En-tête des jours */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="py-2">
              <div>{format(date, "EEE", { locale: fr })}</div>
              <div>{format(date, "dd")}</div>
            </div>
          ))}
        </div>

        {/* User Stories pour cette semaine */}
        <div className="space-y-2">
          {filteredStories
            .filter(
              (story) =>
                story.estimatedStartDate &&
                story.estimatedEndDate &&
                (isWithinInterval(weekStart, {
                  start: story.estimatedStartDate,
                  end: story.estimatedEndDate,
                }) ||
                  isWithinInterval(weekEnd, {
                    start: story.estimatedStartDate,
                    end: story.estimatedEndDate,
                  }) ||
                  isWithinInterval(story.estimatedStartDate, {
                    start: weekStart,
                    end: weekEnd,
                  }))
            )
            .map((story) => {
              const storyStart = Math.max(
                0,
                differenceInDays(story.estimatedStartDate!, weekStart)
              );
              const storyEnd = Math.min(
                6,
                differenceInDays(story.estimatedEndDate!, weekStart)
              );
              const gridColStart = Math.max(1, storyStart + 1);
              const gridColEnd = Math.min(8, storyEnd + 2);

              return (
                <div key={story.id} className="relative">
                  <div className="grid grid-cols-7 gap-1 h-12">
                    <div
                      className={cn(
                        "rounded-md flex items-center justify-center text-xs font-semibold text-white shadow-sm",
                        getPriorityColor(story.priority)
                      )}
                      style={{
                        gridColumnStart: gridColStart,
                        gridColumnEnd: gridColEnd,
                      }}
                      onClick={() => {
                        setSelectedStory(story);
                        setIsModalOpen(true);
                      }}
                    >
                      <span className="truncate px-1">{story.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // Ajout des handlers de scroll et de ref (pour éviter l'erreur de non-déclaration)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);
  };
  const onContainerRef = (el: HTMLDivElement | null) => {
    if (el) {
      setContainerHeight(el.clientHeight);
      setContainerWidth(el.clientWidth);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      {/* Header responsive */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Diagramme de Gantt
        </h3>

        {/* Controls - Stack on mobile */}
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
          {/* Mobile View Toggle - Only on mobile */}
          {isMobile && (
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                onClick={() => setMobileViewMode("list")}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  mobileViewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Liste
              </button>
              <button
                onClick={() => setMobileViewMode("timeline")}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  mobileViewMode === "timeline"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Timeline
              </button>
            </div>
          )}

          {/* Epic Filter */}
          <div className="flex-1 md:flex-none">
            <label htmlFor="epic-filter" className="sr-only">
              Filtrer par Epic
            </label>
            <select
              id="epic-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={cn(
                "block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                isMobile ? "h-12 text-base" : "h-10 text-sm"
              )}
            >
              <option value="all">
                Tous les Epics ({(userStories || []).length} US)
              </option>
              {epics
                .filter((epic) => epic !== "all")
                .map((epic) => (
                  <option key={epic} value={epic}>
                    {epic} ({epicCounts[epic] ?? 0} US)
                  </option>
                ))}
            </select>
          </div>

          {/* Zoom Controls - Hide on mobile in list mode */}
          {(!isMobile || mobileViewMode === "timeline") && (
            <div className="flex items-center justify-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className={cn(
                  "rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors",
                  responsiveClasses.touchTarget
                )}
                aria-label="Zoom out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className={cn(
                  "rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors",
                  responsiveClasses.touchTarget
                )}
                aria-label="Zoom in"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={exportToPng}
            className={cn(
              "inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
              isMobile ? "px-4 py-3 text-base h-12" : "px-3 py-2 text-sm h-10"
            )}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Export...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                {isMobile ? "PNG" : "Exporter PNG"}
              </>
            )}
          </button>
        </div>
      </div>{" "}
      {/* Content */}
      {!userStories || userStories.length === 0 ? (
        // Empty state
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Aucune User Story
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Créez votre première User Story pour voir le diagramme de Gantt.
            </p>
          </div>
        </div>
      ) : isMobile ? (
        // Mobile Views
        <div className="mt-4">
          {mobileViewMode === "list" ? (
            <MobileListView />
          ) : (
            <MobileTimelineView />
          )}{" "}
        </div>
      ) : (
        // Desktop Gantt Chart (existing implementation)
        <div
          className={`gantt-scroll-container overflow-x-auto${
            noSelect ? " no-select" : ""
          } custom-scrollbar`}
          style={{
            maxHeight: "69vh",
            minHeight: "69vh",
            overflowY: "auto",
            cursor: "grab",
          }}
          onMouseDown={handlePanStart}
          onScroll={handleScroll}
          ref={onContainerRef}
        >
          <div
            ref={ganttRef}
            className="relative"
            style={{
              width: `${totalDays * colWidth + 192}px`,
              minWidth: "100%",
            }}
          >
            {/* En-tête sticky avec les dates */}
            <div
              className="sticky top-0 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              style={{ width: `${totalDays * colWidth + 192}px` }}
            >
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <div
                  className="w-48 shrink-0 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 sticky left-0 z-30"
                  style={{ backdropFilter: "blur(2px)", width: "192px" }}
                >
                  User Story
                </div>
                {/* Ligne des mois fusionnés */}
                <div
                  className="grow grid"
                  style={{
                    gridTemplateColumns: `repeat(${totalDays}, minmax(${colWidth}px, ${colWidth}px))`,
                    width: `${totalDays * colWidth}px`,
                  }}
                >
                  {months.map((month, idx) => (
                    <div
                      key={idx}
                      className="text-center text-xs font-bold bg-gray-400 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-800 flex items-center justify-center"
                      style={{
                        gridColumn: `span ${month.end - month.start + 1}`,
                      }}
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Ligne des jours */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <div
                  className="w-48 shrink-0 px-6 py-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sticky left-0 z-30"
                  style={{ backdropFilter: "blur(2px)", width: "192px" }}
                />
                <div
                  className="grow grid"
                  style={{
                    gridTemplateColumns: `repeat(${totalDays}, minmax(${colWidth}px, ${colWidth}px))`,
                    width: `${totalDays * colWidth}px`,
                  }}
                >
                  {dates.map((date, index) => {
                    const showAll = colWidth > 24;
                    const showEvery = colWidth > 16 ? 2 : 3;
                    const isFirstOfMonth = date.getDate() === 1;
                    const show =
                      showAll || isFirstOfMonth || index % showEvery === 0;
                    return (
                      <div
                        key={index}
                        className={`text-center text-xs font-medium transition-colors duration-150 ${
                          isFirstOfMonth
                            ? "font-bold text-indigo-600 dark:text-indigo-300"
                            : "text-gray-800 dark:text-gray-100"
                        } ${
                          date.getDay() === 0 || date.getDay() === 6
                            ? "font-bold"
                            : ""
                        } bg-gray-300 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-800`}
                        style={
                          show
                            ? undefined
                            : { opacity: 0, pointerEvents: "none" }
                        }
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Corps du diagramme avec virtualisation verticale et horizontale */}
            <div>
              {topSpacer > 0 && <div style={{ height: topSpacer }} />}
              {visibleStories.map((story: UserStory) => (
                <div
                  key={story.id}
                  className="flex border-b border-gray-200 dark:border-gray-700 group hover:bg-indigo-50/40 dark:hover:bg-indigo-900/30 transition-colors"
                  style={{ width: `${totalDays * colWidth + 192}px` }}
                >
                  {/* Colonne sticky User Story */}
                  <div
                    className="w-48 shrink-0 px-6 py-0 h-10 flex flex-col justify-center whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 z-10 bg-white/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                    style={{ backdropFilter: "blur(2px)", width: "192px" }}
                  >
                    <div className="font-bold group-hover:underline transition-all duration-150 leading-tight">
                      {story.id}
                    </div>
                    <div
                      className="text-xs text-gray-500 dark:text-gray-400 truncate leading-tight"
                      title={story.title}
                    >
                      {story.title}
                    </div>
                  </div>
                  <div
                    className="grow relative h-10 flex"
                    style={{ width: `${totalDays * colWidth}px` }}
                  >
                    {leftColSpacer > 0 && (
                      <div style={{ width: leftColSpacer }} />
                    )}
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${visibleDates.length}, minmax(${colWidth}px, ${colWidth}px))`,
                        width: `${visibleDates.length * colWidth}px`,
                      }}
                    >
                      {visibleDates.map((date, index) => {
                        const globalIndex = visibleColStart + index;
                        if (isWorkday(date)) {
                          return (
                            <div
                              key={globalIndex}
                              className="border-r border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 h-10"
                            />
                          );
                        } else {
                          const showLeftBorder =
                            globalIndex === 0 ||
                            isWorkday(dates[globalIndex - 1]);
                          return (
                            <div
                              key={globalIndex}
                              className="bg-gray-300 dark:bg-gray-700 h-10"
                              style={
                                showLeftBorder
                                  ? { boxShadow: "inset 0.1px 0 0 0 #d1d5db" }
                                  : undefined
                              }
                            />
                          );
                        }
                      })}
                    </div>
                    {rightColSpacer > 0 && (
                      <div style={{ width: rightColSpacer }} />
                    )}
                    {/* Barre du Gantt, affichée seulement si elle est dans la plage visible */}
                    {story.estimatedStartDate &&
                      story.estimatedEndDate &&
                      (() => {
                        const barStart = differenceInDays(
                          story.estimatedStartDate,
                          dateRange.minDate
                        );
                        const barEnd = differenceInDays(
                          story.estimatedEndDate,
                          dateRange.minDate
                        );
                        if (
                          barEnd < visibleColStart ||
                          barStart > visibleColEnd - 1
                        )
                          return null;
                        const left =
                          Math.max(barStart, visibleColStart) * colWidth;
                        const width =
                          (Math.min(barEnd, visibleColEnd - 1) -
                            Math.max(barStart, visibleColStart) +
                            1) *
                          colWidth;
                        return (
                          <div
                            className={`absolute top-0 h-10 rounded-md shadow-md flex items-center justify-center text-white text-xs font-semibold drop-shadow cursor-pointer ${getPriorityColor(
                              story.priority
                            )}`}
                            style={{
                              left,
                              width,
                              zIndex: 2,
                              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
                            }}
                            title={`${story.id} - ${story.title} (${story.estimation} jours)`}
                            onClick={() => {
                              setSelectedStory(story);
                              setIsModalOpen(true);
                            }}
                          >
                            <span
                              className="truncate px-2"
                              style={{
                                textShadow: "0 1px 2px rgba(0,0,0,0.18)",
                              }}
                            >
                              {story.id}
                            </span>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              ))}{" "}
              {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}
            </div>
          </div>
        </div>
      )}{" "}
      {/* Modale détails User Story - responsive avec design mobile optimisé */}
      <UserStoryDetailModal
        userStory={selectedStory}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStory(null);
        }}
      />
    </div>
  );
};

export default GanttChart;
