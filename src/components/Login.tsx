import { useEffect, useRef } from "react";
import * as THREE from "three";
import gmp from "../assets/GMP.png";
import JSO from "../assets/JSO.png";
import logo from "../assets/LogoUSM.png";
import rk from "../assets/RK.png";
import usv from "../assets/USV.png";

const features = [
  {
    title: "Gestion multi-projets intelligente",
    desc: "Créez et gérez plusieurs projets simultanément, partagez avec votre équipe, et configurez des droits d'accès granulaires. Renommez, supprimez et organisez vos projets en toute simplicité.",
    img: gmp,
    details: [
      "Création et gestion de projets multiples",
      "Partage collaboratif avec gestion des droits",
      "Sélection rapide entre vos projets",
      "Suppression et renommage sécurisés",
    ],
  },
  {
    title: "User Stories complètes et visuelles",
    desc: "Créez des user stories détaillées avec critères d'acceptation, estimations, dépendances et suivi de progression. Organisez par épics, rôles utilisateur et priorités.",
    img: usv,
    details: [
      "Critères d'acceptation avec suivi dev/test",
      "Gestion des épics et rôles utilisateur",
      "Estimations en jours et calcul automatique des dates",
      "Priorités Must/Should/Could Have",
      "Dépendances entre user stories",
      "Commentaires et justifications",
    ],
  },
  {
    title: "Tableau Kanban dynamique",
    desc: "Suivez l'avancement de vos user stories sur un tableau Kanban interactif avec drag & drop. Gérez les statuts : À faire, En cours, En difficulté, À recetter, Terminé.",
    img: rk,
    details: [
      "5 colonnes de statut personnalisées",
      "Drag & drop fluide et responsive",
      "Suivi des critères d'acceptation en temps réel",
      "Actions rapides (recette, passage en terminé)",
      "Gestion des blocages avec dates",
      "Commentaires et annotations",
    ],
  },
  {
    title: "Rapports et analyses avancés",
    desc: "Générez des rapports de synthèse, visualisez vos sprints en tableau ou calendrier, créez des diagrammes de Gantt interactifs et exportez tout en Excel ou PNG.",
    img: JSO,
    details: [
      "Tableaux de synthèse par épic et mois",
      "Planification des sprints (2-3 semaines)",
      "Calendriers de sprints avec vues semaine/mois/année",
      "Diagrammes de Gantt avec zoom et filtres",
      "Export Excel et PNG haute qualité",
      "Statistiques de projet détaillées",
    ],
  },
  {
    title: "Configuration avancée des projets",
    desc: "Personnalisez entièrement vos projets : définissez les jours ouvrés, gérez les périodes de congés, configurez la date de démarrage et les paramètres de calcul automatique.",
    img: gmp,
    details: [
      "Configuration des jours ouvrés (7j/7)",
      "Gestion des congés et jours fériés",
      "Date de démarrage de projet",
      "Recalcul automatique des dates",
      "Thèmes clair/sombre/automatique",
      "Sauvegarde cloud des préférences",
    ],
  },
  {
    title: "Intelligence artificielle intégrée",
    desc: "Bénéficiez d'un assistant IA pour analyser vos projets, générer des prompts pour les LLM, et obtenir des conseils personnalisés sur votre gestion de projet agile.",
    img: usv,
    details: [
      "Chat IA spécialisé en gestion de projet",
      "Analyse automatique de vos user stories",
      "Génération de prompts LLM optimisés",
      "Conseils sur la planification des sprints",
      "Support OpenAI GPT-4o et modèles récents",
      "Historique des conversations",
    ],
  },
  {
    title: "Import/Export et sauvegarde",
    desc: "Sauvegardez, migrez et synchronisez vos projets facilement. Export JSON complet, import intelligent avec validation, et sauvegarde automatique dans le cloud.",
    img: JSO,
    details: [
      "Export JSON complet (US + paramètres)",
      "Import intelligent avec validation",
      "Sauvegarde automatique en temps réel",
      "Synchronisation multi-appareils",
      "Réinitialisation sélective des données",
      "Historique des modifications",
    ],
  },
  {
    title: "Interface mobile-first responsive",
    desc: "Profitez d'une expérience optimisée sur tous les appareils : smartphone, tablette et desktop. Navigation adaptative, gestes tactiles et performance optimale.",
    img: rk,
    details: [
      "Design responsive mobile-first",
      "Navigation adaptative avec FAB mobile",
      "Gestes tactiles pour le Kanban",
      "Optimisation des performances",
      "Mode hors-ligne partiel",
      "Interface tactile intuitive",
    ],
  },
];

const funFacts = [
  {
    emoji: "☕",
    text: "Nuit blanche garantie : 12 mugs de café, 0 bug en prod (on espère).",
  },
  {
    emoji: "💡",
    text: "Idées lumineuses à 3h du matin : 7, dont 2 gardées.",
  },
  {
    emoji: "🎧",
    text: "Playlist de la nuit : Lo-fi, synthwave et un peu de Queen.",
  },
  {
    emoji: "🤖",
    text: "Copilot n'a pas dormi, mais il a kiffé coder avec moi !",
  },
  {
    emoji: "🚀",
    text: "Déploiement à l'aube, fierté maximale.",
  },
];

function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // --- Effet "Apple" : vague lumineuse abstraite, plus dense et plus fin ---
    const gridX = 120;
    const gridY = 36;
    const spacing = 0.19;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(gridX * gridY * 3);
    const colors = new Float32Array(gridX * gridY * 3);
    let i = 0;
    for (let y = 0; y < gridY; y++) {
      for (let x = 0; x < gridX; x++) {
        positions[i * 3] = (x - gridX / 2) * spacing;
        positions[i * 3 + 1] = (y - gridY / 2) * spacing * 0.7;
        positions[i * 3 + 2] = 0;
        // Couleur subtile, indigo/bleu, effet glow doux
        const base = 0.7 + Math.random() * 0.08;
        colors[i * 3] = base * 0.7;
        colors[i * 3 + 1] = base * 0.8;
        colors[i * 3 + 2] = 1.0;
        i++;
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- Animation : vague sinusoïdale subtile, effet "sonoma" ---
    let frameId: number;
    const animate = () => {
      const time = performance.now() * 0.00022;
      const pos = geometry.getAttribute("position");
      let i = 0;
      for (let y = 0; y < gridY; y++) {
        for (let x = 0; x < gridX; x++) {
          const baseY = (y - gridY / 2) * spacing * 0.7;
          pos.array[i * 3 + 2] =
            Math.sin(time + x * 0.18 + y * 0.22) * 0.45 +
            Math.cos(time * 0.7 + x * 0.12 - y * 0.18) * 0.18;
          pos.array[i * 3 + 1] = baseY + Math.sin(time * 0.7 + x * 0.13) * 0.08;
          i++;
        }
      }
      pos.needsUpdate = true;
      points.rotation.z = Math.sin(time * 0.13) * 0.04;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);
  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}

export default function Login() {
  // Scroll to top
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ThreeBackground />
      {/* Dégradé semi-transparent pour laisser voir le fond animé */}
      <div className="fixed inset-0 -z-10 bg-linear-to-b from-indigo-50/70 via-white/60 to-indigo-100/70 dark:from-gray-900/80 dark:via-gray-950/70 dark:to-indigo-900/80 pointer-events-none" />
      {/* Header + bouton connexion */}
      <header className="sticky top-0 z-20 flex flex-col items-center bg-transparent pt-8">
        <img src={logo} alt="Logo" className="w-16 h-16 mb-2 drop-shadow-xl" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-2 text-center drop-shadow-lg">
          User Stories Manager
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-200 mb-6 text-center max-w-2xl">
          La solution moderne pour gérer vos projets agiles, user stories et
          sprints en toute simplicité.
        </p>
        <a
          href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
          className="px-8 py-3 text-white text-lg font-semibold rounded-full transition mb-8 hover:backdrop-blur-none hover:animate-none bg-indigo-600/30 hover:bg-blue-400/30 hover:shadow hover:drop-shadow-xl hover:drop-shadow-indigo-500/50"
        >
          Se connecter avec Google
        </a>
      </header>

      {/* Section avantages clés */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
            Pourquoi choisir User Stories Manager ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
            La seule solution qui combine simplicité, puissance et intelligence
            artificielle pour une gestion de projet agile optimale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800/50">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2">
              Démarrage Rapide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connectez-vous avec Google et créez votre premier projet en moins
              de 2 minutes. Pas de configuration complexe.
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800/50">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2">
              Tout-en-Un
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              User stories, Kanban, sprints, rapports, Gantt et IA : tous les
              outils dont vous avez besoin en un seul endroit.
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800/50">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2">
              Performance Optimale
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Interface ultra-rapide, sauvegarde automatique et synchronisation
              temps réel pour une productivité maximale.
            </p>
          </div>
        </div>
      </section>

      {/* Sections scrollables */}
      <main className="flex flex-col gap-16 md:gap-12 px-4 md:px-0 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <section
            key={f.title}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-16 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-lg"
          >
            <div
              className={`flex-1 ${
                i % 2 === 1 ? "md:order-2" : ""
              } flex justify-center`}
            >
              <img
                src={f.img}
                alt={f.title}
                className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-800 bg-white/90 dark:bg-gray-900/60"
              />
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start px-4">
              <h2 className="text-xl md:text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-3 text-center md:text-left drop-shadow">
                {f.title}
              </h2>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 text-center md:text-left mb-4 leading-relaxed">
                {f.desc}
              </p>
              {f.details && (
                <div className="w-full">
                  <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 text-center md:text-left">
                    Fonctionnalités clés :
                  </h3>
                  <ul className="space-y-1">
                    {f.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300"
                      >
                        <span className="text-indigo-500 mt-1 flex-shrink-0">
                          •
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Section statistiques et highlights */}
        <section className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-indigo-900/50 rounded-3xl p-8 md:p-12 shadow-2xl border border-indigo-100 dark:border-indigo-800/50">
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-8 text-center">
            Une solution complète pour vos projets agiles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                8+
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Modules intégrés
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                5
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Statuts Kanban
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                ∞
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Projets possibles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                🤖
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Assistant IA
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/70 dark:bg-gray-900/50 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-3 text-center">
                🎯 Méthodologie Agile
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Respects des principes Scrum avec sprints, user stories,
                critères d'acceptation et gestion des blocages.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/50 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-3 text-center">
                📱 Mobile-First
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Interface responsive optimisée pour tous les appareils avec
                navigation adaptative et gestes tactiles.
              </p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/50 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-3 text-center">
                ☁️ Cloud & Sécurité
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Sauvegarde automatique, authentification Google, partage
                sécurisé et synchronisation temps réel.
              </p>
            </div>
          </div>
        </section>

        {/* Section fun facts after features */}
        <section className="flex flex-col items-center gap-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-center drop-shadow animate-pulse">
            Nuit blanche, souvenirs et café ☕
          </h2>
          <ul className="flex flex-col gap-3 text-lg text-gray-700 dark:text-gray-200 text-center">
            {funFacts.map((f) => (
              <li
                key={f.text}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-2xl">{f.emoji}</span> {f.text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-indigo-400 dark:text-indigo-200 text-sm">
              Merci pour cette nuit de code,
            </span>
            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-lg animate-bounce">
              Copilot 💙
            </span>
          </div>
        </section>
      </main>

      {/* Call to action final */}
      <footer className="flex flex-col items-center justify-center py-20 gap-8 bg-gradient-to-t from-indigo-50 to-transparent dark:from-gray-900 dark:to-transparent">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
            Prêt à révolutionner votre gestion de projet ?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 mb-8">
            Rejoignez les équipes qui ont déjà adopté User Stories Manager pour
            des projets agiles plus efficaces.
          </p>
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
            className="inline-flex items-center px-8 py-4 text-white text-xl font-bold rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <svg
              className="w-6 h-6 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Commencer gratuitement avec Google
          </a>
        </div>

        <div className="flex items-center gap-8 mt-8">
          <button
            onClick={scrollToTop}
            className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
            Haut de page
          </button>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            User Stories Manager – Solution complète de gestion de projet agile
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Développé avec ❤️ et beaucoup de café • 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
