import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import DateBar from './DateBar';

vi.useFakeTimers();

describe('DateBar', () => {
  it('renders current date and time', () => {
    vi.setSystemTime(new Date('2023-01-02T15:30:00Z'));
    const html = renderToStaticMarkup(<DateBar />);
    expect(html).toContain('2 janvier 2023');
    // time format may vary by locale; just check hour and minute
    expect(html).toMatch(/15:30/);
  });
});
