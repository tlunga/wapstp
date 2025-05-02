<template>
    <nav class="navbar">
      <router-link to="/dashboard" class="nav-item">Nástěnka</router-link>
      <router-link to="/projects/new" class="nav-item">+ Projekt</router-link>
      <router-link to="/profile" class="nav-item">Profil</router-link>
      <button @click="logout" class="nav-item logout-btn">Odhlásit se</button>
    </nav>
  </template>
  
  <script>
  import { auth } from '../firebase';
  import { signOut } from 'firebase/auth';
  
  export default {
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
  