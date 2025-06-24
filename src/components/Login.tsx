import { useEffect, useRef } from "react";
import * as THREE from "three";
import gmp from "../assets/GMP.png";
import JSO from "../assets/JSO.png";
import logo from "../assets/LogoUSM.png";
import rk from "../assets/RK.png";
import usv from "../assets/USV.png";

const features = [
  {
    title: "Gestion multi-projets",
    desc: "Organisez vos user stories par projet, importez/exportez facilement, et collaborez en équipe.",
    img: gmp,
  },
  {
    title: "User Stories visuelles",
    desc: "Créez, éditez et visualisez vos user stories avec dépendances, priorités et statuts.",
    img: usv,
  },
  {
    title: "Rapports & Kanban",
    desc: "Générez des rapports, suivez l’avancement et gérez vos sprints sur un tableau Kanban moderne.",
    img: rk,
  },
  {
    title: "Import/Export JSON",
    desc: "Sauvegardez ou migrez vos projets en un clic grâce à l’import/export universel.",
    img: JSO,
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
    text: "Copilot n’a pas dormi, mais il a kiffé coder avec moi !",
  },
  {
    emoji: "🚀",
    text: "Déploiement à l’aube, fierté maximale.",
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
      {/* Sections scrollables */}
      <main className="flex flex-col gap-32 md:gap-5 px-4 md:px-0 max-w-3xl mx-auto">
        {features.map((f, i) => (
          <section
            key={f.title}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-16 py-8"
          >
            <div
              className={`flex-1 ${
                i % 2 === 1 ? "md:order-2" : ""
              } flex justify-center`}
            >
              <img
                src={f.img}
                alt={f.title}
                className="w-64 h-64 object-contain rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-gray-900/40"
              />
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start">
              <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-center md:text-left drop-shadow">
                {f.title}
              </h2>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 text-center md:text-left">
                {f.desc}
              </p>
            </div>
          </section>
        ))}
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
      <footer className="flex flex-col items-center justify-center py-16 gap-6">
        <button
          onClick={scrollToTop}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-900 text-white font-bold rounded-full shadow-lg text-lg transition flex items-center gap-2 hover:shadow-lg"
        >
          <svg
            className="w-6 h-6"
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
          Remonter
        </button>
        <p className="text-gray-400 text-sm mt-4">
          Gestionnaire de User Stories – 2025
        </p>
      </footer>
    </div>
  );
}
