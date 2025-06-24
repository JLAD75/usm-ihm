import { describe, it, expect } from 'vitest';
import { isWorkdayDate, recalculateUserStoryDates } from './dateUtils';
import type { Settings } from '../types/Settings';
import type { UserStory } from '../types/UserStory';

const workdays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

const baseSettings: Settings = {
  projectStartDate: new Date('2023-01-02'),
  workdays,
  holidays: [],
};

describe('isWorkdayDate', () => {
  it('returns false for weekend by default', () => {
    expect(isWorkdayDate(new Date('2023-01-07'), baseSettings)).toBe(false);
  });

  it('returns true when weekend is configured as workday', () => {
    const settings = { ...baseSettings, workdays: { ...workdays, saturday: true } };
    expect(isWorkdayDate(new Date('2023-01-07'), settings)).toBe(true);
  });

  it('returns false for holiday', () => {
    const settings: Settings = {
      ...baseSettings,
      holidays: [{ id: 'h1', title: 'holiday', startDate: new Date('2023-01-03'), endDate: new Date('2023-01-04') }],
    };
    expect(isWorkdayDate(new Date('2023-01-03'), settings)).toBe(false);
  });
});

describe('recalculateUserStoryDates', () => {
  it('assigns start and end dates based on estimation and workdays', () => {
    const stories: UserStory[] = [
      {
        id: '1',
        projectId: 'p',
        order: 0,
        epic: '',
        userRole: 'r',
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
        projectId: 'p',
        order: 1,
        epic: '',
        userRole: 'r',
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
        projectId: 'p',
        order: 2,
        epic: '',
        userRole: 'r',
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
    ];

    const updated = recalculateUserStoryDates(stories, baseSettings);
    const [s1, s2, s3] = updated;
    expect(s1.estimatedStartDate?.toISOString()).toBe('2023-01-02T00:00:00.000Z');
    expect(s1.estimatedEndDate?.toISOString()).toBe('2023-01-03T00:00:00.000Z');
    expect(s2.estimatedStartDate?.toISOString()).toBe('2023-01-04T00:00:00.000Z');
    expect(s2.estimatedEndDate?.toISOString()).toBe('2023-01-06T00:00:00.000Z');
    expect(s3.estimatedStartDate?.toISOString()).toBe('2023-01-09T00:00:00.000Z');
    expect(s3.estimatedEndDate?.toISOString()).toBe('2023-01-09T00:00:00.000Z');
  });
});
