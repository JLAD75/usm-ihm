import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import React from "react";
import { useDeviceType } from "../../hooks/use-mobile";
import { cn } from "../../lib/mobileUtils";

interface CommentModalProps {
  open: boolean;
  initialComment: string;
  onClose: () => void;
  onSave: (comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  open,
  initialComment,
  onClose,
  onSave,
}) => {
  const { isMobile } = useDeviceType();
  const [comment, setComment] = React.useState(initialComment);

  // Synchronise le commentaire local si la modale s'ouvre sur une nouvelle story
  React.useEffect(() => {
    if (open) setComment(initialComment);
  }, [open, initialComment]);

  const handleSave = () => {
    onSave(comment);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {isMobile ? (
        // Version mobile: bottom sheet style
        <div className="fixed inset-x-0 bottom-0 z-10">
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Commentaire
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={8}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white resize-none text-base"
                placeholder="Saisissez ici un commentaire libre pour cette User Story..."
              />
            </div>

            {/* Footer avec boutons */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-medium text-white transition-colors",
                  comment.trim() === initialComment.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                )}
                disabled={comment.trim() === initialComment.trim()}
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Version desktop: modale centrée
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Commentaire
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-none text-sm"
                placeholder="Saisissez ici un commentaire libre pour cette User Story..."
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  "px-4 py-2 rounded-md font-medium text-white transition-colors",
                  comment.trim() === initialComment.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                )}
                disabled={comment.trim() === initialComment.trim()}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CommentModal;
