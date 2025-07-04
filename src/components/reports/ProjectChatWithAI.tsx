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
  const { projects, projectId } = useAppStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `Tu es un assistant expert en gestion de projet agile. Tu as accès à la structure du projet et à ses user stories. L'id du projet est ${projectId}. Tu peux répondre aux questions sur ce projet en utilisant les informations disponibles dans les user stories et la structure du projet. Si tu ne sais pas, réponds "Je ne sais pas".
      Tes réponses peuvent utiliser la syntaxe Markdown (titres, listes, tableaux, etc.), car elles sont affichées dans un composant compatible Markdown.
      Tu peux utiliser les outils suivants :
      - **list_projects** : pour lister les projets disponibles.
      - **get_project_user_stories** : pour obtenir les user stories d'un projet spécifique.
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
    // Ajout : on conserve tout l'historique pour la conversation
    // Tronquer l'historique pour ne pas dépasser la fenêtre de contexte (10 derniers messages hors system)
    const maxHistory = 10;
    const model = "gpt-4.1-mini"; // ou le modèle que vous utilisez
    const systemMsg = messages[0];
    const userMsg = { role: "user", content: input };
    const historyWithoutSystem = [...messages.slice(1), userMsg];
    const truncatedHistory = historyWithoutSystem.slice(-maxHistory);
    const newMessages = [systemMsg, ...truncatedHistory];
    setMessages(newMessages);
    try {
      const response = await fetch(`${API_BASE_URL}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: "", // prompt n'est plus utilisé
          openaiApiKey: apiKey,
          history: newMessages, // on envoie l'historique tronqué
          tools: [
            {
              type: "mcp",
              server_label: "jladmin",
              server_url: "https://api.jladmin.fr/mcp",
              allowed_tools: ["list_projects", "get_project_user_stories"],
              require_approval: "never",
            },
          ],
        }),
      });
	  if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
		  `Erreur lors de la requête à l'API : ${response.status} - ${errorText}`
		);
	  }
      if (!response.body) throw new Error("Pas de flux de réponse");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = "";
      while (!done) {
		console.log("Lecture du flux de réponse...");
        const { value, done: doneReading } = await reader.read();
		if(value===undefined) {done = false;}
		console.log("Valeur lue :", value);
		console.log("Lecture terminée :", doneReading);
        //done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\n\n/);
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.replace("data: ", "").trim();
			  console.log("Chunk reçu :", json);
              if (json && json !== "[DONE]") {
                try {
                  const chunk = JSON.parse(json);
                  if (
                    chunk.type === "response.output_text.delta" &&
                    chunk.delta
                  ) {
                    aiMessage += chunk.delta;
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
                  if (
                    chunk.type === "response.output_text.done" &&
                    chunk.text
                  ) {
                    aiMessage = chunk.text;
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
                  if (chunk.error) setError(chunk.error);
                } catch {}
              }
            }
          }
        }
      }
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
    } catch {}
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

  return (
    <div className="flex flex-col h-[80vh] max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 relative">
      {/* Bouton copier toute la conversation */}
      <button
        onClick={handleCopyConversation}
        className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow hover:bg-indigo-50 dark:hover:bg-indigo-800 transition z-10"
        title="Copier toute la conversation"
      >
        <DocumentDuplicateIcon className="w-5 h-5 text-indigo-600" />
      </button>
      <div className="flex-1 overflow-y-auto space-y-4 mb-2 px-2">
        {messages.slice(1).map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              className={`flex w-full ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative group flex ${
                  isUser ? "justify-end" : "justify-start"
                } w-full`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl shadow-md px-4 py-3 whitespace-pre-line break-words relative ${
                    isUser
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
                  <span className="block text-xs mb-1 font-semibold opacity-60 flex items-center gap-2">
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
                    <div className="prose prose-indigo dark:prose-invert animate-appear relative">
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
                              <div className="relative group">
                                <button
                                  onClick={() =>
                                    copyElementText(tableRef.current)
                                  }
                                  className="absolute top-1 right-1 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow hover:bg-indigo-50 dark:hover:bg-indigo-800 opacity-0 group-hover:opacity-100 transition z-10"
                                  title="Copier ce tableau"
                                >
                                  <ClipboardIcon className="w-4 h-4 text-indigo-500" />
                                </button>
                                <table ref={tableRef} {...props} />
                              </div>
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
            L'IA prépare sa réponse...
          </span>
        </div>
      )}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mb-2">
          {error}
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
