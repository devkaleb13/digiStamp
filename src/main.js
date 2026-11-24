import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'digistamp',
    themes: {
      digistamp: {
        dark: false,
        colors: {
          primary: '#102A43',
          'on-primary': '#FFFFFF',
          secondary: '#D4AF37',
          'on-secondary': '#102A43',
          success: '#198754',
          error: '#B42318',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          section: '#F3F6F9',
          'on-section': '#1C2B3A',
        },
      },
    },
  },
  defaults: {
    VBtn: { style: 'text-transform: none; letter-spacing: 0; font-weight: 600;' },
  },
})

createApp(App).use(router).use(vuetify).mount('#app')