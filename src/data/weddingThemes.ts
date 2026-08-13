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
    id: 'pearl-champagne',
    name: 'Perla Marfil & Champán Nupcial (Luminoso)',
    description: 'El clásico tono nupcial de gala: marfil cálido, encaje perla y reflejos en oro champán de ensueño.',
    previewBg: '#fdfbf7',
    previewGold: '#d4af37',
    previewAccent: '#c5a059',
    colors: {
      bgBase: '#fdfbf7',
      bgElevated: '#ffffff',
      bgOverlay: 'rgba(30, 25, 20, 0.82)',
      textPrimary: '#2c241d',
      textMuted: 'rgba(60, 50, 40, 0.75)',
      goldPrimary: '#d4af37',
      goldLight: '#e6c875',
      goldDark: '#8a6d2b',
      accent: '#c5a059',
      accentHover: '#b48f48',
      borderGlass: 'rgba(212, 175, 55, 0.3)'
    }
  },
  {
    id: 'rose-gold-blush',
    name: 'Rosa Gold & Romántico Marfil',
    description: 'Tonos románticos y suaves de rosa cuarzo, marfil luminoso y destellos en oro rosa.',
    previewBg: '#faf4f2',
    previewGold: '#e0a996',
    previewAccent: '#d6806e',
    colors: {
      bgBase: '#faf4f2',
      bgElevated: '#ffffff',
      bgOverlay: 'rgba(40, 20, 30, 0.82)',
      textPrimary: '#382229',
      textMuted: 'rgba(80, 50, 60, 0.75)',
      goldPrimary: '#e0a996',
      goldLight: '#f3cfc3',
      goldDark: '#b87968',
      accent: '#d6806e',
      accentHover: '#c46d5b',
      borderGlass: 'rgba(224, 169, 150, 0.35)'
    }
  },
  {
    id: 'emerald-ivory',
    name: 'Esmeralda Jardín & Marfil',
    description: 'Fondo marfil botánico fresco con detalles en verde esmeralda y toques de oro solar.',
    previewBg: '#f4f8f5',
    previewGold: '#c5a059',
    previewAccent: '#059669',
    colors: {
      bgBase: '#f4f8f5',
      bgElevated: '#ffffff',
      bgOverlay: 'rgba(10, 40, 25, 0.85)',
      textPrimary: '#1c3326',
      textMuted: 'rgba(40, 75, 55, 0.75)',
      goldPrimary: '#c5a059',
      goldLight: '#e6c875',
      goldDark: '#8a6d2b',
      accent: '#059669',
      accentHover: '#047857',
      borderGlass: 'rgba(5, 150, 105, 0.3)'
    }
  },
  {
    id: 'sapphire-platinum',
    name: 'Zafiro Real & Platino',
    description: 'Elegancia cosmopolita en tonos platino luminoso y azul zafiro nupcial.',
    previewBg: '#f6f8fa',
    previewGold: '#94a3b8',
    previewAccent: '#2563eb',
    colors: {
      bgBase: '#f6f8fa',
      bgElevated: '#ffffff',
      bgOverlay: 'rgba(15, 23, 42, 0.85)',
      textPrimary: '#0f172a',
      textMuted: 'rgba(51, 65, 85, 0.75)',
      goldPrimary: '#94a3b8',
      goldLight: '#cbd5e1',
      goldDark: '#475569',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      borderGlass: 'rgba(37, 99, 235, 0.25)'
    }
  },
  {
    id: 'midnight-gala',
    name: 'Noche Encantada & Champán (Oscuro)',
    description: 'Para bodas de gala nocturna: fondo negro aterciopelado con reflejos de oro brillante.',
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
