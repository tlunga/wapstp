<template>
  <div class="task-card">
    <div class="task-header">
      <strong>{{ task.title }}</strong>
      <span :class="['status-badge', task.status.replace(' ', '-')]">
        {{ task.status }}
      </span>
    </div>

    <small class="task-meta">
      🧑 {{ task.createdBy?.name || 'neznámý' }} – 🕒 {{ formatCreatedAt(task.createdAt) }}
    </small>

    <p>{{ task.description }}</p>

    <span :class="['priority-badge', task.priority || 'medium']">
      Priorita:
      {{
        task.priority === 'high'
          ? 'Vysoká'
          : task.priority === 'low'
          ? 'Nízká'
          : 'Střední'
      }}
    </span>

    <p v-if="task.dueDate" class="due-date">
      🗓 Termín: {{ formatDueDate(task.dueDate) }}
    </p>

    <p v-if="task.assignedTo && task.assignedTo.length">
      <em>Přiřazeno:
        <span v-for="(uid, index) in task.assignedTo" :key="uid">
          {{ usersMap[uid] || uid }}<span v-if="index < task.assignedTo.length - 1">, </span>
        </span>
      </em>
    </p>

    <div class="task-actions">
      <button @click="$emit('edit', task)">Upravit</button>
      <button @click="$emit('delete', task.id)">Smazat</button>
    </div>

    <div class="status-buttons">
      <button v-if="task.status !== 'todo'" @click="changeStatus('todo')">← To Do</button>
      <button v-if="task.status !== 'in progress'" @click="changeStatus('in progress')">→ In Progress</button>
      <button v-if="task.status !== 'done'" @click="changeStatus('done')">→ Done</button>
    </div>
  </div>
</template>

<script>
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default {
  props: {
    task: Object,
    usersMap: Object
  },
  methods: {
    async changeStatus(newStatus) {
      const docRef = doc(db, 'tasks', this.task.id);
      await updateDoc(docRef, { status: newStatus });
      this.$emit('statusChanged');
    },
    formatDueDate(ts) {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString();
    },
    formatCreatedAt(ts) {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    }
  }
};
</script>


<style scoped>
.task-card {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: white;
  text-transform: capitalize;
}

.status-badge.todo {
  background-color: #6b7280;
}
.status-badge.in-progress {
  background-color: #f59e0b;
}
.status-badge.done {
  background-color: #10b981;
}

.priority-badge {
  display: inline-block;
  margin-top: 0.25rem;
  margin-bottom: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
}
.priority-badge.low {
  background-color: #3b82f6;
}
.priority-badge.medium {
  background-color: #f59e0b;
}
.priority-badge.high {
  background-color: #ef4444;
}

.due-date {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.3rem;
}

.task-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.task-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.task-actions button {
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.task-actions button:hover {
  background-color: #2563eb;
}

.status-buttons {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.status-buttons button {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #e5e7eb;
}

.status-buttons button:hover {
  background-color: #d1d5db;
}
</style>
