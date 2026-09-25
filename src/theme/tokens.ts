// AT&T Material look & feel — Material Design surfaces in AT&T brand blue.
// AT&T blue #0057B8, AT&T cyan #009FDB, neutral Material greys.
export const colorTokens: Record<string, string> = {
  primaryMain: '#0057B8',
  primaryDark: '#00447F',
  appBackground: '#f1f4f8',
  textStrong: '#1a2431',
  textPrimary: '#1f2937',
  textSecondary: '#3c4a5c',
  textMuted: '#67758a',
  textSubtle: '#7a889b',
  textBody: '#48566a',
  borderSoft: '#e2e7ee',
  borderPanel: '#e0e6ee',
  borderSubtle: '#d5dde7',
  borderSidebar: 'rgba(255,255,255,0.08)',
  surfaceSidebar: '#002B5C',
  white: '#ffffff',
  whiteSoft: '#f7f9fc',
  badgeBlue: '#d7e7f8',
  iconMuted: '#94a3b8',
  topHeaderBg: '#0057B8',
  topHeaderText: '#ffffff',
  topHeaderDivider: 'rgba(255,255,255,0.45)',

  // Dark navy sidebar (AT&T deep blue)
  sidebarBg: '#002B5C',
  sidebarText: '#cddff2',
  sidebarTextActive: '#ffffff',
  sidebarTextMuted: '#7fa3c7',
  sidebarHover: 'rgba(255,255,255,0.07)',
  sidebarSelected: 'rgba(0,159,219,0.18)',
  sidebarIndicator: '#009FDB',
  sidebarDivider: 'rgba(255,255,255,0.08)',
  sidebarBrandBg: '#001E42',
  sidebarDot: '#4d7ba8',
  sidebarDotActive: '#009FDB',
  sidebarBadgeBg: '#009FDB',

  // Chart palette (AT&T)
  chart1: '#0057B8',
  chart2: '#009FDB',
  chart3: '#009A4E',
  chart4: '#F5A623',
  chart5: '#D2342B',
  chart6: '#6B4EB8',
};

export const chartPalette: string[] = [
  colorTokens.chart1,
  colorTokens.chart2,
  colorTokens.chart3,
  colorTokens.chart4,
  colorTokens.chart5,
  colorTokens.chart6,
];

export const alphaTokens: Record<string, number> = {
  menuSelected: 0.1,
  menuHover: 0.06,
  paperBackground: 0.78,
};
