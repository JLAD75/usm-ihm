import { addDays, isWithinInterval } from 'date-fns';
import type { Settings, WorkdaySettings } from '../types/Settings';
import type { UserStory } from '../types/UserStory';

function normalizeDate(d: Date | string): Date {
  const dateObj = d instanceof Date ? d : new Date(d);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

export function isWorkdayDate(date: Date, settings: Settings): boolean {
  const day = date.getDay();
  const dayMap: Record<number, keyof WorkdaySettings> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  if (!settings.workdays[dayMap[day]]) return false;
  const normalizedDate = normalizeDate(date);
  for (const holiday of settings.holidays) {
    const start = normalizeDate(holiday.startDate);
    const end = normalizeDate(holiday.endDate);
    if (isWithinInterval(normalizedDate, { start, end })) return false;
  }
  return true;
}

export function calculateEndDate(
  startDate: Date,
  days: number,
  isWorkday: (date: Date) => boolean,
): Date {
  let endDate = new Date(startDate);
  let workdaysCount = 0;
  while (workdaysCount < days) {
    if (isWorkday(endDate)) {
      workdaysCount += 1;
      if (workdaysCount === days) break;
    }
    endDate = addDays(endDate, 1);
  }
  while (!isWorkday(endDate)) {
    endDate = addDays(endDate, 1);
  }
  return endDate;
}

export function calculateNextStartDate(
  previousEndDate: Date,
  isWorkday: (date: Date) => boolean,
): Date {
  let nextStartDate = addDays(previousEndDate, 1);
  while (!isWorkday(nextStartDate)) {
    nextStartDate = addDays(nextStartDate, 1);
  }
  return nextStartDate;
}

export function recalculateUserStoryDates(
  stories: UserStory[],
  settings: Settings,
): UserStory[] {
  if (stories.length === 0) return [];
  const sortedStories = [...stories].sort((a, b) => a.order - b.order);
  const updatedStories: UserStory[] = [];
  const isWD = (d: Date) => isWorkdayDate(d, settings);
  for (const story of sortedStories) {
    let startDate: Date;
    if (updatedStories.length === 0) {
      startDate = new Date(settings.projectStartDate);
    } else {
      const previousStory = updatedStories[updatedStories.length - 1];
      startDate = previousStory.estimatedEndDate
        ? calculateNextStartDate(previousStory.estimatedEndDate, isWD)
        : new Date(settings.projectStartDate);
    }
    const endDate = calculateEndDate(startDate, story.estimation, isWD);
    updatedStories.push({
      ...story,
      estimatedStartDate: startDate,
      estimatedEndDate: endDate,
    });
  }
  return updatedStories;
}
