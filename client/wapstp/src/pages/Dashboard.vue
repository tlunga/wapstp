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

    
    <h2 style="margin-top: 2rem;">Moje úkoly</h2>
<div v-if="myTasks.length">
  <ul>
    <li v-for="task in myTasks" :key="task.id">
      <strong>{{ task.title }}</strong> – {{ task.status }}
      <br />
      <small v-if="task.dueDate">🗓 {{ formatDate(task.dueDate) }}</small>
      <br />
      <router-link :to="`/projects/${task.projectId}`">Otevřít projekt</router-link>
    </li>
  </ul>
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
      projects: [],
      myTasks: []
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
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', user.uid)
    );
    const tasksSnap = await getDocs(tasksQuery);
      this.myTasks = tasksSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
  }));
  },

  methods: {
    formatDate(ts) {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString();
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
