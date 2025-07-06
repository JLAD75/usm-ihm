import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

interface Access {
  userId: string;
  accessLevel: "read" | "write" | "owner";
  email?: string;
  displayName?: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ShareProjectDialog: React.FC<{
  projectId: string;
  open: boolean;
  onClose: () => void;
}> = ({ projectId, open, onClose }) => {
  const [accessList, setAccessList] = useState<Access[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [newUserId, setNewUserId] = useState("");
  const [newLevel, setNewLevel] = useState<"read" | "write" | "owner">("read");
  const { user: currentUser } = useAuthStore();
  useEffect(() => {
    if (!open) return;

    // Charger la liste des accès existants
    fetch(`${API_BASE_URL}/projects/${projectId}/access`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAccessList(data));

    // Charger la liste de tous les utilisateurs
    fetch(`${API_BASE_URL}/users`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((users: User[]) => {
        // Filtrer pour exclure l'utilisateur actuel
        const filteredUsers = users.filter(
          (user) => user.id !== currentUser?.id
        );
        setAvailableUsers(filteredUsers);
      });
  }, [open, projectId, currentUser?.id]);
  const handleAdd = async () => {
    if (!newUserId.trim()) return;
    await fetch(`${API_BASE_URL}/projects/${projectId}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        targetUserId: newUserId.trim(),
        accessLevel: newLevel,
      }),
    });
    setNewUserId("");
    setNewLevel("read");

    // Recharger les listes
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/access`, { credentials: 'include' });
    if (res.ok) setAccessList(await res.json());

    // Mettre à jour la liste des utilisateurs disponibles
    const usersRes = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
    if (usersRes.ok) {
      const users = await usersRes.json();
      const filteredUsers = users.filter(
        (user: User) => user.id !== currentUser?.id
      );
      setAvailableUsers(filteredUsers);
    }
  };
  const handleUpdate = async (
    userId: string,
    accessLevel: "read" | "write" | "owner"
  ) => {
    await fetch(`${API_BASE_URL}/projects/${projectId}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ targetUserId: userId, accessLevel }),
    });
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/access`, { credentials: 'include' });
    if (res.ok) setAccessList(await res.json());
  };

  const handleRemove = async (userId: string) => {
    await fetch(`${API_BASE_URL}/projects/${projectId}/access/${userId}`, {
      method: "DELETE",
      credentials: 'include',
    });
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/access`, { credentials: 'include' });
    if (res.ok) setAccessList(await res.json());

    // Mettre à jour la liste des utilisateurs disponibles
    const usersRes = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
    if (usersRes.ok) {
      const users = await usersRes.json();
      const filteredUsers = users.filter(
        (user: User) => user.id !== currentUser?.id
      );
      setAvailableUsers(filteredUsers);
    }
  };

  // Filtrer les utilisateurs disponibles pour exclure ceux qui ont déjà accès
  const availableUsersForSelection = availableUsers.filter(
    (user) => !accessList.some((access) => access.userId === user.id)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative rounded-2xl shadow-2xl w-full max-w-lg mx-auto z-10 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-4">
        <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300">
          Partager le projet
        </h3>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-gray-600 dark:text-gray-300">
              <th className="py-1">Utilisateur</th>
              <th className="py-1">Niveau</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {accessList.map((a) => (
              <tr
                key={a.userId}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="py-1 text-gray-900 dark:text-gray-100">
                  {a.displayName || a.email || a.userId}
                </td>
                <td className="py-1">
                  {" "}
                  <select
                    value={a.accessLevel}
                    onChange={(e) =>
                      handleUpdate(
                        a.userId,
                        e.target.value as "read" | "write" | "owner"
                      )
                    }
                    className="px-1 py-0.5 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="read">Lecture</option>
                    <option value="write">Écriture</option>
                    <option value="owner">Propriétaire</option>
                  </select>
                </td>
                <td className="py-1 text-right">
                  <button
                    onClick={() => handleRemove(a.userId)}
                    className="text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}{" "}
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-1">
                <select
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner un utilisateur...</option>
                  {availableUsersForSelection.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-1">
                {" "}
                <select
                  value={newLevel}
                  onChange={(e) =>
                    setNewLevel(e.target.value as "read" | "write" | "owner")
                  }
                  className="px-1 py-0.5 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="read">Lecture</option>
                  <option value="write">Écriture</option>
                  <option value="owner">Propriétaire</option>
                </select>
              </td>
              <td className="py-1 text-right">
                <button
                  onClick={handleAdd}
                  className="text-indigo-600 hover:underline"
                  disabled={!newUserId.trim()}
                >
                  Ajouter
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ShareProjectDialog;
