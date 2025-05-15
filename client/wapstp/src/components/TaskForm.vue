<template>
  <v-form @submit.prevent="submit" class="pa-2">
    <v-text-field label="Název úkolu" v-model="form.title" required />

    <v-textarea label="Popis" v-model="form.description" rows="3" />

    <v-select
      label="Stav"
      v-model="form.status"
      :items="[
        { value: 'todo', title: 'To Do' },
        { value: 'in progress', title: 'In Progress' },
        { value: 'done', title: 'Done' }
      ]"
      required
    />

    <v-text-field
      label="Termín dokončení"
      v-model="form.dueDate"
      type="date"
    />

    <v-select
      label="Priorita"
      v-model="form.priority"
      :items="[
        { value: 'low', title: 'Nízká' },
        { value: 'medium', title: 'Střední' },
        { value: 'high', title: 'Vysoká' }
      ]"
    />

    <v-label class="mt-3 font-weight-bold">Přiřadit členům:</v-label>
    <v-checkbox
      v-for="uid in members"
      :key="uid"
      :label="usersMap[uid] || uid"
      :value="uid"
      v-model="form.assignedTo"
      density="compact"
      hide-details
    />

    <v-row class="mt-4" justify="end">
      <v-btn type="submit" color="primary">
        {{ taskToEdit ? 'Uložit změny' : 'Přidat úkol' }}
      </v-btn>
      <v-btn
        v-if="taskToEdit"
        color="grey"
        variant="text"
        class="ml-2"
        @click="$emit('cancelEdit')"
      >
        Zrušit
      </v-btn>
    </v-row>
  </v-form>
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
