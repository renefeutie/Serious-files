import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Scroll Reveal Animation Architecture Verification', () => {
  const indexCss = fs.readFileSync(path.resolve(__dirname, '../index.css'), 'utf-8');
  const scrollRevealTsx = fs.readFileSync(path.resolve(__dirname, '../components/ScrollReveal.tsx'), 'utf-8');
  const homeViewTsx = fs.readFileSync(path.resolve(__dirname, '../views/HomeView.tsx'), 'utf-8');
  const explorerViewTsx = fs.readFileSync(path.resolve(__dirname, '../views/ExplorerView.tsx'), 'utf-8');

  it('defines scroll reveal classes and hardware acceleration in index.css', () => {
    expect(indexCss).toContain('.sr-reveal');
    expect(indexCss).toContain('backface-visibility: hidden;');
  });

  it('enforces prefers-reduced-motion in global CSS to prevent animations when reduced motion is requested', () => {
    expect(indexCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(indexCss).toContain('.sr-reveal, .sr-hidden, .sr-revealed');
    expect(indexCss).toContain('opacity: 1 !important;');
    expect(indexCss).toContain('transform: none !important;');
    expect(indexCss).toContain('transition: none !important;');
  });

  it('ScrollReveal component provides singleton IntersectionObserver manager', () => {
    expect(scrollRevealTsx).toContain('class ScrollRevealObserverManager');
    expect(scrollRevealTsx).toContain('new IntersectionObserver');
    expect(scrollRevealTsx).toContain('entry.isIntersecting');
    expect(scrollRevealTsx).toContain('this.unobserve(entry.target)');
  });

  it('ScrollReveal component supports essential animation variants and stagger delays', () => {
    expect(scrollRevealTsx).toContain("'fade-up'");
    expect(scrollRevealTsx).toContain("'fade-in'");
    expect(scrollRevealTsx).toContain("'fade-left'");
    expect(scrollRevealTsx).toContain("'fade-right'");
    expect(scrollRevealTsx).toContain("'zoom-in'");
    expect(scrollRevealTsx).toContain('staggerIndex !== undefined ? staggerIndex * staggerInterval : delay');
  });

  it('ScrollReveal includes graceful degradation for environments without IntersectionObserver or with reduced motion', () => {
    expect(scrollRevealTsx).toContain("!('IntersectionObserver' in window)");
    expect(scrollRevealTsx).toContain("window.matchMedia?.('(prefers-reduced-motion: reduce)').matches");
    expect(scrollRevealTsx).toContain('setIsRevealed(true)');
  });

  it('HomeView incorporates ScrollReveal across all key sections, categories, and pro cards', () => {
    expect(homeViewTsx).toContain('<ScrollReveal variant="fade-in"');
    expect(homeViewTsx).toContain('<ScrollReveal variant="fade-up" delay={60}');
    expect(homeViewTsx).toContain('<ScrollReveal variant="fade-up" delay={120}');
    expect(homeViewTsx).toContain('staggerIndex={idx}');
    expect(homeViewTsx).toContain('staggerInterval={40}');
    expect(homeViewTsx).toContain('staggerInterval={70}');
  });

  it('ExplorerView incorporates ScrollReveal for map banner and artisan grid', () => {
    expect(explorerViewTsx).toContain('<ScrollReveal variant="fade-up" duration={450}');
    expect(explorerViewTsx).toContain('staggerIndex={idx % 6}');
    expect(explorerViewTsx).toContain('staggerInterval={50}');
  });

  it('Observer manager ensures unobserve is called once visible to prevent CPU wakeups during further scrolling', () => {
    expect(scrollRevealTsx).toContain('unobserve(entry.target)');
    expect(scrollRevealTsx).toContain('callbacks.delete(element)');
  });
});
