import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LoadingScreen from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders loading text', () => {
    const html = renderToStaticMarkup(<LoadingScreen />);
    expect(html).toContain('Chargement');
  });
});
