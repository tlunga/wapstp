<template>
  <DashboardLayout>
    <h1>Moje projekty</h1>
    <v-btn color="primary" @click="$router.push('/projects/new')">+ Nový projekt</v-btn>

    <div v-if="projects.length">
      <v-card
        v-for="project in projects"
        :key="project.id"
        class="my-4"
        outlined
      >
        <v-card-title>{{ project.name }}</v-card-title>
        <v-card-text>
          <p>{{ project.description }}</p>
          <p>Průběh: {{ project.progress }} %</p>
          <v-progress-linear
            :model-value="project.progress"
            :color="getProgressColor(project.progress)"
            height="10"
            rounded
          />
        </v-card-text>
        <v-card-actions>
          <router-link :to="`/projects/${project.id}`">Zobrazit detail</router-link>
        </v-card-actions>
      </v-card>
    </div>

    <h2 class="mt-8">Moje úkoly</h2>
    <v-list v-if="myTasks.length">
      <v-list-item
        v-for="task in myTasks"
        :key="task.id"
        class="px-0"
      >
        <v-list-item-content>
          <v-list-item-title><strong>{{ task.title }}</strong> – {{ task.status }}</v-list-item-title>
          <v-list-item-subtitle v-if="task.dueDate">
            🗓 {{ formatDate(task.dueDate) }}
          </v-list-item-subtitle>
          <router-link :to="`/projects/${task.projectId}`">Otevřít projekt</router-link>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <p v-else>Nejsi členem žádného projektu.</p>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue';
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

const projects = ref([]);
const myTasks = ref([]);

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, 'projects'),
    where('members', 'array-contains', user.uid)
  );

  const querySnapshot = await getDocs(q);
  projects.value = [];

  for (const docSnap of querySnapshot.docs) {
    const project = { id: docSnap.id, ...docSnap.data() };

    const tasksSnap = await getDocs(
      query(collection(db, 'tasks'), where('projectId', '==', project.id))
    );
    const tasks = tasksSnap.docs.map(doc => doc.data());
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    project.progress = total ? Math.round((done / total) * 100) : 0;

    projects.value.push(project);
  }

  const tasksQuery = query(
    collection(db, 'tasks'),
    where('assignedTo', 'array-contains', user.uid)
  );
  const tasksSnap = await getDocs(tasksQuery);
  myTasks.value = tasksSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
});

function formatDate(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString();
}

function getProgressColor(progress) {
  if (progress >= 80) return 'green';
  if (progress >= 50) return 'orange';
  return 'red';
}
</script>
