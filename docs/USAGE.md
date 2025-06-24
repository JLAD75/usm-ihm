# Guide d'utilisation de User Stories Manager

Ce document décrit les principales étapes pour utiliser l'application **User Stories Manager**. Toutes les captures d'écran et visuels sont omis pour la concision.

## Connexion

1. Lancez l'application (`pnpm dev` pour l'interface puis `pnpm start:server` pour l'API).
2. Depuis la page d'accueil, authentifiez-vous via Google.

## Gestion des projets

- **Création** : utilisez le sélecteur en haut à gauche pour créer un nouveau projet.
- **Sélection** : ce même menu permet de changer de projet courant.
- **Renommer ou supprimer** : rendez-vous dans l'onglet *Paramètres* pour renommer ou supprimer le projet actif.
- **Partager** : dans cet onglet, cliquez sur *Partager* pour ouvrir la fenêtre de gestion des accès. Vous pouvez ajouter l'identifiant d'un utilisateur et choisir son niveau d'accès (lecture, écriture ou propriétaire). Les accès existants peuvent être modifiés ou retirés.

## User Stories

1. Accédez à l'onglet *User Stories*.
2. Ajoutez ou éditez des stories via le formulaire dédié.
3. Faites glisser les stories pour les réordonner ; les dates estimées sont recalculées automatiquement selon les paramètres du projet.
4. Utilisez le bouton *Exporter Excel* pour obtenir un fichier `.xlsx` de la liste courante.

## Rapports et Avancement

- L'onglet *Rapports* fournit plusieurs vues (tableau récapitulatif, diagramme de Gantt, calendrier de sprint…).
- L'onglet *Avancement* affiche un tableau Kanban pour suivre l'état des stories.

## Paramètres

Dans l'onglet *Paramètres* :

- Définissez la date de démarrage du projet.
- Configurez les jours ouvrés et les périodes de congés.
- Choisissez le thème clair, sombre ou automatique.
- Importez ou exportez un projet au format JSON.
- Réinitialisez les données du projet si nécessaire.

---

Bon usage !
