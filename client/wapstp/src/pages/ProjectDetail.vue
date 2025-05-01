<template>
  <div v-if="project">
    <h1>{{ project.name }}</h1>
    <p>{{ project.description }}</p>

    <h3>Členové projektu:</h3>
    <ul>
      <li v-for="user in membersInfo" :key="user.uid">
        {{ user.email }}
      </li>
    </ul>

    <div v-if="isOwner">
      <h3>Správa členů týmu:</h3>
      <div v-for="user in allUsers" :key="user.uid">
        <input
          type="checkbox"
          v-model="user.selected"
          :value="user.uid"
        />
        {{ user.email }}
      </div>
      <button @click="updateMembers">Uložit změny</button>
    </div>

    <TaskForm
      :projectId="project.id"
      :taskToEdit="taskToEdit"
      :members="project.members"
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
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import TaskForm from '../components/TaskForm.vue';

export default {
  components: { TaskForm },
  data() {
    return {
      project: null,
      tasks: [],
      taskToEdit: null,
      usersMap: {},
      membersInfo: [],
      allUsers: [],
      isOwner: false
    };
  },
  async mounted() {
    await this.loadProjectAndTasks();
    await this.loadProjectMembers();
  },
  methods: {
    async loadProjectAndTasks() {
      try {
        const projectId = this.$route.params.id;
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.project = { id: docSnap.id, ...docSnap.data() };
          this.isOwner =
            auth.currentUser && auth.currentUser.uid === this.project.ownerId;
          await this.fetchTasks();
        } else {
          console.error('Projekt nenalezen');
        }
      } catch (err) {
        console.error('Chyba při načítání projektu:', err);
      }
    },

    async loadProjectMembers() {
      if (!this.project?.members) return;

      const querySnapshot = await getDocs(collection(db, 'users'));
      this.allUsers = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      this.allUsers.forEach(u => {
        u.selected = this.project.members.includes(u.uid);
      });

      this.membersInfo = this.allUsers.filter(u =>
        this.project.members.includes(u.uid)
      );
      this.usersMap = Object.fromEntries(this.membersInfo.map(u => [u.uid, u.email]));
    },

    async fetchTasks() {
      if (!this.project?.id) return;

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
    },

    async deleteTask(taskId) {
      await deleteDoc(doc(db, 'tasks', taskId));
      await this.fetchTasks();
    },

    async onTaskUpdated() {
      this.taskToEdit = null;
      await this.fetchTasks();
    },

    async updateMembers() {
      const newMembers = this.allUsers
        .filter(u => u.selected)
        .map(u => u.uid);

      const docRef = doc(db, 'projects', this.project.id);
      await updateDoc(docRef, { members: newMembers });

      await this.loadProjectAndTasks();
      await this.loadProjectMembers();
    }
  }
};
</script>
