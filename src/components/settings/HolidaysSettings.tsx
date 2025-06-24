import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Holiday } from '../../types/Settings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const HolidaysSettings: React.FC = () => {
  const { settings, addHoliday, updateHoliday, deleteHoliday } = useAppStore();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (!endDate || value > endDate) setEndDate(value);
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate > endDate) {
      setErrorModal("La date de début doit être antérieure ou égale à la date de fin.");
      return;
    }
    const holidayData = { title, startDate: new Date(startDate), endDate: new Date(endDate) };
    if (editId) {
      await updateHoliday(editId, holidayData);
    } else {
      await addHoliday(holidayData);
    }
    resetForm();
  };

  const handleEdit = (holiday: Holiday) => {
    setTitle(holiday.title);
    setStartDate(format(holiday.startDate, 'yyyy-MM-dd'));
    setEndDate(format(holiday.endDate, 'yyyy-MM-dd'));
    setEditId(holiday.id);
  };

  const handleDelete = async (id: string) => {
    await deleteHoliday(id);
  };

  const formatDate = (date: Date) => format(date, 'dd/MM/yyyy', { locale: fr });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Jours de congés</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intitulé</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ex: Vacances d'été"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >Annuler</button>
          )}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >{editId ? 'Mettre à jour' : 'Ajouter'}</button>
        </div>
      </form>
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Périodes de congés</h4>
        {settings.holidays.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune période de congés définie.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {settings.holidays.map(holiday => (
              <li key={holiday.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{holiday.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Du {formatDate(holiday.startDate)} au {formatDate(holiday.endDate)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(holiday)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >Modifier</button>
                  <button
                    onClick={() => handleDelete(holiday.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modale d'erreur */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h4 className="text-lg font-bold mb-2 text-red-600 dark:text-red-400">Erreur</h4>
            <p className="mb-4 text-gray-800 dark:text-gray-200">{errorModal}</p>
            <button
              onClick={() => setErrorModal(null)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidaysSettings;
