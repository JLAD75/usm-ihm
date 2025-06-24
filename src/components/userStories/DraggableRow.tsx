import React from 'react';
import { TableRow, TableCell } from '../ui/table';
import { Pencil, Trash, MessageCircle } from 'lucide-react';
import { UserStory } from '../../types/UserStory';

interface DraggableRowProps {
  story: UserStory;
  onEdit: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  formatDate: (date: Date | null) => string;
  listeners?: any;
  attributes?: any;
  isDragging?: boolean;
  setNodeRef?: (el: HTMLElement | null) => void;
  style?: React.CSSProperties;
  renderCriteria?: (compactMode: boolean, story: UserStory) => React.ReactNode;
  settings: any;
  compactMode?: boolean;
  onComment: (story: UserStory) => void;
  setStoryToDelete: (id: string) => void;
}

export function getOverlapBadges(story: UserStory, settings: any) {
  if (!story.estimatedStartDate || !story.estimatedEndDate) return null;
  let hasWeekend = false;
  let hasHoliday = false;
  const start = new Date(story.estimatedStartDate);
  const end = new Date(story.estimatedEndDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) hasWeekend = true;
    for (const holiday of settings.holidays) {
      const hStartDate = (holiday.startDate instanceof Date) ? holiday.startDate : new Date(holiday.startDate);
      const hEndDate = (holiday.endDate instanceof Date) ? holiday.endDate : new Date(holiday.endDate);
      const dYMD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const hStart = new Date(hStartDate.getFullYear(), hStartDate.getMonth(), hStartDate.getDate()).getTime();
      const hEnd = new Date(hEndDate.getFullYear(), hEndDate.getMonth(), hEndDate.getDate()).getTime();
      if (dYMD >= hStart && dYMD <= hEnd) {
        hasHoliday = true;
      }
    }
    if (hasWeekend && hasHoliday) break;
  }
  if (!hasWeekend && !hasHoliday) return null;
  return (
    <span className="flex gap-1 mr-1">
      {hasHoliday && <span title="Chevauche un jour de congé" className="inline-block px-1.5 py-0.5 rounded bg-blue-100/40 dark:bg-blue-900/30 text-blue-500 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-700">C</span>}
      {hasWeekend && <span title="Chevauche un week-end" className="inline-block px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-gray-700/60 text-gray-500 dark:text-gray-300 text-[10px] font-semibold border border-gray-300 dark:border-gray-600">W</span>}
    </span>
  );
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  story,
  onEdit,
  getPriorityColor,
  formatDate,
  listeners,
  attributes,
  isDragging,
  setNodeRef,
  style,
  renderCriteria,
  settings,
  compactMode,
  onComment,
  setStoryToDelete
}) => {
  return (
    <TableRow
      ref={setNodeRef}
      data-us-id={story.id}
      style={{ ...style, willChange: isDragging ? 'transform' : undefined }}
      {...attributes}
      {...listeners}
      className={
        `border-b border-gray-300/10 dark:border-gray-700/30 relative overflow-hidden ` +
        (isDragging
          ? 'z-30 transition-none ring-2 ring-blue-400/90 ring-offset-0 shadow-[0_0_16px_4px_rgba(59,130,246,0.22),0_0_0_2px_rgba(59,130,246,0.18)] bg-linear-to-r from-blue-200/90 via-blue-100/80 to-blue-300/80 dark:from-blue-900/90 dark:via-blue-800/80 dark:to-blue-900/80 backdrop-blur-[1px] scale-[1.005] opacity-100 border-none rounded-2xl outline-none'
          : 'transition-all duration-100 hover:bg-blue-100/40 dark:hover:bg-blue-900/40 hover:shadow-[0_0_8px_1px_rgba(59,130,246,0.08)] cursor-grab bg-white/80 dark:bg-gray-900/80') +
        (compactMode ? ' us-compact-row' : '')
      }
    >
      <TableCell className={(compactMode ? 'us-compact-row ' : '') + (isDragging ? 'rounded-l-2xl' : '')} style={isDragging ? {overflow: 'hidden'} : {}}>{story.epic}</TableCell>
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>{story.id}</TableCell>
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>{story.title}</TableCell>
      { !compactMode && (
        <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>
          {story.userRole || '-'}
        </TableCell>
      )}
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(story.priority)}`}>{story.priority}</span>
      </TableCell>
      {renderCriteria ? renderCriteria(compactMode ?? false, story) : null}
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>{story.estimation} j</TableCell>
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>
        <span className="flex items-center gap-1">
          {getOverlapBadges(story, settings)}
          {formatDate(story.estimatedStartDate)}
        </span>
      </TableCell>
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>{formatDate(story.estimatedEndDate)}</TableCell>
      <TableCell className={compactMode ? 'us-compact-row' : ''} style={isDragging ? {overflow: 'hidden'} : {}}>{story.dependency || '-'}</TableCell>
      <TableCell className={(compactMode ? 'us-compact-row ' : '') + (isDragging ? 'rounded-r-2xl' : '') + ' text-right'} style={isDragging ? {overflow: 'hidden'} : {}}>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(story.id)}
            className="w-8 h-10 p-0.5 px-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 focus:outline-none focus:ring-0 transition-colors flex items-center justify-center"
            title="Modifier"
            style={{ lineHeight: 0 }}
          >
            <Pencil className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mx-auto my-auto" />
          </button>
          <button
            onClick={() => setStoryToDelete(story.id)}
            className="w-8 h-10 p-0.5 px-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-0 transition-colors flex items-center justify-center"
            title="Supprimer"
            style={{ lineHeight: 0 }}
          >
            <Trash className="h-4 w-4 text-red-600 dark:text-red-400 mx-auto my-auto" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
            onClick={() => onComment(story)}
            className={`w-8 h-10 p-0.5 px-1 rounded-md text-xs flex items-center justify-center gap-1 transition-colors duration-150 focus:outline-none focus:ring-0 border
              ${story.comment ? 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700' : 'bg-transparent text-gray-400 border-transparent dark:bg-transparent dark:text-gray-400 dark:border-transparent'}
              hover:bg-yellow-100 dark:hover:bg-yellow-800`}
            title={story.comment ? 'Voir/modifier le commentaire' : 'Ajouter un commentaire'}
            style={{ lineHeight: 0 }}
          >
            <span className="flex items-center justify-center w-full">
              <MessageCircle className="w-3.5 h-3.5" />
              {story.comment && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />}
            </span>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default DraggableRow;
