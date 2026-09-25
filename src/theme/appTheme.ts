import { createTheme } from '@mui/material/styles';
import { colorTokens } from './tokens';

// AT&T Material: Material Design shapes, type and elevation in AT&T brand blue.
const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colorTokens.primaryMain, dark: colorTokens.primaryDark, contrastText: '#ffffff' },
    secondary: { main: '#009FDB', contrastText: '#ffffff' },
    success: { main: '#009A4E' },
    warning: { main: '#F5A623' },
    error: { main: '#D2342B' },
    info: { main: '#009FDB' },
    background: { default: colorTokens.appBackground, paper: colorTokens.white },
    text: { primary: colorTokens.textPrimary, secondary: colorTokens.textSecondary },
    divider: colorTokens.borderSoft,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: "'Roboto', 'Helvetica Neue', 'Poppins', 'Segoe UI', sans-serif",
    h3: { fontWeight: 500, letterSpacing: 0 },
    h5: { fontWeight: 500, letterSpacing: 0 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 500, letterSpacing: '0.04em' },
  },
  components: {
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 4 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 4, textTransform: 'uppercase' },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 4, fontWeight: 500 } } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.04em' } } },
  },
});

export default appTheme;
