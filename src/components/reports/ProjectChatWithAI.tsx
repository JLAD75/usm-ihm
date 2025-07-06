import {
  ClipboardIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkCodeTitles from "remark-code-titles";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const ProjectChatWithAI: React.FC = () => {
  const { projects, projectId, loadUserStories, fetchProjects } = useAppStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `Tu es un assistant expert en gestion de projet agile, spécialisé dans l'analyse et la gestion des user stories et des métriques de projet. Tu as accès au projet ${projectId} et à ses données.

**🚨 RÈGLE ABSOLUE ET OBLIGATOIRE :**
- Pour toute question sur les MÉTRIQUES du projet, utilise UNIQUEMENT l'outil **get_project_metrics**
- NE JAMAIS utiliser get_project_user_stories pour les métriques
- get_project_user_stories retourne du JSON brut - NE L'UTILISE PAS pour les métriques
- Si l'utilisateur demande des métriques, des statistiques, de la progression, de la vélocité, des estimations, utilise TOUJOURS get_project_metrics

**🚨 RÈGLE ABSOLUE POUR LES MODIFICATIONS :**
- Quand l'utilisateur demande de MODIFIER une user story (changer statut, titre, etc.), utilise DIRECTEMENT l'outil d'édition correspondant
- NE JAMAIS utiliser get_project_user_stories pour les modifications
- Exemple : "modifie l'US X à 'fait'" → utilise update_user_story_status
- Exemple : "change le titre de l'US Y" → utilise update_user_story_title
- Exemple : "crée une nouvelle US" → utilise create_user_story

**🚨 RÈGLE ABSOLUE POUR LES DEMANDES EXPLICITES :**
- Si l'utilisateur demande EXPLICITEMENT de lister les user stories, utilise get_project_user_stories
- Si l'utilisateur demande EXPLICITEMENT d'utiliser un outil, utilise-le immédiatement
- NE REFUSE JAMAIS d'utiliser un outil quand l'utilisateur le demande explicitement
- Exemple : "liste les US" → utilise get_project_user_stories
- Exemple : "montre-moi les métriques" → utilise get_project_metrics

**🚨 RÈGLE ABSOLUE POUR LE FILTRAGE :**
- Si l'utilisateur demande un FILTRAGE spécifique (par statut, epic, priorité, estimation), utilise TOUJOURS get_filtered_user_stories
- Exemple : "US terminées" → utilise get_filtered_user_stories avec status="done"
- Exemple : "US de l'epic recherche" → utilise get_filtered_user_stories avec epic="recherche"
- Exemple : "US avec plus de 3 jours" → utilise get_filtered_user_stories avec minEstimation=3
- Exemple : "US prioritaires" → utilise get_filtered_user_stories avec priority="high"
- Exemple : "US sans critères d'acceptation" → utilise get_filtered_user_stories avec hasAcceptanceCriteria=false

**Instructions CRITIQUES :**
- Les outils retournent déjà des données formatées en Markdown avec tableaux - NE LES REFORMATE PAS
- Sois concis et direct dans tes réponses
- Si une donnée n'est pas disponible, dis-le clairement
- Utilise les tableaux et formats Markdown pour une présentation claire

**Outils d'analyse disponibles :**
- **get_project_metrics** : MÉTRIQUES du projet (progression, vélocité, estimations)
- **get_sprint_analysis** : Analyse d'un sprint spécifique
- **get_user_story_details** : Détails d'une story spécifique
- **get_user_story_by_title** : Détails d'une user story spécifique par son titre
- **get_filtered_user_stories** : Filtrage avancé des user stories (statut, epic, priorité, estimation, dates, critères d'acceptation)
- **get_project_user_stories** : Liste des stories (JSON brut - utiliser quand demandé explicitement)

**Outils d'édition disponibles :**
- **create_user_story** : Créer une nouvelle user story (tous champs principaux)
- **update_user_story_title** : Modifier le titre d'une user story
- **update_user_story_epic** : Modifier l'epic d'une user story
- **update_user_story_user_role** : Modifier le rôle utilisateur d'une user story
- **update_user_story_justification** : Modifier la justification d'une user story
- **update_user_story_estimation** : Modifier l'estimation d'une user story
- **update_user_story_priority** : Modifier la priorité d'une user story
- **update_user_story_dependency** : Modifier la dépendance d'une user story
- **update_user_story_acceptance_criteria** : Modifier les critères d'acceptation d'une user story
- **update_user_story_status** : Modifier le statut d'une user story
- **delete_user_story** : Supprimer une user story

**Exemples d'usage CONCRETS :**
- "Modifie l'US 'Import des échantillons initiaux' à 'fait'" → utilise update_user_story_status avec story_title="Import des échantillons initiaux" et status="done"
- "Change le titre de l'US X en Y" → utilise update_user_story_title
- "Crée une nouvelle US pour..." → utilise create_user_story
- "Supprime l'US X" → utilise delete_user_story
- "Liste les US" → utilise get_project_user_stories
- "Montre-moi les métriques" → utilise get_project_metrics
- "Quel est le statut de Gestion des rôles ?" → utilise get_user_story_by_title avec story_title="Gestion des rôles"
- "Détails de l'US X" → utilise get_user_story_by_title
- "Montre-moi les US terminées" → utilise get_filtered_user_stories avec status="done"
- "Liste les US de l'epic recherche" → utilise get_filtered_user_stories avec epic="recherche"
- "US avec plus de 5 jours" → utilise get_filtered_user_stories avec minEstimation=5
- "US sans critères d'acceptation" → utilise get_filtered_user_stories avec hasAcceptanceCriteria=false

**Consigne OBLIGATOIRE :**
- Si l'utilisateur demande une MODIFICATION, utilise DIRECTEMENT l'outil d'édition correspondant
- Si l'utilisateur demande EXPLICITEMENT de lister les user stories, utilise get_project_user_stories
- Si l'utilisateur demande le statut ou les détails d'une user story spécifique, utilise get_user_story_by_title
- Si l'utilisateur demande un FILTRAGE spécifique (par statut, epic, priorité, estimation, etc.), utilise get_filtered_user_stories
- NE JAMAIS refuser d'utiliser un outil quand l'utilisateur le demande explicitement
- Exécute l'action demandée et retourne le résultat de l'outil
- Si tu ne trouves pas la user story, utilise d'abord get_user_story_details pour la localiser

**Style de réponse :**
- Pour les modifications : exécute directement l'outil et affiche le résultat
- Pour les métriques : affiche directement le résultat de get_project_metrics
- Pour les listes demandées explicitement : utilise get_project_user_stories
- Pour les filtrages spécifiques : utilise get_filtered_user_stories
- Pour les détails d'une user story spécifique : utilise get_user_story_by_title
- Pour les autres questions : sois concis et direct
- Les tableaux sont déjà optimisés pour ReactMarkdown - ne les modifie pas
      `,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  // Refs pour chaque message (pour la copie du texte affiché)
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const apiKey =
    typeof window !== "undefined"
      ? localStorage.getItem("openai_api_key") || ""
      : "";
  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    chatInputRef.current?.focus();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey || !currentProject) return;
    setLoading(true);
    setError("");
    let aiMessage = "";
    let hasModifications = false; // Flag pour détecter les modifications
    
    // Ajout : on conserve tout l'historique pour la conversation
    // Tronquer l'historique pour ne pas dépasser la fenêtre de contexte (10 derniers messages hors system)
    const maxHistory = 10;
    const model = "gpt-4o-mini"; // Correction du nom du modèle
    const systemMsg = messages[0];
    const userMsg = { role: "user", content: input };
    const historyWithoutSystem = [...messages.slice(1), userMsg];
    const truncatedHistory = historyWithoutSystem.slice(-maxHistory);
    const newMessages = [systemMsg, ...truncatedHistory];
    setMessages(newMessages);
    setInput("");
    try {
      const requestBody = {
        model,
        prompt: "", // prompt n'est plus utilisé
        openaiApiKey: apiKey,
        history: newMessages, // on envoie l'historique tronqué
        tools: true, // Désactiver temporairement les outils MCP pour tester
      };
      

      
      // Utilisation d'EventSource pour une meilleure gestion du streaming
      return new Promise<void>((resolve, reject) => {
        // Créer un EventSource pour recevoir les données
        const eventSource = new EventSource(`${API_BASE_URL}/ai-chat-stream-events`);
        
        // Envoyer les données via POST séparé
        fetch(`${API_BASE_URL}/ai-chat-stream-init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }).catch(err => {
          console.error("Erreur lors de l'envoi des données:", err);
          let errorMessage = "Erreur lors de l'envoi de la requête.";
          
          if (err.message.includes("401") || err.message.includes("Unauthorized")) {
            errorMessage = "Clé API OpenAI invalide ou manquante. Vérifiez votre configuration.";
          } else if (err.message.includes("403") || err.message.includes("Forbidden")) {
            errorMessage = "Accès refusé. Vérifiez vos permissions OpenAI.";
          } else if (err.message.includes("429") || err.message.includes("Too Many Requests")) {
            errorMessage = "Trop de requêtes. Veuillez attendre quelques minutes avant de réessayer.";
          } else if (err.message.includes("500") || err.message.includes("Internal Server Error")) {
            errorMessage = "Erreur interne du serveur. Veuillez réessayer plus tard.";
          }
          
          setError(errorMessage);
          eventSource.close();
          reject(err);
        });
        
        eventSource.onopen = () => {
          // Connexion établie
        };
        
        eventSource.onmessage = (event) => {
          try {
            const chunk = JSON.parse(event.data);
            
            // Message de connexion - on l'ignore mais on continue à lire
            if (chunk.type === "connected") {
              return;
            }
            

            
            // Format OpenAI chat completions
            if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
              const delta = chunk.choices[0].delta;
              if (delta.content) {
                aiMessage += delta.content;
                setMessages((msgs) => {
                  const last = msgs[msgs.length - 1];
                  if (last && last.role === "assistant") {
                    return [
                      ...msgs.slice(0, -1),
                      { role: "assistant", content: aiMessage },
                    ];
                  } else {
                    return [
                      ...msgs,
                      { role: "assistant", content: aiMessage },
                    ];
                  }
                });
              }
              
              // Si finish_reason est présent, la réponse est terminée
              if (chunk.choices[0].finish_reason) {
                // Détecter les modifications dans la réponse complète
                console.log("🔍 Analyse de la réponse IA pour détecter les modifications");
                console.log("📝 Contenu de la réponse:", aiMessage);
                
                if (aiMessage.includes("✅ Nouvelle user story créée") || 
                    aiMessage.includes("✏️ User story modifiée") || 
                    aiMessage.includes("🗑️ User story supprimée")) {
                  hasModifications = true;
                  console.log("✅ Modification détectée dans la réponse IA");
                } else {
                  console.log("❌ Aucune modification détectée dans la réponse IA");
                }
                
                clearTimeout(timeoutId); // Annuler le timeout
                eventSource.close();
                
                // Recharger les données si des modifications ont été détectées
                if (hasModifications && projectId !== null) {
                  // Utiliser une fonction async immédiatement invoquée
                  (async () => {
                    try {
                      console.log("🔄 Détection de modification - début du rechargement automatique");
                      
                      // Petit délai pour s'assurer que la modification est bien terminée côté serveur
                      await new Promise(resolveDelay => setTimeout(resolveDelay, 1000));
                      
                      // Recharger les projets et les user stories
                      await fetchProjects();
                      await loadUserStories(projectId as string);
                      
                      console.log("✅ Données rechargées automatiquement après modification IA");
                      
                      // Forcer un re-render global en émettant un événement personnalisé
                      window.dispatchEvent(new CustomEvent('userStoriesUpdated'));
                      
                    } catch (error) {
                      console.error("Erreur lors du rechargement automatique:", error);
                    }
                  })();
                } else {
                  console.log("ℹ️ Aucune modification détectée, pas de rechargement automatique");
                }
                
                resolve();
              }
            }
            
            if (chunk.error) {
              // Gestion des erreurs spécifiques à OpenAI
              let errorMessage = chunk.error;
              
              // Traduire les erreurs courantes d'OpenAI
              if (chunk.error.includes("rate_limit")) {
                errorMessage = "Limite de requêtes OpenAI atteinte. Veuillez réessayer dans quelques minutes.";
              } else if (chunk.error.includes("quota_exceeded")) {
                errorMessage = "Quota OpenAI dépassé. Vérifiez votre compte OpenAI.";
              } else if (chunk.error.includes("invalid_api_key")) {
                errorMessage = "Clé API OpenAI invalide. Vérifiez votre configuration.";
              } else if (chunk.error.includes("insufficient_quota")) {
                errorMessage = "Crédits OpenAI insuffisants. Rechargez votre compte.";
              } else if (chunk.error.includes("model_not_found")) {
                errorMessage = "Modèle OpenAI non disponible. Contactez l'administrateur.";
              } else if (chunk.error.includes("context_length_exceeded")) {
                errorMessage = "Limite de contexte dépassée. Essayez une question plus courte.";
              }
              
              clearTimeout(timeoutId); // Annuler le timeout
              setError(errorMessage);
              eventSource.close();
              reject(new Error(errorMessage));
            }
          } catch (parseError) {
            console.error("Erreur parsing JSON:", parseError);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error("Erreur EventSource:", error);
          clearTimeout(timeoutId); // Annuler le timeout
          setError("Problème de connexion au serveur. Vérifiez votre connexion internet et réessayez.");
          eventSource.close();
          reject(error);
        };
        
        // Timeout de sécurité - augmenté pour les outils MCP
        const timeoutId = setTimeout(() => {
          eventSource.close();
          setError("Délai d'attente dépassé. La réponse de l'IA prend trop de temps.");
          reject(new Error("Timeout de la réponse"));
        }, 120000); // 2 minutes pour permettre l'exécution des outils MCP
      });
      
      setInput("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Utilitaire pour copier dans le presse-papier
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  // Utilitaire pour copier le texte affiché d'un élément (hors markdown brut)
  const copyElementText = (element: HTMLElement | null) => {
    if (!element) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);
    try {
      document.execCommand("copy");
    } catch { }
    selection?.removeAllRanges();
  };

  // Copie de toute la conversation (hors message system)
  const handleCopyConversation = async () => {
    // On copie le texte affiché de tous les messages (hors system)
    const allText = messageRefs.current
      .slice(0, messages.length - 1)
      .map((ref) => ref?.innerText || "")
      .join("\n\n");
    await copyToClipboard(allText);
  };

  // Fonction de rechargement manuel pour debug
  const handleManualReload = async () => {
    if (projectId) {
      console.log("🔄 Rechargement manuel des données");
      await fetchProjects();
      await loadUserStories(projectId);
      console.log("✅ Rechargement manuel terminé");
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 relative">
      {/* Boutons de debug */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={handleManualReload}
          className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:bg-indigo-50 dark:hover:bg-indigo-800 transition z-10"
          title="Recharger les données (debug)"
        >
          🔄
        </button>
        <button
          onClick={handleCopyConversation}
          className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:bg-indigo-50 dark:hover:bg-indigo-800 transition z-10"
          title="Copier toute la conversation"
        >
          <DocumentDuplicateIcon className="w-5 h-5 text-indigo-600" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0 mb-2 px-2">
        {messages.slice(1).map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`relative group flex ${isUser ? "justify-end" : "justify-start"
                  } w-full`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl shadow-md px-2 py-1 whitespace-pre-line break-words relative ${isUser
                      ? "bg-linear-to-br from-indigo-500 to-violet-600 text-white ml-16 rounded-br-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-16 rounded-bl-md"
                    }`}
                  ref={(el) => {
                    messageRefs.current[i] = el;
                  }}
                >
                  {/* Bouton copier le message, superposé en haut à droite de la bulle */}
                  <button
                    onClick={() => copyElementText(messageRefs.current[i])}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow hover:bg-indigo-50 dark:hover:bg-indigo-800 opacity-0 group-hover:opacity-100 transition z-10"
                    title="Copier ce message"
                  >
                    <ClipboardIcon className="w-4 h-4 text-indigo-500" />
                  </button>
                  <span className="block text-xs mb-0 font-semibold opacity-60 flex items-center gap-2">
                    {isUser ? (
                      user?.photos && user.photos[0]?.value ? (
                        <img
                          src={user.photos[0].value}
                          alt={user.displayName || "Vous"}
                          className="w-5 h-5 rounded-full object-cover border border-indigo-300 shadow-sm bg-white inline-block align-middle"
                        />
                      ) : (
                        <span className="inline-block align-middle">Vous</span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-indigo-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        IA
                      </span>
                    )}
                  </span>
                  {isUser ? (
                    <span>{msg.content}</span>
                  ) : (
                    <div className="prose prose-indigo dark:prose-invert animate-appear relative max-w-none !leading-tight [&>*]:mb-0 [&>*:last-child]:mb-0 [&>p]:mb-0 [&>h1]:mb-0 [&>h2]:mb-0 [&>h3]:mb-0 [&>blockquote]:mb-0 [&>ul]:mb-0 [&>ol]:mb-0 [&>table]:mb-0 [&>pre]:mb-0 [&>hr]:my-0">
                      <ReactMarkdown
                        remarkPlugins={[
                          remarkGfm,
                          remarkBreaks,
                          remarkEmoji,
                          remarkCodeTitles,
                        ]}
                        components={{
                          table({ node, ...props }) {
                            const tableRef = useRef<HTMLTableElement>(null);
                            return (
                              <div className="relative group my-0 overflow-x-auto">
                                <button
                                  onClick={() =>
                                    copyElementText(tableRef.current)
                                  }
                                  className="absolute top-1 right-1 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow hover:bg-indigo-50 dark:hover:bg-indigo-800 opacity-0 group-hover:opacity-100 transition z-10"
                                  title="Copier ce tableau"
                                >
                                  <ClipboardIcon className="w-4 h-4 text-indigo-500" />
                                </button>
                                <table 
                                  ref={tableRef} 
                                  {...props} 
                                  className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm my-0"
                                />
                              </div>
                            );
                          },
                          th({ node, ...props }) {
                            return (
                              <th 
                                {...props} 
                                className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 !m-0 !p-1"
                              />
                            );
                          },
                          td({ node, ...props }) {
                            return (
                              <td 
                                {...props} 
                                className="px-4 py-1 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 !m-0 !p-1"
                              />
                            );
                          },
                          tr({ node, ...props }) {
                            return (
                              <tr 
                                {...props} 
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors !m-0"
                              />
                            );
                          },
                          p({ node, ...props }) {
                            return (
                              <p 
                                {...props} 
                                className="mb-0 mt-0 leading-tight"
                              />
                            );
                          },
                          h1({ node, ...props }) {
                            return (
                              <h1 
                                {...props} 
                                className="mb-0 mt-0 leading-tight"
                              />
                            );
                          },
                          h2({ node, ...props }) {
                            return (
                              <h2 
                                {...props} 
                                className="mb-0 mt-0 leading-tight"
                              />
                            );
                          },
                          h3({ node, ...props }) {
                            return (
                              <h3 
                                {...props} 
                                className="mb-0 mt-0 leading-tight"
                              />
                            );
                          },
                          blockquote({ node, ...props }) {
                            return (
                              <blockquote 
                                {...props} 
                                className="mb-0 mt-0 border-l-4 border-indigo-200 dark:border-indigo-700 pl-2 italic leading-tight"
                              />
                            );
                          },
                          ul({ node, ...props }) {
                            return (
                              <ul 
                                {...props} 
                                className="mb-0 mt-0 leading-tight"
                              />
                            );
                          },
                          ol({ node, ...props }) {
                            return (
                              <ol 
                                {...props} 
                                className="mb-0 mt-0 leading-tight"
                              />
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      {loading && (
        <div className="flex items-center justify-center mb-2">
          <svg
            className="animate-spin h-6 w-6 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="ml-2 text-indigo-600 dark:text-indigo-300">
            L'IA analyse les données du projet...
          </span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Erreur OpenAI
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
              <button 
                onClick={() => setError("")}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-2 underline"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2 mt-2 items-end">
        <textarea
          ref={chatInputRef}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
          placeholder="Posez une question sur ce projet..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          rows={5}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading || !input.trim() || !apiKey}
        >
          Envoyer
        </button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Appuyez sur <span className="font-semibold">Entrée</span> pour une
        nouvelle ligne, <span className="font-semibold">Ctrl+Entrée</span> pour
        envoyer.
      </div>
      {!apiKey && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          Configurez votre clé OpenAI dans les paramètres pour activer le chat
          IA.
        </div>
      )}
    </div>
  );
};

export default ProjectChatWithAI;
