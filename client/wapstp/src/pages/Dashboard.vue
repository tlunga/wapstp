<template>
  <div>
    <h1>Moje projekty</h1>
    <button @click="$router.push('/projects/new')">+ Nový projekt</button>

    <div v-if="projects.length">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card"
      >
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>

        <p>Průběh: {{ project.progress }} %</p>
        <div
          style="background: #e5e7eb; height: 10px; border-radius: 6px; overflow: hidden; margin-bottom: 0.5rem;"
        >
          <div
            :style="{
              width: project.progress + '%',
              background: project.progress >= 80
                ? '#10b981'
                : project.progress >= 50
                ? '#f59e0b'
                : '#ef4444',
              height: '100%',
              transition: 'width 0.3s'
            }"
          ></div>
        </div>

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
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('members', 'array-contains', user.uid)
    );

    const querySnapshot = await getDocs(q);
    this.projects = [];

    for (const docSnap of querySnapshot.docs) {
      const project = { id: docSnap.id, ...docSnap.data() };

      // Načti úkoly projektu
      const tasksSnap = await getDocs(
        query(collection(db, 'tasks'), where('projectId', '==', project.id))
      );
      const tasks = tasksSnap.docs.map(doc => doc.data());
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;
      project.progress = total ? Math.round((done / total) * 100) : 0;

      this.projects.push(project);
    }
  }
};
</script>

<style scoped>
.project-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  background-color: #f9fafb;
}
</style>
