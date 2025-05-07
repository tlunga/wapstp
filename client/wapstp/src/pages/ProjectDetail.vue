<template>
  <div v-if="project">
    <h1>{{ project.name }}</h1>
    <p>{{ project.description }}</p>

    <h3>Členové projektu:</h3>
    <ul>
      <li v-for="user in membersInfo" :key="user.uid">
        {{ user.email }}
        <span v-if="user.uid === project.ownerId" style="color: #10b981; font-weight: bold;">
          – vedoucí
        </span>
      </li>
    </ul>

    <div v-if="isOwner">
      <h3>Správa členů týmu:</h3>
      <div v-for="user in allUsers" :key="user.uid">
        <input type="checkbox" v-model="user.selected" :value="user.uid" />
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

    <h2>Kanban nástěnka</h2>
    <div class="kanban-board">
      <div class="kanban-column">
        <h3>To Do</h3>
        <draggable
          v-model="tasksByStatus.todo"
          group="tasks"
          @end="onDragEnd"
          item-key="id"
        >
          <template #item="{ element }">
            <TaskCard
              :task="element"
              :usersMap="usersMap"
              @edit="taskToEdit = element"
              @delete="deleteTask"
            />
          </template>
        </draggable>
      </div>

      <div class="kanban-column">
        <h3>In Progress</h3>
        <draggable
          v-model="tasksByStatus.inProgress"
          group="tasks"
          @end="onDragEnd"
          item-key="id"
        >
          <template #item="{ element }">
            <TaskCard
              :task="element"
              :usersMap="usersMap"
              @edit="taskToEdit = element"
              @delete="deleteTask"
            />
          </template>
        </draggable>
      </div>

      <div class="kanban-column">
        <h3>Done</h3>
        <draggable
          v-model="tasksByStatus.done"
          group="tasks"
          @end="onDragEnd"
          item-key="id"
        >
          <template #item="{ element }">
            <TaskCard
              :task="element"
              :usersMap="usersMap"
              @edit="taskToEdit = element"
              @delete="deleteTask"
            />
          </template>
        </draggable>
      </div>
    </div>
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
import TaskCard from '../components/TaskCard.vue';
import draggable from 'vuedraggable';

export default {
  components: { TaskForm, TaskCard, draggable },
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
  computed: {
    tasksByStatus() {
      return {
        todo: this.tasks.filter(t => t.status === 'todo'),
        inProgress: this.tasks.filter(t => t.status === 'in progress'),
        done: this.tasks.filter(t => t.status === 'done')
      };
    }
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
    },

    async onDragEnd(event) {
      const { item, to } = event;

      let newStatus = '';
      if (to.innerText.includes('To Do')) newStatus = 'todo';
      else if (to.innerText.includes('In Progress')) newStatus = 'in progress';
      else if (to.innerText.includes('Done')) newStatus = 'done';

      if (item && item.id && item.status !== newStatus) {
        const docRef = doc(db, 'tasks', item.id);
        await updateDoc(docRef, { status: newStatus });
        await this.fetchTasks();
      }
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

ul {
  padding-left: 1.2rem;
}

input[type='text'],
textarea,
select {
  padding: 0.5rem;
  margin: 0.3rem 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

button:hover {
  background-color: #2563eb;
}

.kanban-board {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.kanban-column {
  flex: 1;
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  min-height: 300px;
}

.task-card {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.task-card strong {
  font-size: 1rem;
  display: block;
  margin-bottom: 0.3rem;
}

.task-card p {
  margin: 0.3rem 0;
}

.task-card em {
  color: #6b7280;
  font-size: 0.9rem;
}

label {
  font-weight: bold;
  margin-top: 0.5rem;
  display: block;
}
</style>