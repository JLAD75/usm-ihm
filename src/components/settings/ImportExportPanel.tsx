import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAppStore } from '../../store/appStore';

const ImportExportPanel: React.FC<{ onImportSuccess?: () => void }> = ({ onImportSuccess }) => {
  const { exportData, importData, resetData } = useAppStore();
  const [importError, setImportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);
  const [keepSettings, setKeepSettings] = useState<boolean>(true);
  const [showProjectNameDialog, setShowProjectNameDialog] = useState(false);
  const [pendingJson, setPendingJson] = useState<string | null>(null);
  const [projectNameInput, setProjectNameInput] = useState('');
  
  // Référence pour reset le champ fichier après import
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Exporter les données
  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-stories-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      setImportError('Erreur lors de l\'export.');
      console.error('Erreur lors de l\'export:', error);
    }
  };
  
  // Importer les données
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string;
        let parsed: any;
        try {
          parsed = JSON.parse(jsonData);
        } catch {
          setImportError('Le fichier n\'est pas un JSON valide.');
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        if (!parsed.name || typeof parsed.name !== 'string' || parsed.name.trim() === '') {
          setPendingJson(jsonData);
          setShowProjectNameDialog(true);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        await importData(jsonData);
        if (onImportSuccess) onImportSuccess();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        setImportError('Le fichier importé n\'est pas valide ou l\'import a échoué.');
        console.error('Erreur lors de l\'import:', error);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Validation du nom de projet manquant
  const handleProjectNameSubmit = async () => {
    if (!pendingJson) return;
    try {
      const parsed = JSON.parse(pendingJson);
      parsed.name = projectNameInput.trim();
      await importData(JSON.stringify(parsed));
      setShowProjectNameDialog(false);
      setPendingJson(null);
      setProjectNameInput('');
      if (onImportSuccess) onImportSuccess();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setImportError('Erreur lors de l\'import avec le nom de projet renseigné.');
      setShowProjectNameDialog(false);
      setPendingJson(null);
      setProjectNameInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // Réinitialiser les données
  const handleReset = () => {
    if (resetConfirm) {
      resetData(keepSettings);
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
    }
  };
  
  // Annuler la réinitialisation
  const handleCancelReset = () => {
    setResetConfirm(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Import / Export</h3>
      
      <div className="space-y-6">
        {/* Export */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Exporter les données</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Téléchargez toutes vos User Stories et paramètres au format JSON.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Exporter en JSON
          </button>
          {exportSuccess && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Export réussi !
            </p>
          )}
        </div>
        
        {/* Import */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Importer des données</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Importez des User Stories et paramètres depuis un fichier JSON.
          </p>
          <label className="inline-block px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
            Sélectionner un fichier
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          {importError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {importError}
            </p>
          )}
        </div>
        
        {/* Reset */}
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Réinitialiser les données</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Effacez toutes les User Stories et optionnellement les paramètres.
          </p>
          
          {!resetConfirm ? (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Réinitialiser
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keepSettings"
                  checked={keepSettings}
                  onChange={(e) => setKeepSettings(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="keepSettings" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Conserver les paramètres (jours ouvrés, congés, etc.)
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Confirmer la réinitialisation
                </button>
                <button
                  onClick={handleCancelReset}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Popup pour nom de projet manquant */}
      <Dialog open={showProjectNameDialog} onClose={() => { setShowProjectNameDialog(false); setPendingJson(null); setProjectNameInput(''); }} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={() => { setShowProjectNameDialog(false); setPendingJson(null); setProjectNameInput(''); }} />
        <div className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto z-10 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300">Nom du projet requis</h3>
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">Le fichier importé ne contient pas de nom de projet. Veuillez saisir un nom pour continuer l'import.</p>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            value={projectNameInput}
            onChange={e => setProjectNameInput(e.target.value)}
            placeholder="Nom du projet"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowProjectNameDialog(false); setPendingJson(null); setProjectNameInput(''); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={handleProjectNameSubmit}
              className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={!projectNameInput.trim()}
            >
              Importer
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ImportExportPanel;
