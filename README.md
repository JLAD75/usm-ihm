# User Stories Manager (USM)

User Stories Manager est une application web moderne et complète pour la gestion agile de projets, permettant de gérer efficacement les user stories, sprints, rapports et collaboration d'équipe.

## ✨ Fonctionnalités principales

### 🎯 Gestion des User Stories
- **CRUD complet** : Création, édition, suppression et visualisation des user stories
- **Drag & Drop** : Réorganisation intuitive des user stories par glisser-déposer
- **Critères d'acceptation** : Gestion des critères d'acceptation avec formatage
- **Dépendances** : Gestion des dépendances entre user stories
- **Commentaires** : Système de commentaires pour chaque user story
- **Estimation** : Estimation en jours avec calcul automatique des dates

### 📊 Rapports et Visualisations
- **Tableau de bord** : Vue d'ensemble avec métriques clés
- **Diagramme de Gantt** : Visualisation temporelle des user stories
- **Calendrier des sprints** : Planification et suivi des sprints
- **Tableaux de synthèse** : Rapports détaillés et exportables
- **Vue Kanban** : Organisation visuelle par statuts

### 🤖 Assistant IA Intégré
- **Chat IA** : Assistant spécialisé en gestion de projet agile
- **Outils MCP** : Intégration d'outils pour analyser et modifier les données
- **Filtrage intelligent** : Recherche et filtrage avancé des user stories
- **Modifications directes** : Modification des user stories via l'IA
- **Métriques automatiques** : Calcul et analyse des métriques de projet

### ⚙️ Configuration et Personnalisation
- **Thèmes** : Mode clair/sombre et thème système
- **Jours ouvrés** : Configuration des jours de travail
- **Jours fériés** : Gestion des congés et jours fériés
- **Import/Export** : Import/export Excel et JSON
- **Partage de projet** : Gestion des droits d'accès utilisateurs

### 🔐 Authentification et Sécurité
- **OAuth Google** : Authentification sécurisée via Google
- **Gestion des sessions** : Sessions persistantes et sécurisées
- **Contrôle d'accès** : Droits d'accès par projet (lecture/écriture/propriétaire)

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript pour une interface moderne et type-safe
- **Vite** pour un développement rapide et un build optimisé
- **Tailwind CSS** pour un design responsive et personnalisable
- **Zustand** pour la gestion d'état globale
- **React Markdown** pour le rendu des réponses IA
- **DND Kit** pour le drag & drop
- **Date-fns** pour la manipulation des dates

### Backend
- **Node.js** avec Express pour l'API REST
- **SQLite** pour la persistance des données
- **Passport.js** pour l'authentification OAuth
- **JWT** pour la sécurisation des sessions
- **CORS** configuré pour la sécurité

### IA et Outils
- **OpenAI GPT-4o-mini** pour l'assistant IA
- **MCP (Model Context Protocol)** pour les outils d'analyse
- **EventSource** pour le streaming des réponses IA

## 📦 Installation et Configuration

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [PNPM](https://pnpm.io/) (recommandé) ou npm
- Compte Google pour l'authentification OAuth

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd usm-ihm
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer l'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Configurer l'API backend**
   Voir la documentation du dossier `usm-api/` pour la configuration du backend.

5. **Lancer le développement**
   ```bash
   pnpm dev
   ```

### Build pour la production
```bash
pnpm build
```

## 📁 Structure du projet

```
usm-ihm/
├── src/
│   ├── components/           # Composants React
│   │   ├── app/             # Composants principaux (Header, Navigation, etc.)
│   │   ├── kanban/          # Vue Kanban
│   │   ├── reports/         # Rapports et visualisations
│   │   ├── settings/        # Paramètres et configuration
│   │   ├── ui/              # Composants UI réutilisables
│   │   └── userStories/     # Gestion des user stories
│   ├── hooks/               # Hooks personnalisés
│   ├── lib/                 # Utilitaires et helpers
│   ├── store/               # Gestion d'état (Zustand)
│   └── types/               # Types TypeScript
├── public/                  # Fichiers statiques
├── docs/                    # Documentation utilisateur
└── package.json
```

## 🚀 Fonctionnalités avancées

### Assistant IA
L'assistant IA intégré permet de :
- Analyser les métriques du projet
- Filtrer et rechercher les user stories
- Modifier directement les user stories
- Générer des rapports automatiques
- Répondre aux questions sur le projet

### Outils MCP
Les outils MCP permettent à l'IA de :
- Récupérer les métriques du projet
- Lister et filtrer les user stories
- Créer, modifier et supprimer des user stories
- Analyser les sprints et la progression

### Gestion des accès
- **Propriétaire** : Accès complet au projet
- **Écriture** : Peut modifier les user stories
- **Lecture** : Peut consulter le projet

## 🔧 Développement

### Scripts disponibles
```bash
pnpm dev          # Démarre le serveur de développement
pnpm build        # Build pour la production
pnpm preview      # Prévisualise le build de production
pnpm test         # Lance les tests
pnpm lint         # Vérifie le code avec ESLint
```

### Variables d'environnement
- `VITE_API_BASE_URL` : URL de l'API backend
- `VITE_GOOGLE_CLIENT_ID` : ID client Google OAuth (optionnel)

## 📚 Documentation

- [Guide d'utilisation](docs/USAGE.md) : Documentation complète pour les utilisateurs
- [API Documentation](usm-api/README.md) : Documentation du backend

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour la gestion agile moderne !**
