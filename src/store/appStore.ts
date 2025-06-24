import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { isWorkdayDate, recalculateUserStoryDates } from '../lib/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { UserStory } from '../types/UserStory';
import { Settings, WorkdaySettings, Holiday } from '../types/Settings';

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  accessLevel: 'read' | 'write' | 'owner';
}

// Définition des types pour le store
interface AppState {
  // Multi-projet
  projects: Project[];
  projectId: string | null;
  setProjectId: (id: string | null, persistApi?: boolean) => void;
  fetchSelectedProjectId: () => Promise<void>;
  saveSelectedProjectId: (id: string | null) => Promise<void>;
  fetchProjects: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;

  // User Stories & settings du projet courant
  userStories: UserStory[];
  settings: Settings;
  loadUserStories: (projectId: string) => Promise<void>;
  addUserStory: (userStory: Omit<UserStory, 'id' | 'order' | 'estimatedStartDate' | 'estimatedEndDate'>) => void;
  updateUserStory: (id: string, userStory: Partial<Omit<UserStory, 'id' | 'order'>>, reload?: boolean) => void;
  deleteUserStory: (id: string) => void;
  reorderUserStories: (sourceIndex: number, destinationIndex: number) => void;
  getNextId: () => string;
  getExistingEpics: () => string[];
  syncUserStories: () => Promise<void>;
  
  // Settings
  updateWorkdays: (workdays: WorkdaySettings) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, holiday: Omit<Holiday, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  updateProjectStartDate: (date: Date) => void;
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Import/Export
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  resetData: (keepSettings: boolean) => void;
  
  // Dates calculation
  recalculateDates: () => void;
  isWorkday: (date: Date) => boolean;
  updateSettings: (settings: Settings) => Promise<void>;

  // Indicateur de sauvegarde
  isSaving: boolean;
  saveError: string | null;
}

// Valeurs par défaut
const defaultWorkdays: WorkdaySettings = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

const defaultSettings: Settings = {
  projectStartDate: new Date(),
  workdays: defaultWorkdays,
  holidays: [],
};

// Création du store
export const useAppStore = create<AppState & {
  theme: 'light' | 'dark' | 'system',
  updateTheme: (theme: 'light' | 'dark' | 'system') => void,
  fetchUserTheme: () => Promise<void>,
  saveUserTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>,
}, [["zustand/persist", unknown]]>(
  persist(
    (set, get) => ({
      // Multi-projet
      projects: [],
      projectId: null,
      isSaving: false,
      saveError: null,
      setProjectId: (id, persistApi = true) => {
        set({ projectId: id });
        if (persistApi) get().saveSelectedProjectId(id);
      },
      async fetchSelectedProjectId() {
        const res = await fetch('/api/user/selected-project', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.selectedProjectId) set({ projectId: data.selectedProjectId });
        }
      },
      async saveSelectedProjectId(id) {
        await fetch('/api/user/selected-project', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ selectedProjectId: id })
        });
      },
      async fetchProjects() {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          set({ projects: data });
          // Charger la sélection côté API si aucun projet sélectionné localement
          if (!get().projectId && data.length > 0) {
            await get().fetchSelectedProjectId();
            // Si toujours rien, sélectionner le premier projet
            if (!get().projectId && data.length > 0) set({ projectId: data[0].id });
          }
        }
      },

      async createProject(name) {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, settings: { projectStartDate: new Date(), workdays: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }, holidays: [] } })
        });
        if (res.ok) {
          await get().fetchProjects();
          // Sélectionner le nouveau projet créé
          const data = await res.json();
          if (data.id) get().setProjectId(data.id);
        }
      },

      async deleteProject(id) {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        await get().fetchProjects();
        // Si le projet courant est supprimé, sélectionner le premier projet restant (ou null)
        const projects = get().projects;
        const nextId = projects.length > 0 ? projects[0].id : null;
        get().setProjectId(nextId);
        // Correction : si plus de projet, vider userStories et settings
        if (!nextId) {
          set({ userStories: [], settings: defaultSettings });
        } else {
          await get().loadUserStories(nextId);
        }
      },

      async renameProject(id, name) {
        await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        await get().fetchProjects();
      },

      // User Stories & settings du projet courant
      userStories: [],
      settings: defaultSettings,

      async loadUserStories(projectId) {
        // Charger settings
        const resProject = await fetch(`/api/projects/${projectId}`);
        if (resProject.ok) {
          const project = await resProject.json();
          set({ settings: project.settings });
        }
        // Charger user stories
        const resStories = await fetch(`/api/projects/${projectId}/userstories`);
        if (resStories.ok) {
          const stories = await resStories.json();
          // Normalisation des AC : toujours un array d'objets {label: string, ...}
          // Normalisation des dates : parser en Date si string
          const normalizedStories = (stories as any[]).map((story: any) => ({
            ...story,
            acceptanceCriteria: Array.isArray(story.acceptanceCriteria)
              ? (story.acceptanceCriteria as any[]).map((ac: any) =>
                  typeof ac === 'string' ? { label: ac } : ac
                )
              : [],
            estimatedStartDate: story.estimatedStartDate ? (story.estimatedStartDate instanceof Date ? story.estimatedStartDate : new Date(story.estimatedStartDate)) : null,
            estimatedEndDate: story.estimatedEndDate ? (story.estimatedEndDate instanceof Date ? story.estimatedEndDate : new Date(story.estimatedEndDate)) : null,
          }));
          set({ userStories: normalizedStories });
        }
      },
      
      // Ajout/édition/suppression de user stories synchronisées avec l'API projet
      addUserStory: async (userStory) => {
        const { projectId, loadUserStories, userStories } = get();
        if (!projectId) return;
        const order = userStories.length;
        await fetch(`/api/projects/${projectId}/userstories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...userStory, order, projectId })
        });
        await loadUserStories(projectId);
      },
      updateUserStory: async (id, userStory, reload = true) => {
        const { projectId, loadUserStories, userStories } = get();
        if (!projectId) return;
        // Recherche par projectId + id
        const current = userStories.find(s => s.id === id && s.projectId === projectId);
        if (!current) return;
        const merged = {
          ...current,
          ...userStory,
          order: current.order,
          acceptanceCriteria: userStory.acceptanceCriteria !== undefined ? userStory.acceptanceCriteria : current.acceptanceCriteria || [],
        };
        await fetch(`/api/projects/${projectId}/userstories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged)
        });
        if (reload) {
          await loadUserStories(projectId);
        }
      },
      deleteUserStory: async (id) => {
        const { projectId, loadUserStories, userStories } = get();
        if (!projectId) return;
        // Recherche par projectId + id (pour robustesse, même si l'API prend déjà les deux)
        const current = userStories.find(s => s.id === id && s.projectId === projectId);
        if (!current) return;
        await fetch(`/api/projects/${projectId}/userstories/${id}`, { method: 'DELETE' });
        await loadUserStories(projectId);
      },
      
      reorderUserStories: async (sourceIndex, destinationIndex) => {
        const sortedStories = [...get().userStories].sort((a, b) => a.order - b.order);
        const [removed] = sortedStories.splice(sourceIndex, 1);
        sortedStories.splice(destinationIndex, 0, removed);
        // Mettre à jour les ordres
        const updatedStories = sortedStories.map((story, index) => ({
          ...story,
          order: index,
        }));
        set({ userStories: updatedStories });
        // Recalculer les dates et synchroniser
        await get().recalculateDates();
      },
      
      getNextId: () => {
        const prefix = 'US';
        const existingIds = get().userStories.map(story => story.id);
        let counter = 1;
        
        while (existingIds.includes(`${prefix}${counter.toString().padStart(3, '0')}`)) {
          counter++;
        }
        
        return `${prefix}${counter.toString().padStart(3, '0')}`;
      },
      
      getExistingEpics: () => {
        return [...new Set(get().userStories.map(story => story.epic))];
      },

      async syncUserStories() {
        await fetch('/api/userstories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(get().userStories),
        });
      },
      
      // Nouvelle méthode pour synchroniser les settings avec l'API
      updateSettings: async (newSettings: Settings) => {
        const { projectId, loadUserStories, projects } = get();
        if (!projectId) return;
        // Récupérer le nom du projet courant
        const project = projects.find(p => p.id === projectId);
        const name = project ? project.name : '';
        await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, settings: newSettings })
        });
        // Recharge les settings depuis l'API pour cohérence
        await loadUserStories(projectId);
      },

      // Refactorisation des méthodes de settings pour utiliser updateSettings
      updateWorkdays: async (workdays) => {
        const { settings, updateSettings, recalculateDates } = get();
        await updateSettings({ ...settings, workdays });
        await recalculateDates();
      },
      
      addHoliday: async (holiday) => {
        const { settings, updateSettings, recalculateDates } = get();
        const newHoliday: Holiday = { ...holiday, id: uuidv4() };
        await updateSettings({ ...settings, holidays: [...settings.holidays, newHoliday] });
        await recalculateDates();
      },
      
      updateHoliday: async (id, holiday) => {
        const { settings, updateSettings, recalculateDates } = get();
        await updateSettings({
          ...settings,
          holidays: settings.holidays.map(h => h.id === id ? { ...holiday, id } : h)
        });
        await recalculateDates();
      },
      
      deleteHoliday: async (id) => {
        const { settings, updateSettings, recalculateDates } = get();
        await updateSettings({
          ...settings,
          holidays: settings.holidays.filter(h => h.id !== id)
        });
        await recalculateDates();
      },
      
      updateProjectStartDate: async (date) => {
        const { settings, updateSettings, recalculateDates } = get();
        await updateSettings({ ...settings, projectStartDate: date });
        await recalculateDates();
      },
      
      theme: (typeof window !== 'undefined' && localStorage.getItem('us-theme')) as 'light' | 'dark' | 'system' || 'system',
      updateTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          localStorage.setItem('us-theme', theme);
        }
        get().saveUserTheme(theme);
      },
      
      fetchUserTheme: async () => {
        try {
          const res = await fetch('/api/user/theme', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.theme) {
              set({ theme: data.theme });
              if (typeof window !== 'undefined') {
                localStorage.setItem('us-theme', data.theme);
              }
            }
          }
        } catch (e) { /* ignore */ }
      },
      saveUserTheme: async (theme: 'light' | 'dark' | 'system') => {
        try {
          await fetch('/api/user/theme', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ theme })
          });
        } catch (e) { /* ignore */ }
      },
      
      // Import/Export projet par projet via l'API
      exportData: async () => {
        const { projectId } = get();
        if (!projectId) throw new Error('Aucun projet sélectionné');
        const res = await fetch(`/api/projects/${projectId}/export`);
        if (!res.ok) throw new Error('Erreur lors de l’export');
        const data = await res.json();
        return JSON.stringify(data, null, 2);
      },

      importData: async (jsonData: string) => {
        const res = await fetch('/api/projects/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonData
        });
        if (!res.ok) throw new Error('Erreur lors de l’import');
        const importedProject = await res.json();
        await get().fetchProjects();
        // Sélectionner le projet importé par son id retourné par l'API
        if (importedProject && importedProject.id) {
          get().setProjectId(importedProject.id);
        }
      },
      
      resetData: (keepSettings) => {
        set(state => ({
          userStories: [],
          settings: keepSettings ? state.settings : defaultSettings,
        }));
      },
      
      // Dates calculation
      isWorkday: (date) => isWorkdayDate(date, get().settings),
      
      recalculateDates: async () => {
        const { userStories: oldUserStories, settings, updateUserStory, loadUserStories, projectId } = get();
        if (oldUserStories.length === 0) return;
        const updatedStories = recalculateUserStoryDates(oldUserStories, settings);
        set({ userStories: updatedStories, isSaving: true, saveError: null });
        if (projectId) {
          (async () => {
            try {
              for (let i = 0; i < updatedStories.length; i++) {
                const oldStory = oldUserStories.find(s => s.id === updatedStories[i].id && s.projectId === projectId);
                const oldStart = oldStory?.estimatedStartDate ? new Date(String(oldStory.estimatedStartDate)) : null;
                const oldEnd = oldStory?.estimatedEndDate ? new Date(String(oldStory.estimatedEndDate)) : null;
                const newStart = updatedStories[i].estimatedStartDate ? new Date(String(updatedStories[i].estimatedStartDate)) : null;
                const newEnd = updatedStories[i].estimatedEndDate ? new Date(String(updatedStories[i].estimatedEndDate)) : null;
                if (
                  !oldStory ||
                  (oldStart && newStart && oldStart.toISOString() !== newStart.toISOString()) ||
                  (oldEnd && newEnd && oldEnd.toISOString() !== newEnd.toISOString())
                ) {
                  await updateUserStory(updatedStories[i].id, { ...updatedStories[i] }, false);
                }
              }
              await loadUserStories(projectId);
              set({ isSaving: false, saveError: null });
            } catch (e) {
              set({ isSaving: false, saveError: 'Erreur lors de la sauvegarde des User Stories.' });
            }
          })();
        } else {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: 'user-stories-storage',
      partialize: (state) => ({
        settings: state.settings,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        setTimeout(() => {
          if (state && state.recalculateDates) {
            state.recalculateDates();
          }
        }, 0);
      },
    }
  )
);
