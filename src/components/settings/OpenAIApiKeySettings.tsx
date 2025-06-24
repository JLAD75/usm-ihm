import { useState } from 'react';

const OpenAIApiKeySettings: React.FC = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setSaved(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Clé API OpenAI</h3>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Saisissez votre clé API OpenAI (stockée localement)
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="sk-..."
        autoComplete="off"
      />
      <button
        onClick={handleSave}
        className="mt-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        disabled={!apiKey.trim()}
      >
        Enregistrer
      </button>
      {saved && <p className="mt-2 text-green-600 dark:text-green-400 text-sm">Clé enregistrée localement !</p>}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">La clé n'est jamais envoyée au serveur, elle reste dans votre navigateur.</p>
    </div>
  );
};

export default OpenAIApiKeySettings;
