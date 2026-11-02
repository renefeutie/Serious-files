import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Landscape & Adaptive UI Architecture Verification', () => {
  const indexCss = fs.readFileSync(path.resolve(__dirname, '../index.css'), 'utf-8');
  const headerTsx = fs.readFileSync(path.resolve(__dirname, '../components/Header.tsx'), 'utf-8');
  const bottomNavTsx = fs.readFileSync(path.resolve(__dirname, '../components/BottomNav.tsx'), 'utf-8');
  const roleModalTsx = fs.readFileSync(path.resolve(__dirname, '../components/RoleSelectionModal.tsx'), 'utf-8');
  const proModalTsx = fs.readFileSync(path.resolve(__dirname, '../components/ProRegistrationModal.tsx'), 'utf-8');
  const cookieBannerTsx = fs.readFileSync(path.resolve(__dirname, '../components/CookieConsentBanner.tsx'), 'utf-8');
  const mapExplorerTsx = fs.readFileSync(path.resolve(__dirname, '../components/NeighborhoodMapExplorer.tsx'), 'utf-8');
  const artisanDetailTsx = fs.readFileSync(path.resolve(__dirname, '../views/ArtisanDetailView.tsx'), 'utf-8');

  it('defines safe area insets and landscape helpers in global CSS', () => {
    expect(indexCss).toContain('.pl-safe');
    expect(indexCss).toContain('.pr-safe');
    expect(indexCss).toContain('env(safe-area-inset-left');
    expect(indexCss).toContain('env(safe-area-inset-right');
    expect(indexCss).toContain('@media (orientation: landscape)');
    expect(indexCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('optimizes Header for landscape mode to prevent viewport hogging', () => {
    // Header should reduce height in landscape on mobile to preserve vertical space
    expect(headerTsx).toContain('landscape:h-12');
    expect(headerTsx).toContain('pl-safe');
    expect(headerTsx).toContain('pr-safe');
  });

  it('compacts BottomNav in landscape with horizontal tab arrangement', () => {
    expect(bottomNavTsx).toContain('landscape:h-11');
    expect(bottomNavTsx).toContain('landscape:flex-row');
    expect(bottomNavTsx).toContain('pl-safe');
    expect(bottomNavTsx).toContain('pr-safe');
  });

  it('arranges RoleSelectionModal buttons in 2 columns in landscape', () => {
    expect(roleModalTsx).toContain('landscape:grid-cols-2');
    expect(roleModalTsx).toContain('max-h-[92dvh]');
    expect(roleModalTsx).toContain('overflow-y-auto');
  });

  it('optimizes ProRegistrationModal for compact landscape viewports', () => {
    expect(proModalTsx).toContain('landscape:max-w-xl');
    expect(proModalTsx).toContain('landscape:max-h-[94dvh]');
    expect(proModalTsx).toContain('overflow-y-auto');
  });

  it('protects CookieConsentBanner against mobile landscape screen takeover', () => {
    expect(cookieBannerTsx).toContain('landscape:p-2.5');
    expect(cookieBannerTsx).toContain('pl-safe');
    expect(cookieBannerTsx).toContain('pr-safe');
    expect(cookieBannerTsx).toContain('pb-safe');
  });

  it('adjusts Google Maps height in landscape to prevent touch scroll lock', () => {
    expect(mapExplorerTsx).toContain('landscape:h-[280px]');
    expect(mapExplorerTsx).toContain('landscape:grid-cols-2');
  });

  it('handles ArtisanDetailView in landscape with flexible modal and responsive cover', () => {
    expect(artisanDetailTsx).toContain('landscape:h-32');
    expect(artisanDetailTsx).toContain('landscape:items-center');
    expect(artisanDetailTsx).toContain('landscape:max-h-[94dvh]');
  });
});
