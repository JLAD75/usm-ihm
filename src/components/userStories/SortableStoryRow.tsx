import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DraggableRow from './DraggableRow';

interface SortableStoryRowProps {
  story: any;
  settings: any;
  setStoryToDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  formatDate: (date: Date | null) => string;
  renderCriteria?: (compactMode: boolean, story: any) => React.ReactNode;
  compactMode?: boolean;
  onComment: (story: any) => void;
}

const SortableStoryRow: React.FC<SortableStoryRowProps> = React.memo((props) => {
  const { story, settings, setStoryToDelete, ...rest } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <DraggableRow
      {...rest}
      story={story}
      setNodeRef={setNodeRef}
      listeners={listeners}
      attributes={attributes}
      isDragging={isDragging}
      style={style}
      settings={settings}
      setStoryToDelete={setStoryToDelete}
    />
  );
});

export default SortableStoryRow;
