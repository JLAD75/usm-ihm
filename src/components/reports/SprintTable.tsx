import { format } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Calendar, Clock, Download } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { useAppStore } from "../../store/appStore";

const SprintTable: React.FC = () => {
  const { userStories } = useAppStore();
  const [sprintLength, setSprintLength] = useState(2); // en semaines
  const { isMobile } = useDeviceType();

  // Générer la liste des sprints couvrant la période des US
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
    const maxDateObj = new Date(maxDate); // Ensure maxDate is a Date object
    while (sprintStart <= maxDateObj) {
      const sprintEnd = new Date(sprintStart);
      sprintEnd.setDate(sprintEnd.getDate() + sprintLength * 7 - 1);
      sprints.push({
        num: sprintNum,
        start: new Date(sprintStart),
        end: new Date(sprintEnd),
      });
      sprintStart = new Date(sprintEnd);
      sprintStart.setDate(sprintStart.getDate() + 1);
      sprintNum++;
    }
    return sprints;
  }, [userStories, sprintLength]);

  // Phasage intelligent des US dans les sprints
  const sprintRows = useMemo(() => {
    if (userStories.length === 0 || sprints.length === 0) return [];
    const sprintList = sprints.map((sprint) => ({
      ...sprint,
      workdays: (() => {
        let count = 0;
        for (
          let d = new Date(sprint.start);
          d <= sprint.end;
          d.setDate(d.getDate() + 1)
        ) {
          if (useAppStore.getState().isWorkday(d)) count++;
        }
        return count;
      })(),
      us: [] as Array<{
        story: (typeof userStories)[0];
        part: number;
        totalParts: number;
        estimation: number;
      }>,
      used: 0,
    }));
    const sortedStories = [...userStories]
      .filter((s) => s.estimatedStartDate && s.estimatedEndDate && s.estimation)
      .sort(
        (a, b) =>
          a.estimatedStartDate!.getTime() - b.estimatedStartDate!.getTime()
      );
    sortedStories.forEach((story) => {
      let estimationLeft = story.estimation!;
      for (let i = 0; i < sprintList.length && estimationLeft > 0; i++) {
        const sprint = sprintList[i];
        if (
          story.estimatedEndDate! < sprint.start ||
          story.estimatedStartDate! > sprint.end
        )
          continue;
        const available = sprint.workdays - sprint.used;
        if (available <= 0) continue;
        const toPlace = Math.min(estimationLeft, available);
        sprint.us.push({
          story,
          part: story.estimation! - estimationLeft + 1,
          totalParts: story.estimation!,
          estimation: toPlace,
        });
        sprint.used += toPlace;
        estimationLeft -= toPlace;
      }
    });
    // Filtrer les sprints vides (0 jours ouvrés ET 0 US planifiées)
    return sprintList
      .map((sprint) => {
        const usMap: Record<
          string,
          {
            story: (typeof userStories)[0];
            total: number;
            parts: Array<{ part: number; estimation: number }>;
          }
        > = {};
        sprint.us.forEach((u) => {
          if (!usMap[u.story.id])
            usMap[u.story.id] = {
              story: u.story,
              total: u.totalParts,
              parts: [],
            };
          usMap[u.story.id].parts.push({
            part: u.part,
            estimation: u.estimation,
          });
        });
        return {
          ...sprint,
          usCount: Object.keys(usMap).length,
          totalEstimation: sprint.us.reduce((sum, u) => sum + u.estimation, 0),
          usDetails: Object.values(usMap),
        };
      })
      .filter((sprint) => sprint.workdays > 0 || sprint.usCount > 0);
  }, [sprints, userStories]);

  // Fonction d'export Excel
  const exportToExcel = async () => {
    const data = sprintRows.map((sprint) => {
      // Détail des US sous forme de texte
      const usDetails = sprint.usDetails
        .map(({ story, parts }) => {
          if (parts.length === 1) {
            return `${story.id}: ${story.title} (${parts[0].estimation} j)`;
          } else {
            return `${story.id}: ${story.title} (${parts.reduce(
              (s, p) => s + p.estimation,
              0
            )} j / ${story.estimation} j) [fractionné]`;
          }
        })
        .join("\n");
      return {
        Sprint: `Sprint ${sprint.num}`,
        Début: format(sprint.start, "dd/MM/yyyy"),
        Fin: format(sprint.end, "dd/MM/yyyy"),
        "Jours ouvrés": sprint.workdays,
        "US planifiées": sprint.usCount,
        "Estimation totale": sprint.totalEstimation,
        "Détail des US": usDetails,
      };
    });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sprints");
    worksheet.columns = [
      { header: "Sprint", key: "Sprint", width: 12 },
      { header: "Début", key: "Début", width: 12 },
      { header: "Fin", key: "Fin", width: 12 },
      { header: "Jours ouvrés", key: "Jours ouvrés", width: 14 },
      { header: "US planifiées", key: "US planifiées", width: 16 },
      { header: "Estimation totale", key: "Estimation totale", width: 18 },
      { header: "Détail des US", key: "Détail des US", width: 60 },
    ];
    data.forEach((row) => worksheet.addRow(row));
    worksheet.getColumn("Détail des US").alignment = {
      wrapText: true,
      vertical: "top",
    };
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.font = { bold: true };
      }
      if (rowNumber > 1) {
        row.height = 32;
      }
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `sprints-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${
        isMobile ? "p-2" : "p-6 pt-0"
      }`}
    >
      {/* Header avec contrôles */}
      <div
        className={`flex items-center justify-between mb-4 ${
          isMobile ? "flex-col gap-3" : "flex-row"
        }`}
      >
        <div className={isMobile ? "order-2 w-full" : ""}>
          <h3
            className={`font-medium text-gray-900 dark:text-white ${
              isMobile ? "text-center text-base" : "text-lg"
            }`}
          >
            {isMobile ? `Sprints (${sprintLength} sem.)` : ""}
          </h3>
        </div>

        <div
          className={`flex items-center gap-2 ${
            isMobile ? "order-1 w-full justify-between" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <label
              htmlFor="sprint-length"
              className={`text-gray-700 dark:text-gray-300 ${
                isMobile ? "text-sm" : "text-sm"
              }`}
            >
              {isMobile ? "Durée:" : "Durée du sprint:"}
            </label>
            <select
              id="sprint-length"
              value={sprintLength}
              onChange={(e) => setSprintLength(Number(e.target.value))}
              className={`rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                isMobile ? "px-2 py-1 text-sm" : "px-2 py-1"
              }`}
            >
              <option value={2}>2 sem.</option>
              <option value={3}>3 sem.</option>
            </select>
          </div>

          <button
            onClick={exportToExcel}
            className={`rounded bg-green-600 hover:bg-green-700 text-white font-medium shadow transition-colors flex items-center gap-1 ${
              isMobile ? "px-2 py-1 text-sm" : "px-3 py-2 text-sm ml-4"
            }`}
            title="Exporter en Excel"
          >
            <Download className={isMobile ? "w-4 h-4" : "w-4 h-4"} />
            {isMobile ? "Export" : "Exporter Excel"}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {isMobile ? (
        // Vue mobile - Cartes
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {sprintRows.map((sprint) => (
            <div
              key={sprint.num}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
            >
              {/* Header du sprint */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Sprint {sprint.num}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-medium">
                    {sprint.totalEstimation}j
                  </span>
                  <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    {sprint.usCount} US
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(sprint.start, "dd/MM")} -{" "}
                  {format(sprint.end, "dd/MM/yy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {sprint.workdays} jours ouvrés
                </div>
              </div>

              {/* User Stories */}
              {sprint.usDetails.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Stories:
                  </div>
                  {sprint.usDetails.map(({ story, parts }) => (
                    <div
                      key={story.id}
                      className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-indigo-700 dark:text-indigo-300 text-xs">
                            {story.id}
                          </div>
                          <div className="text-gray-800 dark:text-gray-100 text-xs leading-tight mt-1">
                            {story.title.length > 40
                              ? story.title.substring(0, 40) + "..."
                              : story.title}
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
                          {parts.length === 1 ? (
                            <span>{parts[0].estimation}j</span>
                          ) : (
                            <>
                              <span>
                                {parts.reduce((s, p) => s + p.estimation, 0)}j /{" "}
                                {story.estimation}j
                              </span>
                              <span className="text-orange-500 dark:text-orange-300">
                                fractionné
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Vue desktop - Tableau
        <div
          className="overflow-x-auto custom-scrollbar"
          style={{ maxHeight: "67vh", minHeight: "200px", overflowY: "auto" }}
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead
              className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20"
              style={{ position: "sticky", top: 0, zIndex: 20 }}
            >
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  Sprint
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  Début
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  Fin
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  Jours ouvrés
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  US planifiées
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  Estimation totale
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  Détail des US
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {sprintRows.map((sprint) => (
                <tr key={sprint.num}>
                  <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">
                    Sprint {sprint.num}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {format(sprint.start, "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {format(sprint.end, "dd/MM/yyyy")}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {sprint.workdays}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {sprint.usCount}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {sprint.totalEstimation} j
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-200">
                    {sprint.usDetails.map(({ story, parts }) => (
                      <div
                        key={story.id}
                        className="mb-1 text-xs whitespace-nowrap"
                      >
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                          {story.id}
                        </span>
                        {": "}
                        <span className="text-gray-800 dark:text-gray-100">
                          {story.title}
                        </span>
                        {parts.length === 1 ? (
                          <span className="ml-1 text-gray-500 dark:text-gray-400">
                            ({parts[0].estimation} j)
                          </span>
                        ) : (
                          <span className="ml-1 text-gray-500 dark:text-gray-400">
                            ({parts.reduce((s, p) => s + p.estimation, 0)} j /{" "}
                            {story.estimation} j)
                          </span>
                        )}
                        {parts.length > 1 && (
                          <span className="ml-1 text-orange-500 dark:text-orange-300">
                            [fractionné]
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Styles pour les scrollbars */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>
    </div>
  );
};

export default SprintTable;
