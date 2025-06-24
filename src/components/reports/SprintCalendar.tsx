import {
  addDays,
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { fr } from "date-fns/locale";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { useAppStore } from "../../store/appStore";
import { UserStory } from "../../types/UserStory";
import UserStoryDetailModal from "../ui/UserStoryDetailModal";

const VIEWS = ["semaine", "mois", "année"] as const;
type ViewType = (typeof VIEWS)[number];

const SprintCalendar: React.FC = () => {
  const { userStories, isWorkday, settings } = useAppStore();
  const { isMobile } = useDeviceType();
  const [view, setView] = useState<ViewType>(isMobile ? "semaine" : "mois");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredUSId, setHoveredUSId] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [multipleUSModal, setMultipleUSModal] = useState<{
    isOpen: boolean;
    stories: UserStory[];
    date: Date | null;
  }>({
    isOpen: false,
    stories: [],
    date: null,
  });

  // Réf pour le scroll auto de la table US
  const usRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // Scroll fluide vers la ligne US sur hover
  useEffect(() => {
    if (hoveredUSId && usRowRefs.current[hoveredUSId]) {
      usRowRefs.current[hoveredUSId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [hoveredUSId]);
  // Sprint length paramétrable (2 ou 3 semaines)
  const [sprintLength, setSprintLength] = useState(2); // en semaines

  // Fonction helper pour ouvrir la modale de détails US
  const openUserStoryModal = (story: UserStory) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  // Générer les sprints
  const sprints = useMemo(() => {
    if (userStories.length === 0) return [];
    let minDate: Date | null = null,
      maxDate: Date | null = null;
    userStories.forEach((story) => {
      if (story.estimatedStartDate) {
        if (!minDate || story.estimatedStartDate < minDate)
          minDate = story.estimatedStartDate;
        if (!maxDate || story.estimatedStartDate > maxDate)
          maxDate = story.estimatedStartDate;
      }
      if (story.estimatedEndDate) {
        if (!minDate || story.estimatedEndDate < minDate)
          minDate = story.estimatedEndDate;
        if (!maxDate || story.estimatedEndDate > maxDate)
          maxDate = story.estimatedEndDate;
      }
    });
    if (!minDate || !maxDate) return [];
    const start = new Date(minDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const sprints = [];
    let sprintStart = new Date(start);
    let sprintNum = 1;
    const maxDateObj = new Date(maxDate);
    while (sprintStart <= maxDateObj) {
      const sprintEnd = new Date(sprintStart);
      sprintEnd.setDate(sprintEnd.getDate() + sprintLength * 7 - 1);
      const usInSprint = userStories.filter((story) => {
        if (!story.estimatedStartDate || !story.estimatedEndDate) return false;
        return (
          isWithinInterval(story.estimatedStartDate, {
            start: sprintStart,
            end: sprintEnd,
          }) ||
          isWithinInterval(story.estimatedEndDate, {
            start: sprintStart,
            end: sprintEnd,
          }) ||
          (story.estimatedStartDate <= sprintStart &&
            story.estimatedEndDate >= sprintEnd)
        );
      });
      sprints.push({
        num: sprintNum,
        start: new Date(sprintStart),
        end: new Date(sprintEnd),
        us: usInSprint,
      });
      sprintStart = new Date(sprintEnd);
      sprintStart.setDate(sprintStart.getDate() + 1);
      sprintNum++;
    }
    return sprints;
  }, [userStories, sprintLength]);

  // Helpers
  // Correction : inclure explicitement le premier et le dernier jour dans l'affichage des US
  const getUSForDay = (day: Date) =>
    userStories.filter((story) => {
      if (!story.estimatedStartDate || !story.estimatedEndDate) return false;
      // On compare uniquement année/mois/jour (ignorer l'heure)
      const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const start = new Date(
        story.estimatedStartDate.getFullYear(),
        story.estimatedStartDate.getMonth(),
        story.estimatedStartDate.getDate()
      );
      const end = new Date(
        story.estimatedEndDate.getFullYear(),
        story.estimatedEndDate.getMonth(),
        story.estimatedEndDate.getDate()
      );
      return d >= start && d <= end;
    });
  const getUSForMonth = (monthStart: Date, monthEnd: Date) =>
    userStories.filter(
      (story) =>
        story.estimatedStartDate &&
        story.estimatedEndDate &&
        (isWithinInterval(story.estimatedStartDate, {
          start: monthStart,
          end: monthEnd,
        }) ||
          isWithinInterval(story.estimatedEndDate, {
            start: monthStart,
            end: monthEnd,
          }) ||
          (story.estimatedStartDate <= monthStart &&
            story.estimatedEndDate >= monthEnd))
    );

  // Plages d'affichage
  const { label } = useMemo(() => {
    let start: Date,
      end: Date,
      label = "";
    let monthRanges: { start: Date; end: Date }[] = [];
    if (view === "semaine") {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
      label = format(currentDate, "MMMM yyyy", { locale: fr });
    } else if (view === "mois") {
      start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      label = format(currentDate, "MMMM yyyy", { locale: fr });
      monthRanges = [{ start, end }];
    } else {
      start = startOfWeek(startOfYear(currentDate), { weekStartsOn: 1 });
      end = endOfWeek(endOfYear(currentDate), { weekStartsOn: 1 });
      label = format(currentDate, "yyyy", { locale: fr });
      let ms = startOfMonth(start);
      while (ms <= end) {
        const me = endOfMonth(ms);
        monthRanges.push({ start: ms, end: me });
        ms = addMonths(ms, 1);
      }
    }
    return { label, monthRanges };
  }, [currentDate, view]);

  // Helpers jours spéciaux
  const isWeekend = (date: Date) => [0, 6].includes(date.getDay());
  const isHoliday = (date: Date) => {
    return settings.holidays.some((holiday) => {
      if (!holiday.startDate || !holiday.endDate) return false;
      const start =
        holiday.startDate instanceof Date
          ? holiday.startDate
          : new Date(holiday.startDate);
      const end =
        holiday.endDate instanceof Date
          ? holiday.endDate
          : new Date(holiday.endDate);
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return (
        d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        d <= new Date(end.getFullYear(), end.getMonth(), end.getDate())
      );
    });
  };
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-0 ${
        isMobile ? "p-2" : "p-6 pt-0"
      }`}
    >
      {/* En-tête adaptatif */}
      <div
        className={`flex items-center justify-between mb-4 ${
          isMobile ? "flex-col gap-3" : "flex-row"
        }`}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white"></h3>

        {/* Contrôles compacts pour mobile */}
        <div
          className={`flex items-center gap-2 ${
            isMobile ? "flex-col w-full" : "flex-row"
          }`}
        >
          {/* Sélecteur de durée de sprint */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="sprint-length"
              className={`text-gray-700 dark:text-gray-300 ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              Durée du sprint :
            </label>{" "}
            <select
              id="sprint-length"
              value={sprintLength}
              onChange={(e) => setSprintLength(Number(e.target.value))}
              className={`rounded px-2 py-1 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                isMobile ? "text-sm" : ""
              }`}
            >
              <option value={2}>2 semaines</option>
              <option value={3}>3 semaines</option>
            </select>
          </div>

          {/* Sélecteur de vue */}
          <div
            className={`flex gap-1 ${isMobile ? "w-full justify-center" : ""}`}
          >
            {VIEWS.map((v) => (
              <button
                key={v}
                className={`px-3 py-1 rounded transition-colors ${
                  isMobile ? "text-xs" : "text-sm"
                } ${
                  view === v
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        {view === "semaine" &&
          (() => {
            let minDate: Date | null = null,
              maxDate: Date | null = null;
            userStories.forEach((story) => {
              if (story.estimatedStartDate instanceof Date) {
                if (!minDate || story.estimatedStartDate < minDate)
                  minDate = story.estimatedStartDate;
                if (!maxDate || story.estimatedStartDate > maxDate)
                  maxDate = story.estimatedStartDate;
              }
              if (story.estimatedEndDate instanceof Date) {
                if (!minDate || story.estimatedEndDate < minDate)
                  minDate = story.estimatedEndDate;
                if (!maxDate || story.estimatedEndDate > maxDate)
                  maxDate = story.estimatedEndDate;
              }
            });
            if (!minDate || !maxDate) return null;
            // Forcer le typage en Date (évite le bug TS sur never)
            const minMonth = new Date(
              (minDate as Date).getFullYear(),
              (minDate as Date).getMonth(),
              1
            );
            const maxMonth = new Date(
              (maxDate as Date).getFullYear(),
              (maxDate as Date).getMonth(),
              1
            );
            const isPrevDisabled =
              currentDate.getFullYear() < minMonth.getFullYear() ||
              (currentDate.getFullYear() === minMonth.getFullYear() &&
                currentDate.getMonth() <= minMonth.getMonth());
            const isNextDisabled =
              currentDate.getFullYear() > maxMonth.getFullYear() ||
              (currentDate.getFullYear() === maxMonth.getFullYear() &&
                currentDate.getMonth() >= maxMonth.getMonth());
            return (
              <>
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  disabled={isPrevDisabled}
                  className={`px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                    isPrevDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  &lt;
                </button>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                  {format(currentDate, "MMMM yyyy", { locale: fr })}
                </span>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  disabled={isNextDisabled}
                  className={`px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                    isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  &gt;
                </button>
              </>
            );
          })()}
        {view === "année" && (
          <span className="font-semibold text-lg text-gray-900 dark:text-white">
            {label}
          </span>
        )}
      </div>
      {/* En-tête jours semaine + vue semaine dans la grille 7 colonnes */}
      {view === "semaine" &&
        (() => {
          // Générer toutes les semaines du mois courant
          const firstDayOfMonth = startOfMonth(currentDate);
          const lastDayOfMonth = endOfMonth(currentDate);
          const firstDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
          const lastDay = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
          const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
          const weeks: Date[][] = [];
          for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
          }
          // Filtrer les semaines sans US ni congé
          const filteredWeeks = weeks.filter((week) =>
            week.some((day) => getUSForDay(day).length > 0 || isHoliday(day))
          );
          return (
            <div
              className="w-full"
              style={{
                maxHeight: isMobile ? "70vh" : "59vh",
                overflowY: "auto",
              }}
            >
              {/* En-têtes des jours */}
              <div
                className={`grid grid-cols-7 mt-2 mb-1 ${
                  isMobile ? "gap-0.5" : "gap-1"
                }`}
              >
                {[...Array(7)].map((_, i) => {
                  const day = addDays(
                    startOfWeek(new Date(), { weekStartsOn: 1 }),
                    i
                  );
                  return (
                    <div
                      key={i}
                      className={`font-bold text-center text-gray-500 dark:text-gray-300 pb-1 ${
                        isMobile ? "text-[10px]" : "text-xs"
                      }`}
                    >
                      {format(day, isMobile ? "EEEEEE" : "EEEEEE", {
                        locale: fr,
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Grille des semaines */}
              {filteredWeeks.map((week, wIdx) => (
                <div
                  key={wIdx}
                  className={`grid grid-cols-7 mb-1 ${
                    isMobile ? "gap-0.5" : "gap-1"
                  }`}
                >
                  {week.map((day) => {
                    const sprint = sprints.find(
                      (sprint) =>
                        day >=
                          new Date(
                            sprint.start.getFullYear(),
                            sprint.start.getMonth(),
                            sprint.start.getDate()
                          ) &&
                        day <=
                          new Date(
                            sprint.end.getFullYear(),
                            sprint.end.getMonth(),
                            sprint.end.getDate()
                          )
                    );
                    const us = getUSForDay(day);
                    const workday = isWorkday(day);
                    const weekend = isWeekend(day);
                    const holiday = isHoliday(day);
                    let bg = "";
                    if (holiday)
                      bg =
                        "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-600";
                    else if (weekend)
                      bg =
                        "bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600";
                    else if (workday)
                      bg =
                        "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600";
                    else
                      bg =
                        "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";

                    return (
                      <div
                        key={day.toISOString()}
                        className={`${
                          isMobile ? "h-16" : "h-24"
                        } border rounded flex flex-col items-center justify-start p-1 ${bg} ${
                          isSameDay(day, new Date())
                            ? "ring-2 ring-indigo-500"
                            : ""
                        } ${isMobile ? "text-[9px]" : "text-xs"}`}
                        title={
                          sprint
                            ? `Sprint ${sprint.num}\nDu ${format(
                                sprint.start,
                                "dd/MM/yyyy"
                              )} au ${format(sprint.end, "dd/MM/yyyy")}`
                            : ""
                        }
                      >
                        {/* Numéro du jour */}
                        <span
                          className={`font-semibold mb-1 ${
                            day.getMonth() !== currentDate.getMonth()
                              ? "text-gray-400 dark:text-gray-600"
                              : ""
                          } ${isMobile ? "text-[10px]" : "text-xs"}`}
                        >
                          {format(day, "d")}
                        </span>

                        {/* Numéro de sprint */}
                        {sprint && workday && !holiday && (
                          <span
                            className={`text-indigo-700 dark:text-indigo-300 font-bold mb-1 ${
                              isMobile ? "text-[8px]" : "text-xs"
                            }`}
                          >
                            S{String(sprint.num).padStart(2, "0")}
                          </span>
                        )}

                        {/* User Stories - compactes sur mobile */}
                        {us.length > 0 && !holiday && !weekend && (
                          <div
                            className={`mt-1 w-full text-left break-words whitespace-pre-line ${
                              isMobile
                                ? "text-[7px] leading-tight"
                                : "text-[11px]"
                            }`}
                            style={{ wordBreak: "break-word" }}
                          >
                            {" "}
                            {isMobile ? (
                              // Sur mobile, afficher le nombre d'US et permettre le clic
                              us.length === 1 ? (
                                // Si une seule US, clic direct pour ouvrir la modale
                                <div
                                  className="text-center bg-indigo-100 dark:bg-indigo-900/50 rounded px-1 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800/70 transition-colors"
                                  onClick={() => openUserStoryModal(us[0])}
                                  title={`Cliquer pour voir les détails de ${us[0].title}`}
                                >
                                  1 US
                                </div>
                              ) : (
                                // Si plusieurs US, ouvrir une modale de sélection
                                <div
                                  className="text-center bg-indigo-100 dark:bg-indigo-900/50 rounded px-1 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800/70 transition-colors"
                                  onClick={() =>
                                    setMultipleUSModal({
                                      isOpen: true,
                                      stories: us,
                                      date: day,
                                    })
                                  }
                                  title={`${
                                    us.length
                                  } User Stories ce jour: ${us
                                    .map((s) => s.title)
                                    .join(", ")}`}
                                >
                                  {us.length} US
                                </div>
                              )
                            ) : (
                              // Sur desktop, afficher les détails
                              us.map((story) => (
                                <div
                                  key={story.id}
                                  className="truncate whitespace-pre-line cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded px-1 transition-colors"
                                  title={`${story.title} (${format(
                                    story.estimatedStartDate!,
                                    "dd/MM"
                                  )} - ${format(
                                    story.estimatedEndDate!,
                                    "dd/MM"
                                  )})`}
                                  onClick={() => openUserStoryModal(story)}
                                >
                                  • {story.id} : {story.title}
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Jours fériés */}
                        {holiday && (
                          <span
                            className={`text-red-500 mt-1 ${
                              isMobile ? "text-[7px]" : "text-[10px]"
                            }`}
                          >
                            {(() => {
                              const d = new Date(
                                day.getFullYear(),
                                day.getMonth(),
                                day.getDate()
                              );
                              const found = settings.holidays.find(
                                (holiday) => {
                                  if (!holiday.startDate || !holiday.endDate)
                                    return false;
                                  const start =
                                    holiday.startDate instanceof Date
                                      ? new Date(
                                          holiday.startDate.getFullYear(),
                                          holiday.startDate.getMonth(),
                                          holiday.startDate.getDate()
                                        )
                                      : new Date(holiday.startDate);
                                  const end =
                                    holiday.endDate instanceof Date
                                      ? new Date(
                                          holiday.endDate.getFullYear(),
                                          holiday.endDate.getMonth(),
                                          holiday.endDate.getDate()
                                        )
                                      : new Date(holiday.endDate);
                                  // Comparaison stricte sur la date (ignorer l'heure), intervalle inclusif
                                  return d >= start && d <= end;
                                }
                              );
                              return found && found.title
                                ? found.title
                                : "Congé";
                            })()}
                          </span>
                        )}
                        {weekend && !holiday && (
                          <span className="text-gray-500 text-[10px] mt-1">
                            Week-end
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}
      {/* Vue mois : hors de la grille semaine */}
      {view === "mois" &&
        (() => {
          // Déterminer le mois de début et de fin selon les US
          let minDate: Date | null = null,
            maxDate: Date | null = null;
          userStories.forEach((story) => {
            if (story.estimatedStartDate instanceof Date) {
              if (!minDate || story.estimatedStartDate < minDate)
                minDate = story.estimatedStartDate;
              if (!maxDate || story.estimatedStartDate > maxDate)
                maxDate = story.estimatedStartDate;
            }
            if (story.estimatedEndDate instanceof Date) {
              if (!minDate || story.estimatedEndDate < minDate)
                minDate = story.estimatedEndDate;
              if (!maxDate || story.estimatedEndDate > maxDate)
                maxDate = story.estimatedEndDate;
            }
          });
          if (!minDate || !maxDate) return null;
          const startMonth = new Date(
            (minDate as Date).getFullYear(),
            (minDate as Date).getMonth(),
            1
          );
          const endMonth = new Date(
            (maxDate as Date).getFullYear(),
            (maxDate as Date).getMonth(),
            1
          );
          const months: { start: Date; end: Date }[] = [];
          let m = new Date(startMonth);
          while (m <= endMonth) {
            const start = new Date(m);
            const end = endOfMonth(start);
            months.push({ start, end });
            m = addMonths(m, 1);
          }
          // Regrouper en trimestres (3 mois par ligne)
          const trimestres: {
            startYear: number;
            trimestreNum: number;
            months: { start: Date; end: Date }[];
          }[] = [];
          let i = 0;
          while (i < months.length) {
            const year = months[i].start.getFullYear();
            const month = months[i].start.getMonth();
            const trimestreNum = Math.floor(month / 3) + 1;
            const monthsInTrim = months
              .slice(i, i + 3)
              .filter(
                (mo) =>
                  mo.start.getFullYear() === year &&
                  Math.floor(mo.start.getMonth() / 3) + 1 === trimestreNum
              );
            trimestres.push({
              startYear: year,
              trimestreNum,
              months: monthsInTrim,
            });
            i += monthsInTrim.length;
          }
          let lastYear: number | null = null;
          return (
            <div
              className="rounded text-xs p-3"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              {trimestres.map((trim, tIdx) => {
                const year = trim.startYear;
                const trimestreNum = trim.trimestreNum;
                const showYear = year !== lastYear;
                lastYear = year;
                return (
                  <div key={tIdx} className="mb-4">
                    {showYear && year && (
                      <div className="font-bold text-base text-gray-700 dark:text-gray-200 mb-1 mt-2">
                        {year}
                      </div>
                    )}
                    <div className="flex items-center mb-2">
                      <span className="inline-block font-semibold text-indigo-700 dark:text-indigo-300 mr-2">
                        T{trimestreNum}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {trim.months
                          .map((m) => format(m.start, "MMMM", { locale: fr }))
                          .join(" - ")}
                      </span>
                    </div>{" "}
                    <div
                      className={`grid gap-4 min-w-[208px] w-full ${
                        isMobile ? "grid-cols-1" : "grid-cols-3"
                      }`}
                    >
                      {trim.months.map((range, idx) => {
                        const sprint = sprints.find(
                          (sprint) =>
                            isWithinInterval(range.start, {
                              start: sprint.start,
                              end: sprint.end,
                            }) ||
                            isWithinInterval(range.end, {
                              start: sprint.start,
                              end: sprint.end,
                            }) ||
                            (sprint.start <= range.start &&
                              sprint.end >= range.end)
                        );
                        const us = getUSForMonth(range.start, range.end);
                        const monthDays = eachDayOfInterval({
                          start: range.start,
                          end: range.end,
                        });
                        const dayTypes = monthDays.map((day) => ({
                          isWorkday: isWorkday(day),
                          isWeekend: isWeekend(day),
                          isHoliday: isHoliday(day),
                          date: day,
                        }));
                        const nbOuvres = dayTypes.filter(
                          (d) => d.isWorkday && !d.isHoliday
                        ).length;
                        const nbWeekends = dayTypes.filter(
                          (d) => d.isWeekend && !d.isHoliday
                        ).length;
                        const nbConges = dayTypes.filter(
                          (d) => d.isHoliday
                        ).length;
                        const tooltip = `${format(range.start, "MMMM yyyy", {
                          locale: fr,
                        })}\nOuvrés: ${nbOuvres}, Week-ends: ${nbWeekends}, Congés: ${nbConges}\nUS: ${
                          us.length
                        }`;
                        return (
                          <div
                            key={idx}
                            className={`border rounded flex flex-col items-center text-xs mb-1 w-full col-span-1 ${
                              isMobile
                                ? sprintLength === 3
                                  ? "min-h-[500px] py-3 px-2" // Augmentation significative pour 3 semaines
                                  : "min-h-[420px] py-3 px-2" // Augmentation pour 2 semaines
                                : "h-64"
                            } ${
                              sprint
                                ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-600"
                                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            }`}
                            title={tooltip}
                          >
                            {" "}
                            <span
                              className={`font-semibold ${
                                isMobile ? "mt-1 mb-2 text-sm" : "mt-3 mb-3"
                              }`}
                            >
                              {format(range.start, "MMMM yyyy", { locale: fr })}
                            </span>
                            <div
                              className={`flex gap-[2px] flex-wrap justify-center ${
                                isMobile ? "mt-1 mb-2 max-w-full" : "mt-1 mb-3"
                              }`}
                            >
                              {dayTypes.map((d, i) => (
                                <span
                                  key={i}
                                  className={`w-3 h-3 rounded-sm inline-block transition-colors duration-200
                                  ${
                                    d.isHoliday
                                      ? "bg-red-300"
                                      : d.isWeekend
                                      ? "bg-gray-300"
                                      : d.isWorkday
                                      ? "bg-green-400"
                                      : "bg-gray-100"
                                  }
                                `}
                                  style={{ boxSizing: "border-box" }}
                                ></span>
                              ))}
                            </div>{" "}
                            {sprint && (
                              <span
                                className={`text-indigo-700 dark:text-indigo-300 font-bold text-xs ${
                                  isMobile ? "mb-2" : "mb-3"
                                }`}
                              >
                                S{String(sprint.num).padStart(2, "0")}
                              </span>
                            )}{" "}
                            {us.length > 0 && (
                              <div
                                className={`mt-1 w-full text-left break-words whitespace-pre-line overflow-y-auto flex-1 ${
                                  isMobile
                                    ? `ml-2 text-xs px-2 ${
                                        sprintLength === 3
                                          ? "max-h-96" // Beaucoup plus d'espace pour 9+ US
                                          : "max-h-80" // Plus d'espace pour 6+ US
                                      }`
                                    : `ml-5 text-[11px] ${
                                        sprintLength === 3
                                          ? "max-h-48"
                                          : "max-h-32"
                                      }`
                                }`}
                              >
                                {" "}
                                {us.map((story) => (
                                  <div
                                    key={story.id}
                                    className={`whitespace-pre-line flex items-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors ${
                                      isMobile
                                        ? "flex-col items-start mb-2 p-2 bg-white/50 dark:bg-gray-800/50"
                                        : "flex-row p-1"
                                    }`}
                                    onClick={() => openUserStoryModal(story)}
                                  >
                                    <div
                                      className={`flex items-center gap-2 ${
                                        isMobile ? "w-full" : ""
                                      }`}
                                    >
                                      <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                                        {story.id}
                                      </span>
                                      {story.estimation && (
                                        <span className="text-green-700 dark:text-green-300 text-xs">
                                          {story.estimation} j
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`text-gray-800 dark:text-gray-100 ${
                                        isMobile ? "text-sm font-medium" : ""
                                      }`}
                                    >
                                      {story.title}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                      (
                                      {format(
                                        story.estimatedStartDate!,
                                        "dd/MM"
                                      )}{" "}
                                      -{" "}
                                      {format(story.estimatedEndDate!, "dd/MM")}
                                      )
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Ajouter des cases vides si trimestre incomplet (desktop seulement) */}
                      {!isMobile &&
                        Array.from({ length: 3 - trim.months.length }).map(
                          (_, i) => (
                            <div
                              key={"empty-" + i}
                              className="h-64 w-full mb-1"
                            ></div>
                          )
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      {/* Vue année : hors de la grille semaine */}
      {view === "année" &&
        (() => {
          // Déterminer les bornes du projet
          let minDate: Date | null = null,
            maxDate: Date | null = null;
          userStories.forEach((story) => {
            if (story.estimatedStartDate instanceof Date) {
              if (!minDate || story.estimatedStartDate < minDate)
                minDate = story.estimatedStartDate;
              if (!maxDate || story.estimatedStartDate > maxDate)
                maxDate = story.estimatedStartDate;
            }
            if (story.estimatedEndDate instanceof Date) {
              if (!minDate || story.estimatedEndDate < minDate)
                minDate = story.estimatedEndDate;
              if (!maxDate || story.estimatedEndDate > maxDate)
                maxDate = story.estimatedEndDate;
            }
          });
          if (!minDate || !maxDate) return null;
          const minYear = (minDate as Date).getFullYear();
          const maxYear = (maxDate as Date).getFullYear();
          const year = currentDate.getFullYear();
          // Navigation bornée
          const isPrevDisabled = year <= minYear;
          const isNextDisabled = year >= maxYear;
          // Générer la grille annuelle (mois en colonnes, semaines en lignes)
          let startMonthIdx = 0,
            endMonthIdx = 11;
          if (year === minYear) startMonthIdx = (minDate as Date).getMonth();
          if (year === maxYear) endMonthIdx = (maxDate as Date).getMonth();
          const months = Array.from(
            { length: endMonthIdx - startMonthIdx + 1 },
            (_, m) => new Date(year, startMonthIdx + m, 1)
          );
          // Trouver le nombre max de semaines sur l'année (pour la grille)
          let maxWeeks = 0;
          const monthWeeks: Date[][][] = months.map((monthStart) => {
            const start = startOfWeek(startOfMonth(monthStart), {
              weekStartsOn: 1,
            });
            const end = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start, end });
            const weeks: Date[][] = [];
            for (let i = 0; i < days.length; i += 7) {
              weeks.push(days.slice(i, i + 7));
            }
            if (weeks.length > maxWeeks) maxWeeks = weeks.length;
            return weeks;
          });
          // Récupérer tous les sprints de l'année affichée
          const sprintsOfYear = sprints.filter(
            (sprint) =>
              sprint.start.getFullYear() === year ||
              sprint.end.getFullYear() === year
          );
          return (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setCurrentDate(subYears(currentDate, 1))}
                  disabled={isPrevDisabled}
                  className={`px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                    isPrevDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  &lt;
                </button>
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                  {year}
                </span>
                <button
                  onClick={() => setCurrentDate(addYears(currentDate, 1))}
                  disabled={isNextDisabled}
                  className={`px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                    isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  &gt;
                </button>
              </div>
              <div className="overflow-x-auto">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${months.length}, minmax(80px,1fr))`,
                  }}
                >
                  {/* En-tête mois */}
                  {months.map((month, mIdx) => (
                    <div
                      key={mIdx}
                      className="text-center font-bold text-xs text-gray-700 dark:text-gray-200 py-1 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10"
                    >
                      {format(month, "MMMM", { locale: fr })}
                    </div>
                  ))}
                  {/* Grille semaines */}
                  {Array.from({ length: maxWeeks }).map((_, weekIdx) =>
                    months.map((month, mIdx) => {
                      const week = monthWeeks[mIdx][weekIdx];
                      return (
                        <div
                          key={mIdx + "-" + weekIdx}
                          className="min-h-[32px] flex flex-row justify-center items-center gap-[2px] py-1"
                        >
                          {Array.from({ length: 7 }).map((_, dIdx) => {
                            const day = week && week[dIdx];
                            if (!day)
                              return <div className="w-4 h-4" key={dIdx}></div>;
                            const isInMonth =
                              day.getMonth() === month.getMonth();
                            const us = getUSForDay(day);
                            const holiday = isHoliday(day);
                            const weekend = isWeekend(day);
                            let bg = "";
                            if (holiday) bg = "bg-red-300";
                            else if (weekend) bg = "bg-gray-300";
                            else if (isWorkday(day)) bg = "bg-green-400";
                            else bg = "bg-gray-100";
                            // Dans le map des jours (dIdx):
                            const sprintOfDay = sprints.find(
                              (sprint) =>
                                day >=
                                  new Date(
                                    sprint.start.getFullYear(),
                                    sprint.start.getMonth(),
                                    sprint.start.getDate()
                                  ) &&
                                day <=
                                  new Date(
                                    sprint.end.getFullYear(),
                                    sprint.end.getMonth(),
                                    sprint.end.getDate()
                                  )
                            );
                            return (
                              <div
                                key={dIdx}
                                className={`w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-150 cursor-pointer relative
                                ${bg} ${!isInMonth ? "opacity-30" : ""}
                                ${
                                  us.some((story) => story.id === hoveredUSId)
                                    ? "ring-2 ring-indigo-500 z-10"
                                    : ""
                                } cursor-pointer"`}
                                title={
                                  holiday
                                    ? (() => {
                                        const d = new Date(
                                          day.getFullYear(),
                                          day.getMonth(),
                                          day.getDate()
                                        );
                                        const found = settings.holidays.find(
                                          (holiday) => {
                                            if (
                                              !holiday.startDate ||
                                              !holiday.endDate
                                            )
                                              return false;
                                            const start =
                                              holiday.startDate instanceof Date
                                                ? new Date(
                                                    holiday.startDate.getFullYear(),
                                                    holiday.startDate.getMonth(),
                                                    holiday.startDate.getDate()
                                                  )
                                                : new Date(holiday.startDate);
                                            const end =
                                              holiday.endDate instanceof Date
                                                ? new Date(
                                                    holiday.endDate.getFullYear(),
                                                    holiday.endDate.getMonth(),
                                                    holiday.endDate.getDate()
                                                  )
                                                : new Date(holiday.endDate);
                                            return d >= start && d <= end;
                                          }
                                        );
                                        return found && found.title
                                          ? found.title
                                          : "Congé";
                                      })()
                                    : us.length > 0
                                    ? us
                                        .map(
                                          (story) =>
                                            `${story.id}: ${story.title}`
                                        )
                                        .join("\n")
                                    : isWorkday(day)
                                    ? "Jour ouvré"
                                    : weekend
                                    ? "Week-end"
                                    : ""
                                }
                                onMouseEnter={() => {
                                  if (us.length === 1) setHoveredUSId(us[0].id);
                                }}
                                onMouseLeave={() => setHoveredUSId(null)}
                              >
                                {/* Affichage US sur jours ouvrés */}
                                {us.length > 0 &&
                                  isWorkday(day) &&
                                  !holiday && (
                                    <span
                                      className="text-[11px] text-indigo-800 font-bold leading-none cursor-pointer hover:text-indigo-600 transition-colors"
                                      title={us
                                        .map(
                                          (story) =>
                                            `${story.id}: ${story.title}`
                                        )
                                        .join("\n")}
                                      onMouseEnter={() => {
                                        if (us.length === 1)
                                          setHoveredUSId(us[0].id);
                                      }}
                                      onMouseLeave={() => setHoveredUSId(null)}
                                      onClick={() => {
                                        if (us.length === 1) {
                                          openUserStoryModal(us[0]);
                                        }
                                      }}
                                    >
                                      {sprintOfDay?.num}
                                    </span>
                                  )}
                                {/* Affichage pastille congé */}
                                {holiday && (
                                  <span className="text-[7px] text-red-700 font-bold">
                                    ×
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {/* Statistiques annuelles */}
              <div className="flex flex-wrap gap-4 items-center mb-2 px-2 py-1 bg-gray-50 dark:bg-gray-900/60 rounded shadow-sm border border-gray-200 dark:border-gray-700 text-xs">
                <span>
                  <b>
                    {
                      userStories.filter(
                        (story) =>
                          story.estimatedStartDate &&
                          story.estimatedEndDate &&
                          (story.estimatedStartDate.getFullYear() === year ||
                            story.estimatedEndDate.getFullYear() === year)
                      ).length
                    }
                  </b>{" "}
                  US
                </span>
                <span>
                  <b>{sprintsOfYear.length}</b> sprints
                </span>
                <span>
                  Moy.{" "}
                  <b>
                    {sprintsOfYear.length
                      ? (
                          sprintsOfYear.reduce(
                            (acc, s) => acc + s.us.length,
                            0
                          ) / sprintsOfYear.length
                        ).toFixed(1)
                      : "0"}
                  </b>{" "}
                  US/sprint
                </span>
                <span>
                  <b>
                    {(() => {
                      // Calculer jours ouvrés, week-ends, congés sur l'année
                      let workdays = 0,
                        weekends = 0,
                        holidays = 0;
                      months.forEach((month) => {
                        const start = startOfMonth(month);
                        const end = endOfMonth(month);
                        eachDayOfInterval({ start, end }).forEach((day) => {
                          if (isHoliday(day)) holidays++;
                          else if (isWeekend(day)) weekends++;
                          else if (isWorkday(day)) workdays++;
                        });
                      });
                      return workdays;
                    })()}
                  </b>{" "}
                  ouvrés
                </span>
                <span>
                  <b>
                    {(() => {
                      let workdays = 0,
                        weekends = 0,
                        holidays = 0;
                      months.forEach((month) => {
                        const start = startOfMonth(month);
                        const end = endOfMonth(month);
                        eachDayOfInterval({ start, end }).forEach((day) => {
                          if (isHoliday(day)) holidays++;
                          else if (isWeekend(day)) weekends++;
                          else if (isWorkday(day)) workdays++;
                        });
                      });
                      return weekends;
                    })()}
                  </b>{" "}
                  week-ends
                </span>
                <span>
                  <b>
                    {(() => {
                      let workdays = 0,
                        weekends = 0,
                        holidays = 0;
                      months.forEach((month) => {
                        const start = startOfMonth(month);
                        const end = endOfMonth(month);
                        eachDayOfInterval({ start, end }).forEach((day) => {
                          if (isHoliday(day)) holidays++;
                          else if (isWeekend(day)) weekends++;
                          else if (isWorkday(day)) workdays++;
                        });
                      });
                      return holidays;
                    })()}
                  </b>{" "}
                  congés
                </span>
              </div>{" "}
              {/* Liste des US par sprint, version condensée et scrollable */}
              <div
                className={`mt-6 overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${
                  isMobile
                    ? sprintLength === 3
                      ? "max-h-80"
                      : "max-h-64" // Plus d'espace pour les sprints longs sur mobile
                    : sprintLength === 3
                    ? "max-h-72"
                    : "max-h-56" // Augmentation proportionnelle sur desktop
                }`}
              >
                {sprintsOfYear.length === 0 && (
                  <div className="text-gray-500">
                    Aucun sprint pour cette année.
                  </div>
                )}
                <table className="w-full text-xs">
                  <tbody>
                    {sprintsOfYear.flatMap((sprint) =>
                      sprint.us.length === 0
                        ? [
                            <tr key={sprint.num}>
                              <td
                                className="px-2 py-1 text-indigo-700 dark:text-indigo-300 font-semibold"
                                title={`Sprint ${sprint.num}\nDu ${format(
                                  sprint.start,
                                  "dd/MM/yyyy"
                                )} au ${format(sprint.end, "dd/MM/yyyy")}`}
                              >
                                Sprint {sprint.num}
                              </td>
                              <td colSpan={4} className="text-gray-400 italic">
                                Aucune US
                              </td>
                            </tr>,
                          ]
                        : [
                            <tr
                              key={sprint.num + "-head"}
                              className="bg-gray-50 dark:bg-gray-900/40"
                            >
                              <td
                                className="px-2 py-1 text-indigo-700 dark:text-indigo-300 font-semibold"
                                colSpan={5}
                                title={`Sprint ${sprint.num}\nDu ${format(
                                  sprint.start,
                                  "dd/MM/yyyy"
                                )} au ${format(sprint.end, "dd/MM/yyyy")}\n${
                                  sprint.us.length
                                } US\nEstimation totale: ${sprint.us.reduce(
                                  (acc, us) => acc + (us.estimation || 0),
                                  0
                                )} j`}
                              >
                                Sprint {sprint.num}{" "}
                                <span className="text-xs text-gray-500 ml-2">
                                  ({format(sprint.start, "dd/MM")} -{" "}
                                  {format(sprint.end, "dd/MM")},{" "}
                                  {sprint.us.length} US,{" "}
                                  {sprint.us.reduce(
                                    (acc, us) => acc + (us.estimation || 0),
                                    0
                                  )}{" "}
                                  j)
                                </span>
                              </td>
                            </tr>,
                            ...sprint.us.map((story) => (
                              <tr
                                key={sprint.num + "-" + story.id}
                                ref={(el) => {
                                  usRowRefs.current[story.id] = el;
                                }}
                                className={`cursor-pointer transition-all duration-150 ${
                                  hoveredUSId === story.id
                                    ? "bg-indigo-100 dark:bg-indigo-900/60 ring-2 ring-indigo-500"
                                    : ""
                                }`}
                                onMouseEnter={() => setHoveredUSId(story.id)}
                                onMouseLeave={() => setHoveredUSId(null)}
                                onClick={() => openUserStoryModal(story)}
                                title={`US ${story.id}\n${story.title}\nEpic: ${
                                  story.epic || "-"
                                }\nRôle: ${story.userRole || "-"}\nPriorité: ${
                                  story.priority || "-"
                                }\nEstimation: ${
                                  story.estimation
                                    ? story.estimation + " j"
                                    : "—"
                                }\nDépendance: ${
                                  story.dependency || "-"
                                }\nJustification: ${
                                  story.justification || "-"
                                }\nCritères: ${
                                  story.acceptanceCriteria &&
                                  story.acceptanceCriteria.length
                                    ? story.acceptanceCriteria.join("; ")
                                    : "-"
                                }`}
                              >
                                <td className="px-2 py-1 text-indigo-700 dark:text-indigo-300 font-semibold">
                                  {story.id}
                                </td>
                                <td className="px-2 py-1 text-gray-800 dark:text-gray-100">
                                  {story.title}
                                </td>
                                <td className="px-2 py-1 text-gray-500 dark:text-gray-400">
                                  {format(story.estimatedStartDate!, "dd/MM")} -{" "}
                                  {format(story.estimatedEndDate!, "dd/MM")}
                                </td>
                                <td className="px-2 py-1 text-green-700 dark:text-green-300">
                                  {story.estimation
                                    ? `${story.estimation} j`
                                    : ""}
                                </td>
                                <td className="px-2 py-1 text-gray-700 dark:text-gray-200">
                                  {story.priority}
                                </td>
                                <td className="px-2 py-1 text-gray-500 dark:text-gray-300">
                                  {story.epic}
                                </td>
                                <td className="px-2 py-1 text-gray-500 dark:text-gray-300">
                                  {story.userRole}
                                </td>
                                <td className="px-2 py-1 text-gray-400">
                                  {story.dependency}
                                </td>
                              </tr>
                            )),
                          ]
                    )}
                  </tbody>
                </table>
              </div>
              {/* Légende */}
              <div className="flex gap-4 mt-4 text-xs">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 rounded bg-green-400 border border-green-600 inline-block mr-1"></span>
                  Jour ouvré
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 rounded bg-gray-300 border border-gray-500 inline-block mr-1"></span>
                  Week-end
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 rounded bg-red-300 border border-red-500 inline-block mr-1"></span>
                  Congé
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 rounded bg-indigo-800 border border-indigo-900 inline-block mr-1"></span>
                  US présente
                </span>
              </div>
            </div>
          );
        })()}
      {/* Légende */}
      {view === "semaine" && (
        <div className="flex gap-4 mt-4 text-xs">
          <span className="inline-flex items-center">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block mr-1"></span>
            Jour ouvré
          </span>
          <span className="inline-flex items-center">
            <span className="w-3 h-3 rounded bg-gray-200 border border-gray-400 inline-block mr-1"></span>
            Week-end
          </span>
          <span className="inline-flex items-center">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-400 inline-block mr-1"></span>
            Congé
          </span>{" "}
        </div>
      )}
      {/* Modale de sélection multiple US */}
      {multipleUSModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Arrière-plan */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setMultipleUSModal({ isOpen: false, stories: [], date: null })
            }
          />

          {/* Contenu de la modale */}
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl mx-4 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                User Stories du{" "}
                {multipleUSModal.date
                  ? format(multipleUSModal.date, "dd/MM/yyyy", { locale: fr })
                  : ""}
              </h3>

              <div className="space-y-3">
                {multipleUSModal.stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors border border-gray-200/50 dark:border-gray-700/50"
                    onClick={() => {
                      openUserStoryModal(story);
                      setMultipleUSModal({
                        isOpen: false,
                        stories: [],
                        date: null,
                      });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {story.id}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium flex-1">
                        {story.title}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Epic: {story.epic} • {story.estimation} jours
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() =>
                  setMultipleUSModal({ isOpen: false, stories: [], date: null })
                }
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Modale détails User Story */}
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

export default SprintCalendar;
