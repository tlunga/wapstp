<template>
  <div class="task-form">
    <h3>{{ taskToEdit ? 'Upravit úkol' : 'Nový úkol' }}</h3>

    <form @submit.prevent="submit">
      <label>Název úkolu:</label>
      <input v-model="form.title" type="text" required />

      <label>Popis:</label>
      <textarea v-model="form.description" rows="3" />

      <label>Stav:</label>
      <select v-model="form.status" required>
        <option value="todo">To Do</option>
        <option value="in progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <label>Termín dokončení:</label>
      <input type="date" v-model="form.dueDate" />

      <label>Priorita:</label>
      <select v-model="form.priority">
        <option value="low">Nízká</option>
        <option value="medium">Střední</option>
        <option value="high">Vysoká</option>
      </select>

      <label>Přiřadit členům:</label>
      <div v-for="uid in members" :key="uid">
        <input type="checkbox" :value="uid" v-model="form.assignedTo" />
        {{ usersMap[uid] || uid }}
      </div>

      <button type="submit">{{ taskToEdit ? 'Uložit změny' : 'Přidat úkol' }}</button>
      <button type="button" v-if="taskToEdit" @click="$emit('cancelEdit')">Zrušit</button>
    </form>
  </div>
</template>

<script>
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export default {
  props: {
    projectId: String,
    taskToEdit: Object,
    members: Array
  },
  data() {
    return {
      form: {
        title: '',
        description: '',
        status: 'todo',
        assignedTo: [],
        dueDate: '',
        priority: 'medium'
      },
      usersMap: {}
    };
  },
  watch: {
    taskToEdit: {
      immediate: true,
      handler(task) {
        if (task) {
          this.form = {
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'todo',
            assignedTo: task.assignedTo || [],
            dueDate: task.dueDate
              ? task.dueDate.toDate().toISOString().split('T')[0]
              : '',
            priority: task.priority || 'medium'
          };
        } else {
          this.resetForm();
        }
      }
    }
  },
  mounted() {
    this.loadUsersMap();
  },
  methods: {
    async submit() {
      const user = auth.currentUser;
      if (!user) return;

      const task = {
        ...this.form,
        projectId: this.projectId,
        createdAt: serverTimestamp(),
        createdBy: {
          uid: user.uid,
          name: this.usersMap[user.uid] || user.email
        }
      };

      if (this.form.dueDate) {
        task.dueDate = Timestamp.fromDate(new Date(this.form.dueDate));
      }

      if (this.taskToEdit?.id) {
        const docRef = doc(db, 'tasks', this.taskToEdit.id);
        await updateDoc(docRef, task);
        this.$emit('taskUpdated');
      } else {
        await addDoc(collection(db, 'tasks'), task);
        this.$emit('taskAdded');
      }

      this.resetForm();
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        status: 'todo',
        assignedTo: [],
        dueDate: '',
        priority: 'medium'
      };
    },
    async loadUsersMap() {
      const { getDocs, collection } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach(doc => {
        const data = doc.data();
        this.usersMap[doc.id] = data.name || data.email || doc.id;
      });
    }
  }
};
</script>

<style scoped>
.task-form {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

label {
  font-weight: bold;
  display: block;
  margin-top: 0.75rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.3rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #2563eb;
}
</style>
