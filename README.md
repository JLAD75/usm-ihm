# User Stories Manager

User Stories Manager est une application web moderne permettant de gérer efficacement les user stories, sprints et rapports pour vos projets agiles.

## ✨ Fonctionnalités principales

- **Gestion des user stories** : Ajout, édition, suppression et visualisation des user stories.
- **Gestion des sprints** : Organisation des user stories par sprint, suivi de l’avancement.
- **Rapports & Tableaux** : Génération de rapports (tableaux de synthèse, Gantt, etc.) pour visualiser la progression.
- **Paramétrage** : Configuration des jours ouvrés, jours fériés, thèmes, import/export des données.
- **Partage de projet** : Gestion des droits d'accès pour inviter d'autres utilisateurs.
- **Interface moderne** : UI réactive et agréable grâce à React, Tailwind CSS et des composants personnalisés.

## 🛠️ Technologies utilisées

- **React** (TypeScript) : Framework principal pour l’interface utilisateur.
- **Vite** : Outil de build rapide pour le développement et la production.
- **Tailwind CSS** : Framework CSS utilitaire pour un design moderne et personnalisable.
- **PNPM** : Gestionnaire de paquets rapide et efficace.

## 📦 Installation & Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur recommandé)
- [PNPM](https://pnpm.io/) (si non installé : `npm install -g pnpm`)

### Étapes d’installation

1. **Cloner le dépôt**
   ```powershell
   git clone <url-du-repo>
   cd userStoriesManager
   ```

2. **Installer les dépendances**
   ```powershell
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine contenant :
   ```
   GOOGLE_CLIENT_ID=VotreIdGoogle
   GOOGLE_CLIENT_SECRET=VotreSecretGoogle
   SESSION_SECRET=uneCleSecrete
   PORT=3000
   ```

4. **Lancer le serveur de développement**
   ```powershell
   pnpm dev
   ```
   L’application sera accessible sur [http://localhost:5173](http://localhost:5173) (ou le port affiché dans le terminal).

5. **Démarrer l'API Express**
   ```powershell
   pnpm start:server
   ```

### Build pour la production
```powershell
pnpm build
```
Les fichiers optimisés seront générés dans le dossier `dist/`.

## 📁 Structure du projet

- `src/` : Code source principal
  - `components/` : Composants React (UI, user stories, rapports, paramètres...)
  - `hooks/` : Hooks personnalisés
  - `lib/` : Fonctions utilitaires
  - `store/` : Gestion d’état globale
  - `types/` : Types TypeScript
- `public/` : Fichiers statiques
- `index.html` : Point d’entrée de l’application
- `server/` : API Express et authentification

## 🤝 Contribuer

Les contributions sont les bienvenues ! N’hésitez pas à ouvrir une issue ou une pull request.

Un guide détaillé d'utilisation est disponible dans [docs/USAGE.md](docs/USAGE.md).

## 📜 Licence

Ce projet est sous licence MIT.

---

**Développé avec ❤️ pour la gestion agile !**
