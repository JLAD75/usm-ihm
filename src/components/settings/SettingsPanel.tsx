import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';
import { useState } from 'react';
import WorkdaysSettings from './WorkdaysSettings';
import HolidaysSettings from './HolidaysSettings';
import ThemeSettings from './ThemeSettings';
import ImportExportPanel from './ImportExportPanel';
import { Dialog } from '@headlessui/react';
import ShareProjectDialog from './ShareProjectDialog';
import OpenAIApiKeySettings from './OpenAIApiKeySettings';

const SettingsPanel: React.FC<{ setActiveTab?: (tab: 'userStories' | 'reports' | 'settings') => void }> = ({ setActiveTab }) => {
  const { settings, updateProjectStartDate, projects, projectId, renameProject, deleteProject, setProjectId } = useAppStore();
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const currentProject = projects.find(p => p.id === projectId);
  const projectNames = projects.map(p => p.name.toLowerCase());

  // Formater la date pour l'input
  const formatDateForInput = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Gérer le changement de date de démarrage
  const handleStartDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    await updateProjectStartDate(newDate);
  };

  const handleRename = async () => {
    if (!renameValue.trim()) {
      setRenameError('Le nom ne peut pas être vide.');
      return;
    }
    if (projectNames.includes(renameValue.trim().toLowerCase()) && renameValue.trim() !== currentProject?.name) {
      setRenameError('Ce nom existe déjà.');
      return;
    }
    if (projectId && renameValue.trim()) {
      await renameProject(projectId, renameValue.trim());
      setShowRename(false);
      setRenameError('');
    }
  };
  const handleDelete = async () => {
    if (projectId) {
      await deleteProject(projectId);
      setProjectId(projects.length > 0 ? projects[0].id : null);
      setShowDelete(false);
      if (setActiveTab) setActiveTab('userStories');
    }
  };
  
  return (
    <div className="space-y-6" style={{ maxHeight: '84vh', minHeight: '200px', overflowY: 'auto' }}>
      {/* Date de démarrage du projet */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Date de démarrage du projet</h3>
        
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de début
          </label>
          <input
            type="date"
            value={formatDateForInput(settings.projectStartDate)}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Cette date sera utilisée comme point de départ pour le calcul des dates de début et de fin des User Stories.
        </p>
      </div>
      
      {/* Jours ouvrés */}
      <WorkdaysSettings />
      
      {/* Jours de congés */}
      <HolidaysSettings />
      
      {/* Thème */}
      <ThemeSettings />
      
      {/* Import / Export */}
      <ImportExportPanel onImportSuccess={() => setActiveTab && setActiveTab('userStories')} />
      
      {/* Gestion du projet courant */}
      {currentProject && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-2" >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">Projet courant :</span>
            <span className="text-gray-700 dark:text-gray-200">{currentProject.name}</span>
            <button
              onClick={() => { setShowRename(true); setRenameValue(currentProject.name); setRenameError(''); }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >Renommer</button>
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >Partager</button>
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
            >Supprimer</button>
          </div>
          <Dialog open={showRename} onClose={() => setShowRename(false)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={() => setShowRename(false)} />
            <div className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto z-10 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300">Renommer le projet</h3>
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">Ancien nom : <span className="font-semibold">{currentProject.name}</span></p>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
                value={renameValue}
                onChange={e => { setRenameValue(e.target.value); setRenameError(''); }}
                placeholder="Nouveau nom du projet"
                autoFocus
              />
              {renameError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{renameError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRename(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >Annuler</button>
                <button
                  onClick={async () => { await handleRename(); }}
                  className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  disabled={!renameValue.trim() || (projectNames.includes(renameValue.trim().toLowerCase()) && renameValue.trim() !== currentProject.name)}
                >Renommer</button>
              </div>
            </div>
          </Dialog>
          <Dialog open={showDelete} onClose={() => setShowDelete(false)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" aria-hidden="true" onClick={() => setShowDelete(false)} />
            <div className="relative rounded-2xl shadow-2xl w-full max-w-md mx-auto z-10 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-red-700 dark:text-red-300">Supprimer le projet</h3>
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">Voulez-vous vraiment supprimer le projet <span className="font-semibold">{currentProject.name}</span> ? Cette action est <span className="text-red-600 font-semibold">irréversible</span>.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDelete(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >Annuler</button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >Supprimer définitivement</button>
              </div>
            </div>
          </Dialog>
          {projectId && (
            <ShareProjectDialog projectId={projectId} open={showShare} onClose={() => setShowShare(false)} />
          )}
        </div>
      )}

      {/* Clé API OpenAI */}
      <OpenAIApiKeySettings />
    </div>
  );
};

export default SettingsPanel;
