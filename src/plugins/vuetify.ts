import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const beigeTheme = {
  dark: false,
  colors: {
    background: '#F5F5DC', // Beige
    surface: '#FFF8DC',    // Cornsilk
    primary: '#8B4513',    // SaddleBrown
    secondary: '#D2B48C',  // Tan
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'beigeTheme',
    themes: {
      beigeTheme,
    },
  },
})
