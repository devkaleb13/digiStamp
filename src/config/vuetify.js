import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' // MDI icon font
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components, // registers v-app, v-btn, v-alert, ...
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'digistamp',
    themes: {
      digistamp: {
        dark: false,
        colors: {
          primary: '#102A43', // navy
          'on-primary': '#FFFFFF',
          secondary: '#D4AF37', // gold
          'on-secondary': '#102A43',
          success: '#198754', // verification green
          error: '#B42318',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          section: '#F3F6F9', // light grey sections
          'on-section': '#1C2B3A',
        },
      },
    },
  },
  defaults: {
    VBtn: { style: 'text-transform: none; letter-spacing: 0; font-weight: 600;' },
  },
})