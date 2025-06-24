import { useEffect, useRef, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  accessLevel: 'read' | 'write' | 'owner';
}

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelect: (projectId: string) => void;
  onCreate: (name: string) => void;
  projects: Project[];
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ selectedProjectId, onSelect, onCreate, projects }) => {
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreate(newProjectName.trim());
      setNewProjectName('');
      setShowModal(false);
    }
  };

  // Fermer la modale si clic en dehors
  useEffect(() => {
    if (!showModal) return;
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setNewProjectName('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  // Fermer la modale sur Escape
  useEffect(() => {
    if (!showModal) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowModal(false);
        setNewProjectName('');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center relative"
          aria-label="Créer un nouveau projet"
          title="Créer un nouveau projet"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
        <select
          value={selectedProjectId || ''}
          onChange={e => onSelect(e.target.value)}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[250px]"
        >
          <option value="" disabled>Choisir un projet...</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div
            ref={modalRef}
            tabIndex={-1}
            className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg flex flex-col gap-4 min-w-[300px] focus:outline-none"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau projet</h2>
            <input
              type="text"
              placeholder="Nom du projet"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCreate}
                className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={!newProjectName.trim()}
              >Créer</button>
              <button
                onClick={() => { setShowModal(false); setNewProjectName(''); }}
                className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
              >Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
// ProjectSelector reste inchangé, il est déjà prêt pour le multi-projet et l'usage avec le store.
// Rien à modifier ici pour l'instant.
