<template>
  <v-app>
    <!-- Horní lišta -->
    <v-app-bar app color="indigo" dark>
      <v-btn icon @click="$router.push('/dashboard')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ title || 'Detail projektu' }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigační panel vlevo -->
    <v-navigation-drawer app v-model="drawer" color="grey-lighten-4">
      <v-list density="compact" nav>
        <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard" title="Dashboard" />
        <v-list-item to="/projects" prepend-icon="mdi-folder" title="Projekty" />
        <v-list-item to="/profile" prepend-icon="mdi-account" title="Profil" />
      </v-list>
    </v-navigation-drawer>

    <!-- Obsah -->
    <v-main>
      <v-container class="py-4">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
  title: {
    type: String,
    default: ''
  }
});

const drawer = ref(true);
const router = useRouter();

function logout() {
  router.push('/login');
}
</script>
