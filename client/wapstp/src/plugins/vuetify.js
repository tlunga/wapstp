// src/plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' // ✅ nutné pro ikonky v checkboxech a dalších

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // ✅ nastav výchozí ikonový set
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'light' // nebo 'dark', pokud používáš tmavý motiv
  }
})
