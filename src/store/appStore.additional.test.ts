import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './appStore';

const baseStory = {
  epic: '',
  userRole: 'r',
  title: 't',
  acceptanceCriteria: [],
  priority: 'Must Have' as const,
  estimation: 1,
  justification: '',
  estimatedStartDate: null,
  estimatedEndDate: null,
  dependency: '',
  status: 'todo' as const,
  kanbanOrder: 0,
  comment: '',
};

beforeEach(() => {
  useAppStore.setState({
    userStories: [],
    recalculateDates: vi.fn(),
  });
});

describe('getNextId', () => {
  it('starts at US001', () => {
    expect(useAppStore.getState().getNextId()).toBe('US001');
  });

  it('increments based on existing ids', () => {
    useAppStore.setState({
      userStories: [
        { id: 'US001', projectId: 'p', order: 0, ...baseStory },
        { id: 'US002', projectId: 'p', order: 1, ...baseStory },
      ],
    });
    expect(useAppStore.getState().getNextId()).toBe('US003');
  });
});

describe('reorderUserStories', () => {
  it('reorders stories and updates order values', async () => {
    const stories = [
      { id: '1', projectId: 'p', order: 0, ...baseStory },
      { id: '2', projectId: 'p', order: 1, ...baseStory },
      { id: '3', projectId: 'p', order: 2, ...baseStory },
    ];
    useAppStore.setState({ userStories: stories, recalculateDates: vi.fn() });
    await useAppStore.getState().reorderUserStories(0, 2);
    const ordered = useAppStore.getState().userStories;
    expect(ordered.map(s => s.id)).toEqual(['2', '3', '1']);
    expect(ordered.map(s => s.order)).toEqual([0, 1, 2]);
  });
});
