<template>
    <div>
      <h1>Moje projekty</h1>
      <button @click="$router.push('/projects/new')">+ Nový projekt</button>
  
      <div v-if="projects.length">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <router-link :to="`/projects/${project.id}`">Zobrazit detail</router-link>
        </div>
      </div>
      <p v-else>Nejsi členem žádného projektu.</p>
    </div>
  </template>
  
  <script>
  import { auth, db } from '../firebase';
  import {
    collection,
    query,
    where,
    getDocs
  } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        projects: []
      };
    },
    async mounted() {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Uživatel není přihlášen.');
        return;
      }
  
      const q = query(
        collection(db, 'projects'),
        where('members', 'array-contains', user.uid)
      );
  
      const querySnapshot = await getDocs(q);
      this.projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  };
  </script>
  
  <style scoped>
  .project-card {
    border: 1px solid #ccc;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 8px;
  }
  </style>
  