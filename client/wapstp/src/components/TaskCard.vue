<template>
    <div class="card">
      <strong>{{ task.title }}</strong> – {{ task.status }}<br />
      <p>{{ task.description }}</p>
      <p v-if="task.assignedTo">
        <em>Přiřazeno: {{ usersMap[task.assignedTo] || 'neznámý' }}</em>
      </p>
      <button @click="$emit('edit', task)">Upravit</button>
      <button @click="$emit('delete', task.id)">Smazat</button>
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
  .card {
    background: #f4f4f4;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 6px;
  }
  </style>
  