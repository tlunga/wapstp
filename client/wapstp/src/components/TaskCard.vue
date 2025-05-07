<template>
  <div class="task-card">
    <div class="task-header">
      <strong>{{ task.title }}</strong>
      <span :class="['status-badge', task.status.replace(' ', '-')]">
        {{ task.status }}
      </span>
    </div>

    <p>{{ task.description }}</p>

    <p v-if="task.assignedTo && task.assignedTo.length">
      <em>Přiřazeno:
        <span v-for="(uid, index) in task.assignedTo" :key="uid">
          {{ usersMap[uid] || 'neznámý' }}<span v-if="index < task.assignedTo.length - 1">, </span>
        </span>
      </em>
    </p>

    <div class="task-actions">
      <button @click="$emit('edit', task)">Upravit</button>
      <button @click="$emit('delete', task.id)">Smazat</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: Object,
    usersMap: Object
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
  margin-bottom: 0.5rem;
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
</style>
