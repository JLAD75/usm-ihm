import React from 'react';
import { useAppStore } from '../../store/appStore';

const ThemeSettings: React.FC = () => {
  const { theme, updateTheme } = useAppStore();
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateTheme(theme);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thème</h3>
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <input
            type="radio"
            id="theme-light"
            name="theme"
            checked={theme === 'light'}
            onChange={() => handleThemeChange('light')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="theme-light" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Clair
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="theme-dark"
            name="theme"
            checked={theme === 'dark'}
            onChange={() => handleThemeChange('dark')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="theme-dark" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Sombre
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="radio"
            id="theme-system"
            name="theme"
            checked={theme === 'system'}
            onChange={() => handleThemeChange('system')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="theme-system" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Système (utilise les préférences de votre appareil)
          </label>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
