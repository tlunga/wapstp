<template>
  <form @submit.prevent="handleSubmit">
    <h3>{{ editMode ? 'Upravit úkol' : 'Nový úkol' }}</h3>
    <input v-model="title" type="text" placeholder="Název úkolu" required />
    <textarea v-model="description" placeholder="Popis úkolu" required></textarea>

    <label>Stav:</label>
    <select v-model="status">
      <option value="todo">To Do</option>
      <option value="in progress">In Progress</option>
      <option value="done">Done</option>
    </select>

    <label>Přiřadit uživateli:</label>
    <select v-model="assignedTo">
      <option disabled value="">-- vyber uživatele --</option>
      <option v-for="user in users" :key="user.uid" :value="user.uid">
        {{ user.email }}
      </option>
    </select>

    <button type="submit">{{ editMode ? 'Uložit změny' : 'Přidat úkol' }}</button>
    <button v-if="editMode" @click.prevent="$emit('cancelEdit')">Zrušit</button>
    <p v-if="error" style="color:red">{{ error }}</p>
  </form>
</template>

<script>
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

export default {
  props: {
    projectId: String,
    taskToEdit: Object
  },
  data() {
    return {
      title: '',
      description: '',
      status: 'todo',
      assignedTo: '',
      users: [],
      error: ''
    };
  },
  computed: {
    editMode() {
      return !!this.taskToEdit;
    }
  },
  watch: {
    taskToEdit: {
      immediate: true,
      handler(task) {
        if (task) {
          this.title = task.title;
          this.description = task.description;
          this.status = task.status;
          this.assignedTo = task.assignedTo || '';
        } else {
          this.title = '';
          this.description = '';
          this.status = 'todo';
          this.assignedTo = '';
        }
      }
    }
  },
  async mounted() {
    const querySnapshot = await getDocs(collection(db, 'users'));
    this.users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  },
  methods: {
    async handleSubmit() {
      try {
        const taskData = {
          title: this.title,
          description: this.description,
          status: this.status,
          assignedTo: this.assignedTo
        };

        if (this.editMode) {
          const docRef = doc(db, 'tasks', this.taskToEdit.id);
          await updateDoc(docRef, taskData);
          this.$emit('taskUpdated');
        } else {
          await addDoc(collection(db, 'tasks'), {
            ...taskData,
            projectId: this.projectId,
            createdAt: serverTimestamp()
          });
          this.$emit('taskAdded');
        }
      } catch (err) {
        this.error = err.message;
      }
    }
  }
};
</script>
