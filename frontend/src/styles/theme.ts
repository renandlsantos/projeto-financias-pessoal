import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',      // Azul principal
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#dc004e',      // Rosa/Vermelho para alertas
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff'
    },
    success: {
      main: '#2e7d32',      // Verde para receitas
      light: '#4caf50',
      dark: '#1b5e20'
    },
    warning: {
      main: '#ed6c02',      // Laranja para avisos
      light: '#ff9800',
      dark: '#e65100'
    },
    error: {
      main: '#d32f2f',      // Vermelho para despesas
      light: '#ef5350',
      dark: '#c62828'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',  // Sem uppercase automático
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
};

export const theme = createTheme(themeOptions);
