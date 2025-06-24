import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    Clock,
    Edit2,
    Flag,
    MessageSquare,
    Trash2,
    User
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../lib/mobileUtils';
import { useAppStore } from '../../store/appStore';
import { UserStory } from '../../types/UserStory';
import CommentModal from './CommentModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DependencyBlockModal from './DependencyBlockModal';

interface UserStoriesMobileViewProps {
  onEdit: (id: string) => void;
  viewMode: 'cards' | 'list';
}

const UserStoriesMobileView: React.FC<UserStoriesMobileViewProps> = ({ onEdit, viewMode }) => {
  const { userStories, deleteUserStory, reorderUserStories, updateUserStory, projectId } = useAppStore();
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [blockModal, setBlockModal] = useState<{open: boolean, storyId: string | null, dependencyId: string | null}>({
    open: false, 
    storyId: null, 
    dependencyId: null
  });
  const [commentModal, setCommentModal] = useState<{open: boolean, story: UserStory | null}>({
    open: false, 
    story: null
  });
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  const sortedStories = [...userStories]
    .filter(s => s.projectId === projectId)
    .sort((a, b) => a.order - b.order);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Non définie';
    return format(date, 'dd MMM yyyy', { locale: fr });
  };

  const toggleExpanded = (storyId: string) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedStories(newExpanded);
  };

  const isExpanded = (storyId: string) => expandedStories.has(storyId);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <Flag className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const handleDelete = (id: string) => {
    setStoryToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (storyToDelete) {
      deleteUserStory(storyToDelete);
      setStoryToDelete(null);
    }
  };

  const handleMoveUp = (story: UserStory) => {
    const currentIndex = sortedStories.findIndex(s => s.id === story.id);
    if (currentIndex > 0) {
      reorderUserStories(currentIndex, currentIndex - 1);
    }
  };

  const handleMoveDown = (story: UserStory) => {
    const currentIndex = sortedStories.findIndex(s => s.id === story.id);
    if (currentIndex < sortedStories.length - 1) {
      reorderUserStories(currentIndex, currentIndex + 1);
    }
  };

  const handleCommentClick = (story: UserStory) => {
    setCommentModal({ open: true, story });
  };

  const handleSaveComment = (comment: string) => {
    if (commentModal.story) {
      updateUserStory(commentModal.story.id, { comment });
      setCommentModal({ open: false, story: null });
    }
  };

  if (sortedStories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune User Story</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez votre première User Story pour commencer.
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 p-4">
          {sortedStories.map((story, index) => (
            <div
              key={story.id}
              className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                      {story.id}
                    </span>
                    <div className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white",
                      getPriorityColor(story.priority)
                    )}>
                      {getPriorityIcon(story.priority)}
                      <span className="ml-1">{story.priority}</span>
                    </div>
                    {/* Indicateur de commentaire */}
                    {story.comment && story.comment.trim() && (
                      <div className="relative">
                        <div className="bg-blue-50 dark:bg-blue-950/50 p-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                          <MessageSquare className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveUp(story)}
                      disabled={index === 0}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed touch-target-small"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(story)}
                      disabled={index === sortedStories.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed touch-target-small"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(story.id)}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 touch-target-small"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 touch-target-small"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                  {story.title}
                </h3>
                
                {/* Epic & Role */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Epic:</span>
                    <span className="font-medium truncate">{story.epic}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium truncate">{story.userRole}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">Début</div>
                      <div className="font-medium">{formatDate(story.estimatedStartDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">Fin</div>
                      <div className="font-medium">{formatDate(story.estimatedEndDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Estimation & Comments */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Estimation:</span>
                    <span className="font-medium">{story.estimation} jours</span>
                  </div>
                  <button
                    onClick={() => handleCommentClick(story)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all touch-target-small",
                      story.comment && story.comment.trim() 
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/30"
                        : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    )}
                  >
                    <div className="relative">
                      <MessageSquare className="h-4 w-4" />
                      {story.comment && story.comment.trim() && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {story.comment && story.comment.trim() ? 'Commentaire' : 'Commenter'}
                    </span>
                  </button>
                </div>

                {/* Dependency */}
                {story.dependency && (
                  <div className="flex items-center space-x-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-gray-600 dark:text-gray-400">Dépend de:</span>
                    <span className="font-medium">{story.dependency}</span>
                  </div>
                )}

                {/* Acceptance Criteria - Collapsible */}
                {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <button
                      onClick={() => toggleExpanded(story.id)}
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>Critères d'acceptation ({story.acceptanceCriteria.length})</span>
                      </div>
                      {isExpanded(story.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isExpanded(story.id) && (
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {story.acceptanceCriteria.map((criterion, index) => (
                          <div 
                            key={index}
                            className="flex items-start space-x-2 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {typeof criterion === 'object' && criterion.checkedDev ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <span className={cn(
                              "text-gray-700 dark:text-gray-300 leading-relaxed",
                              typeof criterion === 'object' && criterion.checkedDev && "line-through text-gray-500"
                            )}>
                              {typeof criterion === 'string' ? criterion : criterion.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modales */}
        {storyToDelete && (
          <DeleteConfirmationModal
            open={!!storyToDelete}
            onClose={() => setStoryToDelete(null)}
            onConfirm={handleConfirmDelete}
            userStory={sortedStories.find(s => s.id === storyToDelete) || null}
          />
        )}

        {blockModal.open && (
          <DependencyBlockModal
            open={blockModal.open}
            onClose={() => setBlockModal({open: false, storyId: null, dependencyId: null})}
            dependencyId={blockModal.dependencyId}
          />
        )}

        {commentModal.open && commentModal.story && (
          <CommentModal
            open={commentModal.open}
            onClose={() => setCommentModal({open: false, story: null})}
            initialComment={commentModal.story.comment || ''}
            onSave={handleSaveComment}
          />
        )}
      </>
    );
  }

  // List view (compact)
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedStories.map((story, index) => (
          <div
            key={story.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                    {story.id}
                  </span>
                  <div className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white",
                    getPriorityColor(story.priority)
                  )}>
                    {story.priority}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {story.epic}
                  </span>
                  {/* Indicateur de commentaire */}
                  {story.comment && story.comment.trim() && (
                    <div className="relative">
                      <div className="bg-blue-50 dark:bg-blue-950/50 p-0.5 rounded-full">
                        <MessageSquare className="h-2.5 w-2.5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
                  {story.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{story.userRole}</span>
                  <span>{story.estimation}j</span>
                  <span>{formatDate(story.estimatedStartDate)}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => handleMoveUp(story)}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 touch-target-small"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(story)}
                  disabled={index === sortedStories.length - 1}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 touch-target-small"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCommentClick(story)}
                  className={cn(
                    "p-1.5 rounded touch-target-small relative transition-all",
                    story.comment && story.comment.trim() 
                      ? "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-500 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  {story.comment && story.comment.trim() && (
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => onEdit(story.id)}
                  className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 touch-target-small"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 touch-target-small"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {storyToDelete && (
        <DeleteConfirmationModal
          open={!!storyToDelete}
          onClose={() => setStoryToDelete(null)}
          onConfirm={handleConfirmDelete}
          userStory={sortedStories.find(s => s.id === storyToDelete) || null}
        />
      )}

      {blockModal.open && (
        <DependencyBlockModal
          open={blockModal.open}
          onClose={() => setBlockModal({open: false, storyId: null, dependencyId: null})}
          dependencyId={blockModal.dependencyId}
        />
      )}

      {commentModal.open && commentModal.story && (
        <CommentModal
          open={commentModal.open}
          onClose={() => setCommentModal({open: false, story: null})}
          initialComment={commentModal.story.comment || ''}
          onSave={handleSaveComment}
        />
      )}
    </>
  );
};

export default UserStoriesMobileView;
