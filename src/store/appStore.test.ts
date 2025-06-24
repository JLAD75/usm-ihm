import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './appStore';

const workdays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

beforeEach(() => {
  useAppStore.setState({
    userStories: [],
    settings: {
      projectStartDate: new Date('2023-01-02'),
      workdays,
      holidays: [],
    },
  });
});

describe('recalculateDates', () => {
  it('assigns start and end dates based on estimation and workdays', () => {
    useAppStore.setState(() => ({
      userStories: [
        {
          id: '1',
          projectId: 'test-project',
          order: 0,
          epic: '',
          userRole: 'role',
          title: 'story1',
          acceptanceCriteria: [],
          priority: 'Must Have',
          estimation: 2,
          justification: '',
          estimatedStartDate: null,
          estimatedEndDate: null,
          dependency: '',
          status: 'todo',
          kanbanOrder: 0,
          comment: '',
        },
        {
          id: '2',
          projectId: 'test-project',
          order: 1,
          epic: '',
          userRole: 'role',
          title: 'story2',
          acceptanceCriteria: [],
          priority: 'Must Have',
          estimation: 3,
          justification: '',
          estimatedStartDate: null,
          estimatedEndDate: null,
          dependency: '',
          status: 'todo',
          kanbanOrder: 0,
          comment: '',
        },
        {
          id: '3',
          projectId: 'test-project',
          order: 2,
          epic: '',
          userRole: 'role',
          title: 'story3',
          acceptanceCriteria: [],
          priority: 'Must Have',
          estimation: 1,
          justification: '',
          estimatedStartDate: null,
          estimatedEndDate: null,
          dependency: '',
          status: 'todo',
          kanbanOrder: 0,
          comment: '',
        },
      ],
    }));

    useAppStore.getState().recalculateDates();

    const [s1, s2, s3] = useAppStore.getState().userStories;
    expect(s1.estimatedStartDate?.toISOString()).toBe('2023-01-02T00:00:00.000Z');
    expect(s1.estimatedEndDate?.toISOString()).toBe('2023-01-03T00:00:00.000Z');
    expect(s2.estimatedStartDate?.toISOString()).toBe('2023-01-04T00:00:00.000Z');
    expect(s2.estimatedEndDate?.toISOString()).toBe('2023-01-06T00:00:00.000Z');
    expect(s3.estimatedStartDate?.toISOString()).toBe('2023-01-09T00:00:00.000Z');
    expect(s3.estimatedEndDate?.toISOString()).toBe('2023-01-09T00:00:00.000Z');
  });
});
