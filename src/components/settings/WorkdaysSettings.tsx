import React from 'react';
import { useAppStore } from '../../store/appStore';
import { WorkdaySettings } from '../../types/Settings';

const WorkdaysSettings: React.FC = () => {
  const { settings, updateWorkdays } = useAppStore();
  
  const handleWorkdayChange = async (day: keyof WorkdaySettings) => {
    const updatedWorkdays = {
      ...settings.workdays,
      [day]: !settings.workdays[day]
    };
    await updateWorkdays(updatedWorkdays);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Jours ouvrés</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {Object.entries(settings.workdays).map(([day, isWorkday]) => {
          const dayLabel = {
            monday: 'Lun',
            tuesday: 'Mar',
            wednesday: 'Mer',
            thursday: 'Jeu',
            friday: 'Ven',
            saturday: 'Sam',
            sunday: 'Dim'
          }[day as keyof WorkdaySettings];
          
          return (
            <div key={day} className="flex flex-col items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300 mb-1">{dayLabel}</span>
              <button
                type="button"
                onClick={() => handleWorkdayChange(day as keyof WorkdaySettings)}
                className={`w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isWorkday 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                aria-pressed={isWorkday}
              >
                {isWorkday ? '✓' : ''}
              </button>
            </div>
          );
        })}
      </div>
      
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Sélectionnez les jours de la semaine qui sont considérés comme jours ouvrés pour le calcul des dates.
      </p>
    </div>
  );
};

export default WorkdaysSettings;
