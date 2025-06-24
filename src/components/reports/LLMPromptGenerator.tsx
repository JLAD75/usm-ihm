import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

const MASKS = [
  {
    label: "Synthèse projet (Chef de projet)",
    value: "pm",
    prefix: "Tu es un chef de projet expérimenté. Analyse le planning ci-dessous, identifie les points critiques, propose des axes d’optimisation, et rédige une synthèse claire à destination d’un comité de pilotage.\n\n",
    demande: `Pourriez-vous analyser ce calendrier de développement et me fournir une synthèse incluant :\n1. La durée totale estimée du projet\n2. La répartition de l'effort par Epic\n3. Les périodes critiques ou goulots d'étranglement potentiels\n4. Des recommandations pour optimiser le planning\n5. Une analyse des dépendances entre User Stories\n\nMerci de présenter cette synthèse de manière claire et structurée.`
  },
  {
    label: "Conseiller en organisation agile",
    value: "agile",
    prefix: "Tu es un coach agile. Analyse la planification des User Stories, détecte les dépendances problématiques, propose des améliorations pour fluidifier le flux de travail et optimiser la vélocité de l’équipe.\n\n",
    demande: `Merci d’identifier les points de blocage, les dépendances risquées, et de proposer des actions concrètes pour améliorer la livraison continue et la collaboration.`
  },
  {
    label: "Rédacteur technique",
    value: "techwriter",
    prefix: "Tu es un rédacteur technique. À partir du planning, rédige un rapport structuré, synthétise les informations clés, et prépare un mail de suivi à destination des parties prenantes.\n\n",
    demande: `Merci de fournir un rapport synthétique et un exemple de mail de suivi pour l’équipe projet.`
  },
  {
    label: "Gestion des risques (IT)",
    value: "risks",
    prefix: "Tu es un expert en gestion des risques IT. Identifie les risques majeurs du planning, propose des mesures de mitigation, et alerte sur les points de vigilance.\n\n",
    demande: `Merci de présenter une analyse des risques, leur impact potentiel, et des recommandations pour les réduire.`
  },
  {
    label: "Synthèse pour Product Owner",
    value: "po",
    prefix: "Tu es un Product Owner expérimenté. Analyse le planning, identifie les incohérences de priorisation, propose des arbitrages et rédige une synthèse à destination de l’équipe de développement.\n\n",
    demande: `Merci de signaler les User Stories à re-prioriser, les dépendances à clarifier, et de proposer un plan d’action pour maximiser la valeur métier livrée.`
  },
  {
    label: "Expert UX/UI",
    value: "uxui",
    prefix: "Tu es un expert UX/UI. Analyse la répartition des User Stories, détecte les incohérences ou oublis potentiels côté expérience utilisateur, et propose des recommandations.\n\n",
    demande: `Merci de fournir une analyse des impacts UX, de suggérer des améliorations et d’alerter sur les risques pour l’expérience utilisateur.`
  },
  {
    label: "Synthèse pour communication client",
    value: "client",
    prefix: "Tu es un consultant en communication projet. Rédige une synthèse vulgarisée du planning à destination d’un client non technique, en mettant en avant les grandes étapes et les bénéfices attendus.\n\n",
    demande: `Merci de rédiger un texte clair, synthétique et rassurant, adapté à un public non technique.`
  },
];

const LLMPromptGenerator: React.FC = () => {
  const { userStories, settings } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [mask, setMask] = useState(MASKS[0].value);
  const [emojis, setEmojis] = useState(false); // Option emojis
  const selectedMask = MASKS.find(m => m.value === mask) ?? MASKS[0];
  
  // Générer le prompt pour le LLM
  const generatePrompt = () => {
    if (userStories.length === 0) {
      return "Aucune User Story n'a été ajoutée. Veuillez ajouter des User Stories pour générer un prompt.";
    }
    
    // Trier les user stories par ordre
    const sortedStories = [...userStories].sort((a, b) => a.order - b.order);
    
    // Formater la date
    const formatDate = (date: Date | null) => {
      if (!date) return 'Non définie';
      return format(date, 'dd/MM/yyyy', { locale: fr });
    };
    
    // Emojis
    const e = {
      info: emojis ? 'ℹ️ ' : '',
      epic: emojis ? '🗂️ ' : '',
      story: emojis ? '📌 ' : '',
      priority: emojis ? '⭐ ' : '',
      estimation: emojis ? '⏱️ ' : '',
      start: emojis ? '🚦 ' : '',
      end: emojis ? '🏁 ' : '',
      dependency: emojis ? '🔗 ' : '',
      justification: emojis ? '💡 ' : '',
      criteria: emojis ? '✅ ' : '',
      holidays: emojis ? '🏖️ ' : '',
      workdays: emojis ? '📅 ' : '',
      demande: emojis ? '📝 ' : '',
    };
    // Générer le texte du prompt
    let prompt = selectedMask.prefix;
    prompt += `# ${e.info}Calendrier de développement des User Stories\n\n`;
    
    // Informations générales
    prompt += `## Informations générales\n\n`;
    prompt += `- ${e.start}Date de démarrage du projet: ${formatDate(settings.projectStartDate)}\n`;
    
    // Jours ouvrés
    prompt += `- ${e.workdays}Jours ouvrés: `;
    const workdays: string[] = [];
    if (settings.workdays.monday) workdays.push('Lundi');
    if (settings.workdays.tuesday) workdays.push('Mardi');
    if (settings.workdays.wednesday) workdays.push('Mercredi');
    if (settings.workdays.thursday) workdays.push('Jeudi');
    if (settings.workdays.friday) workdays.push('Vendredi');
    if (settings.workdays.saturday) workdays.push('Samedi');
    if (settings.workdays.sunday) workdays.push('Dimanche');
    prompt += workdays.join(', ') + '\n';
    
    // Périodes de congés
    if (settings.holidays.length > 0) {
      prompt += `- ${e.holidays}Périodes de congés:\n`;
      settings.holidays.forEach(holiday => {
        prompt += `  * ${holiday.title}: du ${formatDate(holiday.startDate)} au ${formatDate(holiday.endDate)}\n`;
      });
    } else {
      prompt += `- Aucune période de congés définie\n`;
    }
    
    prompt += `\n## Liste des User Stories\n\n`;
    
    // Regrouper par Epic
    const epicGroups: Record<string, typeof sortedStories> = {};
    
    sortedStories.forEach(story => {
      if (!epicGroups[story.epic]) {
        epicGroups[story.epic] = [];
      }
      epicGroups[story.epic].push(story);
    });
    // Ajouter chaque Epic et ses User Stories
    Object.entries(epicGroups).forEach(([epic, stories]) => {
      prompt += `### ${e.epic}Epic: ${epic}\n\n`;
      stories.forEach(story => {
        prompt += `#### ${e.story}${story.id}: ${story.title}\n\n`;
        prompt += `- ${e.priority}**Priorité**: ${story.priority}\n`;
        prompt += `- ${e.estimation}**Estimation**: ${story.estimation} jour${story.estimation && story.estimation > 1 ? 's' : ''}\n`;
        prompt += `- ${e.start}**Début estimé**: ${formatDate(story.estimatedStartDate)}\n`;
        prompt += `- ${e.end}**Fin estimée**: ${formatDate(story.estimatedEndDate)}\n`;
        // Dépendance unique (champ dependency)
        if (story.dependency) {
          const dependencyStory = userStories.find(s => s.id === story.dependency);
          prompt += `- ${e.dependency}**Dépendance**: ${story.dependency}${dependencyStory ? ` (${dependencyStory.title})` : ''}\n`;
        }
        if (story.justification) {
          prompt += `- ${e.justification}**Justification**: ${story.justification}\n`;
        }
        if (Array.isArray(story.acceptanceCriteria) && story.acceptanceCriteria.length > 0) {
          prompt += `- ${e.criteria}**Critères d'acceptation**:\n`;
          story.acceptanceCriteria.forEach(criteria => {
            prompt += `    * ${criteria.label}\n`;
          });
        }
        prompt += '\n';
      });
    });
    
    // Section demande adaptée au masque
    prompt += `## ${e.demande}Demande\n\n`;
    prompt += selectedMask.demande;
    return prompt;
  };
  
  const prompt = generatePrompt();
  
  // Copier le prompt dans le presse-papiers
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Exporter le prompt en PDF
  const exportToPdf = () => {
    // Cette fonction sera implémentée avec jsPDF
    // Pour l'instant, on utilise un téléchargement de fichier texte
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt-llm-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white"></h3>
        <div className="flex items-center gap-2">
          <label htmlFor="mask-select" className="text-sm text-gray-700 dark:text-gray-300 mr-2">Assistant</label>
          <select
            id="mask-select"
            value={mask}
            onChange={e => setMask(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {MASKS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emojis}
              onChange={e => setEmojis(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out mr-1"
            />
            <span>Emojis</span>
          </label>
          <div className="flex space-x-3">
            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm ${
                copied
                  ? 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  : 'text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
            <button
              onClick={exportToPdf}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Exporter
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto prose prose-indigo dark:prose-invert max-w-none text-sm"
           style={{ maxHeight: '65vh', minHeight: '200px', overflowY: 'auto' }}>
        <ReactMarkdown
          components={{
            pre: ({node, ...props}) => <pre {...props} className="bg-gray-200 dark:bg-gray-800 rounded p-2 overflow-x-auto" />,
            code: ({node, ...props}) => <code {...props} className="bg-gray-200 dark:bg-gray-800 rounded px-1" />,
            ul: ({node, ...props}) => <ul {...props} className="pl-6 list-disc marker:text-indigo-500 dark:marker:text-indigo-300" />,
            ol: ({node, ...props}) => <ol {...props} className="pl-6 list-decimal marker:text-indigo-500 dark:marker:text-indigo-300" />,
            li: ({node, ...props}) => <li {...props} className="mb-1 pl-1" />,
          }}
        >
          {prompt}
        </ReactMarkdown>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Ce prompt est conçu pour être utilisé avec des modèles de langage comme ChatGPT, Claude ou Gemini. Sélectionnez un assistant, copiez le prompt et collez-le dans votre interface LLM préférée pour obtenir une synthèse adaptée.
      </p>
    </div>
  );
};

export default LLMPromptGenerator;
