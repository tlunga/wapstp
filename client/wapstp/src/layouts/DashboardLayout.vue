<template>
    <v-app>
      <v-app-bar app color="primary" dark>
        <v-app-bar-title>Team Project Manager</v-app-bar-title>
        <v-spacer />
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>
  
      <v-navigation-drawer app v-model="drawer" color="grey-lighten-4">
        <v-list density="compact" nav>
          <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard" title="Dashboard" />
          <v-list-item to="/projects" prepend-icon="mdi-folder" title="Projekty" />
          <v-list-item to="/profile" prepend-icon="mdi-account" title="Profil" />
        </v-list>
      </v-navigation-drawer>
  
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
  
  const drawer = ref(true);
  const router = useRouter();
  
  function logout() {
    router.push('/login');
  }
  </script>
  