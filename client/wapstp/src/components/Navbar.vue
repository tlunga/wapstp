<template>
  <nav class="navbar">
    <template v-if="isLoggedIn">
      <router-link to="/dashboard" class="nav-item">Nástěnka</router-link>
      <router-link to="/projects/new" class="nav-item">+ Projekt</router-link>
      <router-link to="/profile" class="nav-item">Profil</router-link>
      <button @click="logout" class="nav-item logout-btn">Odhlásit se</button>
    </template>

    <template v-else>
      <router-link to="/login" class="nav-item">Přihlášení</router-link>
      <router-link to="/register" class="nav-item">Registrace</router-link>
    </template>
  </nav>
</template>

  
<script>
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default {
  data() {
    return {
      isLoggedIn: false
    };
  },
  mounted() {
    this.unsubscribe = onAuthStateChanged(auth, user => {
      this.isLoggedIn = !!user;
    });
  },
  beforeUnmount() {
    this.unsubscribe?.();
  },
  methods: {
    async logout() {
      await signOut(auth);
      this.$router.push('/');
    }
  }
};
</script>

  
  <style scoped>
  .navbar {
    display: flex;
    background-color: #1f2937;
    padding: 0.75rem 1.5rem;
    gap: 1rem;
    align-items: center;
  }
  
  .nav-item {
    color: white;
    text-decoration: none;
    font-weight: bold;
  }
  
  .nav-item:hover {
    text-decoration: underline;
  }
  
  .logout-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-weight: bold;
  }
  </style>
  