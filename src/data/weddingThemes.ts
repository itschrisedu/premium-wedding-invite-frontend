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
    id: 'pastel-olive-sage',
    name: 'Verde Oliva Pastel & Salvia Botánico (Luxury)',
    description: 'Estética editorial botánica, orgánica y sofisticada con fondo marfil/verde suave y acentos en verde oliva pastel y salvia.',
    previewBg: '#F3F5F1',
    previewGold: '#6B7F5A',
    previewAccent: '#556B2F',
    colors: {
      bgBase: '#F3F5F1',
      bgElevated: '#FAFCF9',
      bgOverlay: 'rgba(42, 56, 40, 0.85)',
      textPrimary: '#2A3828',
      textMuted: '#627559',
      goldPrimary: '#6B7F5A',
      goldLight: '#8A9D76',
      goldDark: '#556B2F',
      accent: '#6B7F5A',
      accentHover: '#4D5E3F',
      borderGlass: '#B1C2A5'
    }
  },
  {
    id: 'pearl-champagne',
    name: 'Perla Marfil & Champán Nupcial',
    description: 'El clásico tono nupcial de gala: marfil cálido, encaje perla y reflejos en oro champán de ensueño.',
    previewBg: '#fdfbf7',
    previewGold: '#d4af37',
    previewAccent: '#c5a059',
    colors: {
      bgBase: '#fdfbf7',
      bgElevated: '#ffffff',
      bgOverlay: 'rgba(30, 25, 20, 0.82)',
      textPrimary: '#2c241d',
      textMuted: '#6c5a4b',
      goldPrimary: '#d4af37',
      goldLight: '#e6c875',
      goldDark: '#8a6d2b',
      accent: '#c5a059',
      accentHover: '#b48f48',
      borderGlass: '#d4af37'
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
      textMuted: '#704854',
      goldPrimary: '#e0a996',
      goldLight: '#f3cfc3',
      goldDark: '#b87968',
      accent: '#d6806e',
      accentHover: '#c46d5b',
      borderGlass: '#e0a996'
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
      textMuted: '#475569',
      goldPrimary: '#94a3b8',
      goldLight: '#cbd5e1',
      goldDark: '#334155',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      borderGlass: '#94a3b8'
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
      borderGlass: 'rgba(212, 175, 55, 0.4)'
    }
  }
];

/**
 * Generates a full matching ThemePalette from a single HEX primary color.
 * Maintains white/ivory base background by default unless custom bg is supplied.
 */
export function generatePaletteFromHex(hexColor: string, isWhiteBg = true): ThemePalette['colors'] {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2) || '6B', 16);
  const g = parseInt(hex.substring(2, 4) || '7F', 16);
  const b = parseInt(hex.substring(4, 6) || '5A', 16);

  // Darkened version for hover
  const darkR = Math.max(0, Math.floor(r * 0.8));
  const darkG = Math.max(0, Math.floor(g * 0.8));
  const darkB = Math.max(0, Math.floor(b * 0.8));
  const hoverHex = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

  // Dark text color calculated from contrast
  const isLightAccent = (r * 299 + g * 587 + b * 114) / 1000 > 150;
  const darkText = isLightAccent ? '#1C261A' : '#2A3828';

  return {
    bgBase: isWhiteBg ? '#FAFCF9' : '#F3F5F1',
    bgElevated: '#FFFFFF',
    bgOverlay: `rgba(${r}, ${g}, ${b}, 0.85)`,
    textPrimary: darkText,
    textMuted: `rgb(${Math.floor(r * 0.9)}, ${Math.floor(g * 0.9)}, ${Math.floor(b * 0.9)})`,
    goldPrimary: hexColor,
    goldLight: `rgba(${r}, ${g}, ${b}, 0.6)`,
    goldDark: hoverHex,
    accent: hexColor,
    accentHover: hoverHex,
    borderGlass: `rgba(${r}, ${g}, ${b}, 0.35)`
  };
}

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
