import { createTheme } from '@mui/material/styles';

// 统一的应用配色，供 styled-components / 内联样式复用，避免到处硬编码十六进制色值。
export const palette = {
  bg: '#0f1115', // 应用最外层背景
  surface: '#16181d', // 顶栏 / 侧栏等表面
  surfaceRaised: '#1e2128', // 卡片 / 内容区
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  accent: '#71aaff',
  text: '#e7eaf0',
  textSecondary: 'rgba(231, 234, 240, 0.6)'
};

// 现代化的 MUI 深色主题：更柔和的背景、统一圆角、无大写按钮、悬停高亮等。
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.accent },
    background: {
      default: palette.bg,
      paper: palette.surfaceRaised
    },
    text: {
      primary: palette.text,
      secondary: palette.textSecondary
    },
    divider: palette.border
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", system-ui, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${palette.border}`,
          backgroundColor: palette.surfaceRaised
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(113, 170, 255, 0.16)'
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(113, 170, 255, 0.24)'
          }
        }
      }
    },
    MuiTooltip: {
      defaultProps: { arrow: true }
    }
  }
});

export default theme;
