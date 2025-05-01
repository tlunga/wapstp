<template>
  <div v-if="project">
    <h1>{{ project.name }}</h1>
    <p>{{ project.description }}</p>

    <TaskForm
      :projectId="project.id"
      :taskToEdit="taskToEdit"
      @taskAdded="fetchTasks"
      @taskUpdated="onTaskUpdated"
      @cancelEdit="taskToEdit = null"
    />

    <h2>Úkoly</h2>
    <div v-if="tasks.length">
      <ul>
        <li v-for="task in tasks" :key="task.id">
          <strong>{{ task.title }}</strong> – {{ task.status }}<br />
          {{ task.description }}<br />
          <p v-if="task.assignedTo">
            <em>Přiřazeno: {{ usersMap[task.assignedTo] || 'neznámý uživatel' }}</em>
          </p>
          <button @click="taskToEdit = task">Upravit</button>
          <button @click="deleteTask(task.id)">Smazat</button>
        </li>
      </ul>
    </div>
    <p v-else>Žádné úkoly</p>
  </div>
  <div v-else>
    <p>Načítám projekt...</p>
  </div>
</template>

<script>
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import TaskForm from '../components/TaskForm.vue';

export default {
  components: { TaskForm },
  data() {
    return {
      project: null,
      tasks: [],
      taskToEdit: null
    };
  },
  async mounted() {
    await this.loadProjectAndTasks();
  },

  data() {
  return {
    project: null,
    tasks: [],
    taskToEdit: null,
    usersMap: {} // nově
  };
},

async mounted() {
  await this.loadProjectAndTasks();
  await this.loadUsers(); // nově
},

  methods: {
    async loadProjectAndTasks() {
      try {
        const projectId = this.$route.params.id;
        console.log('🔍 Načítám projekt ID:', projectId);

        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.project = { id: docSnap.id, ...docSnap.data() };
          console.log('✅ Projekt načten:', this.project.id);
          await this.fetchTasks(); // úkoly načítáme až po načtení projektu
        } else {
          console.error('❌ Projekt nenalezen ve Firestore');
        }
      } catch (err) {
        console.error('Chyba při načítání projektu:', err);
      }
    },

    async fetchTasks() {
      if (!this.project?.id) {
        console.warn('⚠️ fetchTasks volán bez project.id');
        return;
      }

      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', this.project.id),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      this.tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('📋 Úkoly načteny:', this.tasks);
    },

    async deleteTask(taskId) {
      await deleteDoc(doc(db, 'tasks', taskId));
      await this.fetchTasks();
    },

    async onTaskUpdated() {
      this.taskToEdit = null;
      await this.fetchTasks();
    },
    async loadUsers() {
    const querySnapshot = await getDocs(collection(db, 'users'));
    this.usersMap = {};
    querySnapshot.forEach(doc => {
      this.usersMap[doc.id] = doc.data().email;
    });
  }

  }
};
</script>
