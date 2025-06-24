import { format, getMonth, getYear } from "date-fns";
import { fr } from "date-fns/locale";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { BarChart3, Download } from "lucide-react";
import React, { useMemo } from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import { useAppStore } from "../../store/appStore";

const SummaryTable: React.FC = () => {
  const { userStories } = useAppStore();
  const isMobile = useIsMobile();

  // Générer le tableau récapitulatif par mois et par Epic
  const summaryData = useMemo(() => {
    if (userStories.length === 0) return null;
    // Récupérer tous les epics uniques
    const epics = [...new Set(userStories.map((story) => story.epic))];
    // Récupérer tous les mois uniques
    const months: { month: number; year: number }[] = [];
    userStories.forEach((story) => {
      if (story.estimatedStartDate && story.estimatedEndDate) {
        // Mois de début
        const startMonth = getMonth(story.estimatedStartDate);
        const startYear = getYear(story.estimatedStartDate);
        // Mois de fin
        const endMonth = getMonth(story.estimatedEndDate);
        const endYear = getYear(story.estimatedEndDate);
        // Ajouter tous les mois entre le début et la fin
        let currentMonth = startMonth;
        let currentYear = startYear;
        while (
          currentYear < endYear ||
          (currentYear === endYear && currentMonth <= endMonth)
        ) {
          const existingMonth = months.find(
            (m) => m.month === currentMonth && m.year === currentYear
          );
          if (!existingMonth) {
            months.push({ month: currentMonth, year: currentYear });
          }
          // Passer au mois suivant
          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
        }
      }
    });
    // Trier les mois chronologiquement
    months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    }); // Calculer les jours par mois et par epic
    const data: Record<string, Record<string, number>> = {};
    const userStoriesByEpicAndMonth: Record<
      string,
      Record<string, string[]>
    > = {};

    epics.forEach((epic) => {
      data[epic] = {};
      userStoriesByEpicAndMonth[epic] = {};
      months.forEach(({ month, year }) => {
        const monthKey = `${year}-${month}`;
        data[epic][monthKey] = 0;
        userStoriesByEpicAndMonth[epic][monthKey] = [];
      });
    });

    // Ajouter une ligne pour le total
    data["Total"] = {};
    userStoriesByEpicAndMonth["Total"] = {};
    months.forEach(({ month, year }) => {
      const monthKey = `${year}-${month}`;
      data["Total"][monthKey] = 0;
      userStoriesByEpicAndMonth["Total"][monthKey] = [];
    });

    // Remplir les données
    userStories.forEach((story) => {
      if (story.estimatedStartDate && story.estimatedEndDate) {
        const start = story.estimatedStartDate;
        const end = story.estimatedEndDate;
        let current = new Date(start);
        const monthsForThisStory = new Set<string>(); // Pour éviter d'ajouter plusieurs fois la même US dans le même mois

        while (current <= end) {
          if (useAppStore.getState().isWorkday(current)) {
            const year = current.getFullYear();
            const month = current.getMonth();
            const monthKey = `${year}-${month}`;

            if (data[story.epic] && data[story.epic][monthKey] !== undefined) {
              data[story.epic][monthKey] += 1;
              data["Total"][monthKey] += 1;

              // Ajouter le titre de l'US une seule fois par mois
              if (!monthsForThisStory.has(monthKey)) {
                userStoriesByEpicAndMonth[story.epic][monthKey].push(
                  story.title
                );
                userStoriesByEpicAndMonth["Total"][monthKey].push(story.title);
                monthsForThisStory.add(monthKey);
              }
            }
          }
          current = new Date(current);
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return { epics, months, data, userStoriesByEpicAndMonth };
  }, [userStories]);

  // Formater le mois
  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    return format(date, "MMM yyyy", { locale: fr });
  };

  // Fonction d'export Excel
  const handleExportExcel = async () => {
    if (!summaryData) return;
    const { epics, months, data } = summaryData;
    const headers = [
      "Epic",
      ...months.map(({ month, year }) => formatMonth(month, year)),
      "Total",
    ];
    const rows = epics.map((epic) => {
      const epicTotal = Object.values(data[epic]).reduce(
        (sum, days) => sum + days,
        0
      );
      return [
        epic,
        ...months.map(({ month, year }) => {
          const monthKey = `${year}-${month}`;
          const days = data[epic][monthKey] || 0;
          return days > 0 ? days : "";
        }),
        epicTotal,
      ];
    });
    const totalRow = [
      "Total",
      ...months.map(({ month, year }) => {
        const monthKey = `${year}-${month}`;
        const days = data["Total"][monthKey] || 0;
        return days > 0 ? days : "";
      }),
      Object.values(data["Total"]).reduce((sum, days) => sum + days, 0),
    ];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Synthèse");
    worksheet.addRow(headers);
    rows.forEach((row) => worksheet.addRow(row));
    worksheet.addRow(totalRow);
    worksheet.columns = headers.map((h, i) => ({
      header: h,
      key: String(i),
      width: 16,
    }));
    worksheet.getRow(1).font = { bold: true };
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) row.height = 22;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `tableau-synthetique-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, filename);
  };
  if (!summaryData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tableau synthétique
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune donnée disponible. Ajoutez des User Stories pour générer le
          tableau synthétique.
        </p>
      </div>
    );
  }

  const { epics, months, data, userStoriesByEpicAndMonth } = summaryData;

  // Affichage mobile optimisé avec cartes
  if (isMobile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Synthèse
              </h3>
            </div>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Résumé global */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
              Total global
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {Object.values(data["Total"]).reduce(
                (sum, days) => sum + days,
                0
              )}{" "}
              jours
            </div>
          </div>

          {/* Cartes pour chaque Epic */}
          <div className="space-y-3">
            {epics.map((epic) => {
              const epicTotal = Object.values(data[epic]).reduce(
                (sum, days) => sum + days,
                0
              );
              return (
                <div
                  key={epic}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {epic}
                    </h4>
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-xs font-medium">
                      {epicTotal} j
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {months.map(({ month, year }) => {
                      const monthKey = `${year}-${month}`;
                      const days = data[epic][monthKey] || 0;
                      const userStoriesForMonth =
                        userStoriesByEpicAndMonth[epic][monthKey] || [];
                      if (days === 0) return null;

                      return (
                        <div
                          key={monthKey}
                          className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {formatMonth(month, year)}
                          </div>
                          {/* Titres des User Stories en très petit */}
                          {userStoriesForMonth.length > 0 && (
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 leading-tight">
                              {userStoriesForMonth
                                .slice(0, 2)
                                .map((title, index) => (
                                  <div key={index} className="truncate">
                                    {title.length > 20
                                      ? title.substring(0, 20) + "..."
                                      : title}
                                  </div>
                                ))}
                              {userStoriesForMonth.length > 2 && (
                                <div className="text-gray-300 dark:text-gray-600">
                                  +{userStoriesForMonth.length - 2} autre
                                  {userStoriesForMonth.length > 3 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {days} j
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Affichage desktop avec tableau
  // Affichage desktop avec tableau
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Tableau synthétique
            </h3>
          </div>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download className="w-4 h-4" />
            Exporter Excel
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/50 px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700"
                >
                  Epic
                </th>
                {months.map(({ month, year }) => (
                  <th
                    key={`${year}-${month}`}
                    scope="col"
                    className="px-3 md:px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {formatMonth(month, year)}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-700/50 border-l border-gray-200 dark:border-gray-700"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {epics.map((epic) => {
                const epicTotal = Object.values(data[epic]).reduce(
                  (sum, days) => sum + days,
                  0
                );
                return (
                  <tr
                    key={epic}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 md:px-6 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 max-w-[200px] truncate">
                      <div className="truncate" title={epic}>
                        {epic}
                      </div>
                    </td>
                    {months.map(({ month, year }) => {
                      const monthKey = `${year}-${month}`;
                      const days = data[epic][monthKey] || 0;
                      return (
                        <td
                          key={monthKey}
                          className="px-3 md:px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
                        >
                          {days > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
                              {days} j
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 md:px-6 py-3 text-center text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 border-l border-gray-200 dark:border-gray-700">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200">
                        {epicTotal} j
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                <td className="sticky left-0 z-10 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 px-4 md:px-6 py-3 text-sm font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                  Total
                </td>
                {months.map(({ month, year }) => {
                  const monthKey = `${year}-${month}`;
                  const days = data["Total"][monthKey] || 0;
                  return (
                    <td
                      key={monthKey}
                      className="px-3 md:px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap"
                    >
                      {days > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100">
                          {days} j
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          -
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 md:px-6 py-3 text-center text-sm font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/50 dark:to-indigo-800/50 border-l border-gray-200 dark:border-gray-700">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100">
                    {Object.values(data["Total"]).reduce(
                      (sum, days) => sum + days,
                      0
                    )}{" "}
                    j
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note explicative */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note :</strong> Les valeurs représentent le nombre de jours
            ouvrables alloués à chaque Epic par mois.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryTable;
