export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewGold: string;
  previewAccent: string;
  colors: {
    bgBase: string;
    bgElevated: string;
    bgOverlay: string;
    textPrimary: string;
    textMuted: string;
    goldPrimary: string;
    goldLight: string;
    goldDark: string;
    accent: string;
    accentHover: string;
    borderGlass: string;
  };
}

export const ELEGANT_WEDDING_THEMES: ThemePalette[] = [
  {
    id: 'champagne-obsidian',
    name: 'Champagne & Noche Elegante',
    description: 'Fondo oscuro cálido con reflejos oro champán brillante. El clásico lujo de alta noche.',
    previewBg: '#0d0c0a',
    previewGold: '#d4af37',
    previewAccent: '#f97316',
    colors: {
      bgBase: '#0d0c0a',
      bgElevated: '#181612',
      bgOverlay: 'rgba(0, 0, 0, 0.88)',
      textPrimary: '#ece8e1',
      textMuted: 'rgba(245, 233, 196, 0.7)',
      goldPrimary: '#d4af37',
      goldLight: '#e6c875',
      goldDark: '#9e7b37',
      accent: '#f97316',
      accentHover: '#ea580c',
      borderGlass: 'rgba(212, 175, 55, 0.25)'
    }
  },
  {
    id: 'rose-gold-velvet',
    name: 'Rosa Gold & Marfil Nupcial',
    description: 'Tonos románticos oro rosa con marfil suave y matices aterciopelados.',
    previewBg: '#1a1016',
    previewGold: '#e0a996',
    previewAccent: '#e17055',
    colors: {
      bgBase: '#1a1016',
      bgElevated: '#281722',
      bgOverlay: 'rgba(20, 10, 18, 0.9)',
      textPrimary: '#fdf7f4',
      textMuted: 'rgba(242, 212, 204, 0.75)',
      goldPrimary: '#e0a996',
      goldLight: '#f3cfc3',
      goldDark: '#b87968',
      accent: '#e17055',
      accentHover: '#d63031',
      borderGlass: 'rgba(224, 169, 150, 0.25)'
    }
  },
  {
    id: 'emerald-luxury',
    name: 'Esmeralda Imperial & Oro',
    description: 'Inspirado en los valles andinos y jardines botánicos con oro puro y verde esmeralda profundo.',
    previewBg: '#052e16',
    previewGold: '#e6c875',
    previewAccent: '#10b981',
    colors: {
      bgBase: '#052e16',
      bgElevated: '#0a4220',
      bgOverlay: 'rgba(2, 36, 16, 0.92)',
      textPrimary: '#f0fdf4',
      textMuted: 'rgba(209, 250, 229, 0.75)',
      goldPrimary: '#e6c875',
      goldLight: '#fef08a',
      goldDark: '#a16207',
      accent: '#10b981',
      accentHover: '#059669',
      borderGlass: 'rgba(230, 200, 117, 0.25)'
    }
  },
  {
    id: 'pearl-cream',
    name: 'Perla Marfil & Dorado Solar',
    description: 'Superficies marfil luminoso de ensueño con destellos de sol y elegancia campestre de día.',
    previewBg: '#1f1d19',
    previewGold: '#c5a059',
    previewAccent: '#d97706',
    colors: {
      bgBase: '#1f1d19',
      bgElevated: '#2e2a24',
      bgOverlay: 'rgba(25, 23, 19, 0.88)',
      textPrimary: '#fbf9f5',
      textMuted: 'rgba(235, 225, 208, 0.75)',
      goldPrimary: '#c5a059',
      goldLight: '#e4c478',
      goldDark: '#8c6d32',
      accent: '#d97706',
      accentHover: '#b45309',
      borderGlass: 'rgba(197, 160, 89, 0.25)'
    }
  },
  {
    id: 'platinum-sapphire',
    name: 'Platino & Zafiro Real',
    description: 'Contraste moderno de plata estelar con azul zafiro medianoche y elegancia cosmopolita.',
    previewBg: '#0b132b',
    previewGold: '#cbd5e1',
    previewAccent: '#3b82f6',
    colors: {
      bgBase: '#0b132b',
      bgElevated: '#1c2541',
      bgOverlay: 'rgba(10, 17, 40, 0.92)',
      textPrimary: '#f8fafc',
      textMuted: 'rgba(203, 213, 225, 0.75)',
      goldPrimary: '#cbd5e1',
      goldLight: '#f1f5f9',
      goldDark: '#64748b',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      borderGlass: 'rgba(203, 213, 225, 0.25)'
    }
  }
];

export function applyTheme(theme: ThemePalette['colors']) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--color-bg-base', theme.bgBase);
  root.style.setProperty('--color-bg-elevated', theme.bgElevated);
  root.style.setProperty('--color-bg-overlay', theme.bgOverlay);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-muted', theme.textMuted);
  root.style.setProperty('--color-gold', theme.goldPrimary);
  root.style.setProperty('--color-gold-light', theme.goldLight);
  root.style.setProperty('--color-gold-dark', theme.goldDark);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-accent-hover', theme.accentHover);
}
