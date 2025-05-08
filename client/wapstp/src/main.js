import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify'; // přidáno

createApp(App)
  .use(router)
  .use(vuetify) // přidáno
  .mount('#app');
