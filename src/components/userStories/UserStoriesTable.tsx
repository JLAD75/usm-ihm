import React from 'react';
import { useAppStore } from '../../store/appStore';
import { format } from 'date-fns';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { UserStory } from '../../types/UserStory';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DependencyBlockModal from './DependencyBlockModal';
import CommentModal from './CommentModal';
import SortableStoryRow from './SortableStoryRow';
import './UserStoriesTable.css';


interface UserStoriesTableProps {
  onEdit: (id: string) => void;
  compactMode?: boolean;
}

const UserStoriesTable: React.FC<UserStoriesTableProps> = ({ onEdit, compactMode = false }) => {
  const { userStories, deleteUserStory, reorderUserStories, settings, updateUserStory, projectId } = useAppStore();
  const [items, setItems] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  // Ajout pour la modale de confirmation
  const [storyToDelete, setStoryToDelete] = React.useState<string | null>(null);
  // Modale de blocage dépendance
  const [blockModal, setBlockModal] = React.useState<{open: boolean, storyId: string | null, dependencyId: string | null}>({open: false, storyId: null, dependencyId: null});
  // --- Ajout pour conserver la position de scroll lors de l'édition ---
  const [commentModal, setCommentModal] = React.useState<{open: boolean, story: UserStory | null}>({open: false, story: null});



  React.useEffect(() => {
    setItems([...userStories].filter(s => s.projectId === projectId).sort((a, b) => a.order - b.order).map(s => s.id));
  }, [userStories, projectId]);



  const sortedStories: UserStory[] = React.useMemo(
    () => items.map(id => userStories.find(s => s.id === id && s.projectId === projectId)!).filter(Boolean),
    [items, userStories, projectId]
  );

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return format(date, 'dd/MM/yyyy');
  };

  const handleDelete = (id: string) => {
    deleteUserStory(id);
    setStoryToDelete(null);
  };
  const confirmDelete = () => {
    if (storyToDelete) {
      deleteUserStory(storyToDelete);
      setStoryToDelete(null);
    }
  };
  const cancelDelete = () => setStoryToDelete(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Must Have':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Should Have':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Could Have':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // dnd-kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Gestion du drag & drop et dépendances (uniquement dans le projet courant)
  const handleDragEnd = (event: any) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      // Vérification blocage dépendance dans le nouvel ordre
      const activeStory = userStories.find(s => s.id === active.id && s.projectId === projectId);
      if (activeStory && activeStory.dependency) {
        const dependencyIndex = newItems.indexOf(activeStory.dependency);
        const newActiveIndex = newItems.indexOf(active.id);
        if (newActiveIndex < dependencyIndex) {
          setBlockModal({open: true, storyId: active.id, dependencyId: activeStory.dependency});
          return;
        }
      }
      setItems(newItems);
      reorderUserStories(oldIndex, newIndex);
    }
  };

  // Suppression de la gestion dynamique de overflow/maxHeight lors du drag
  // Ajout du scroll auto lors du drag
  React.useEffect(() => {
    if (!isDragging) return;
    const container = scrollViewportRef.current;
    if (!container) return;
    let animationFrame: number;
    function onPointerMove(e: PointerEvent) {
      if (!container) return;
      const { top, bottom } = container.getBoundingClientRect();
      const scrollZone = 40; // px
      if (e.clientY < top + scrollZone) {
        container.scrollBy({ top: -12, behavior: 'auto' });
      } else if (e.clientY > bottom - scrollZone) {
        container.scrollBy({ top: 12, behavior: 'auto' });
      }
      animationFrame = requestAnimationFrame(() => {});
    }
    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [isDragging]);

  return (
    <div 
    className="overflow-x-auto custom-scrollbar"
    style={{ maxHeight: '78vh', overflowY: 'auto', marginLeft: '0.2rem', marginRight: '0.2rem' }}
    >
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-md">
        <Table style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: compactMode ? '180px' : '120px' }}/>
            <col style={{ width: '80px' }}/>
            <col style={{ width: compactMode ? '320px' : '160px' }}/>
            { !compactMode && <col style={{ width: '160px' }}/>} 
            <col style={{ width: '110px' }}/>
            { !compactMode && <col style={{ width: '340px' }}/>} 
            <col style={{ width: '100px' }}/>
            <col style={{ width: '120px' }}/>
            <col style={{ width: '120px' }}/> 
            <col style={{ width: '160px' }}/>
            <col style={{ width: '90px' }}/>
          </colgroup>
          <TableHeader>
            <TableRow className={compactMode ? 'us-compact-row' : ''}>
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={compactMode ? { width: '180px' } : { width: '120px' }}>Epic</TableHead>
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={{ width: '80px' }}>ID Story</TableHead>
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={compactMode ? { width: '320px' } : { width: '160px' }}>Titre</TableHead>
              { !compactMode && <TableHead style={{ width: '160px' }}>En tant que...</TableHead> }
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={{ width: '110px' }}>Priorité</TableHead>
              { !compactMode && <TableHead style={{ width: '340px' }}>Critères</TableHead> }
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={{ width: '100px' }}>Estimation</TableHead>
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={{ width: '120px' }}>Début</TableHead>
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={{ width: '120px' }}>Fin</TableHead>
              <TableHead className={compactMode ? 'us-compact-row' : ''} style={{ width: '160px' }}>Dépendance</TableHead>
              <TableHead className={compactMode ? 'us-compact-row text-right' : 'text-right'} style={{ width: compactMode ? '90px' : '90px' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
      <div className="w-full h-full flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: compactMode ? '180px' : '120px' }}/>
                <col style={{ width: '80px' }}/>
                <col style={{ width: compactMode ? '320px' : '160px' }}/>
                { !compactMode && <col style={{ width: '160px' }}/>} 
                <col style={{ width: '110px' }}/>
                { !compactMode && <col style={{ width: '340px' }}/>} 
                <col style={{ width: '100px' }}/>
                <col style={{ width: '120px' }}/>
                <col style={{ width: '120px' }}/>
                <col style={{ width: '160px' }}/>
                <col style={{ width: '90px' }}/>
              </colgroup>
              {/* Pas de TableHeader ici */}
              <TableBody>
                {sortedStories.map(story => (
                  <SortableStoryRow
                    key={story.id}
                    story={story}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                    renderCriteria={compactMode ? undefined : (compactMode?: boolean) => (
                      <TableCell className={compactMode ? 'us-compact-row' : ''}>
                        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {story.acceptanceCriteria.map((c, i) => (
                              <li key={i} className="text-xs whitespace-pre-line break-words">{typeof c === 'string' ? c : c.label}</li>
                            ))}
                          </ul>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                    )}
                    settings={settings}
                    compactMode={compactMode}
                    onComment={(story: UserStory) => setCommentModal({open: true, story})}
                    setStoryToDelete={setStoryToDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
      {/* Modale de confirmation de suppression */}
      <DeleteConfirmationModal
        open={!!storyToDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        userStory={storyToDelete ? userStories.find(s => s.id === storyToDelete) : null}
      />
      {/* Modale de blocage dépendance */}
      <DependencyBlockModal
        open={blockModal.open}
        onClose={() => setBlockModal({open: false, storyId: null, dependencyId: null})}
        dependencyId={blockModal.dependencyId}
      />
      {/* Modale commentaire */}
      <CommentModal
        open={commentModal.open && !!commentModal.story}
        initialComment={commentModal.story?.comment || ''}
        onClose={() => setCommentModal({open: false, story: null})}
        onSave={comment => {
          if (commentModal.story) {
            updateUserStory(commentModal.story.id, { comment });
          }
          setCommentModal({open: false, story: null});
        }}
      />
    </div>
  );
};

export default UserStoriesTable;
