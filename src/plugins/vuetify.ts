import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify, type ThemeDefinition } from 'vuetify'

const adobeDark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#1e1e1e',
    surface: '#2d2d2d',
    'surface-bright': '#3d3d3d',
    'surface-light': '#3a3a3a',
    'surface-variant': '#323232',
    'on-surface-variant': '#a0a0a0',
    primary: '#0d99ff',
    'primary-darken-1': '#0a7acc',
    secondary: '#7b61ff',
    'secondary-darken-1': '#5c46cc',
    error: '#ff5252',
    info: '#0d99ff',
    success: '#4caf50',
    warning: '#fb8c00',
    'on-background': '#e0e0e0',
    'on-surface': '#e0e0e0',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-error': '#ffffff',
    'on-info': '#ffffff',
    'on-success': '#ffffff',
    'on-warning': '#ffffff',
  },
  variables: {
    'border-color': '#404040',
    'border-opacity': 1,
    'high-emphasis-opacity': 0.95,
    'medium-emphasis-opacity': 0.7,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.08,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'adobeDark',
    themes: {
      adobeDark,
    },
  },
  defaults: {
    VSlider: {
      color: 'primary',
      trackColor: 'surface-light',
      thumbColor: 'primary',
    },
    VBtn: {
      variant: 'flat',
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
    },
  },
})
