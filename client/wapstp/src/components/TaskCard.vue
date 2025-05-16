<template>
  <v-card class="mb-4" outlined>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="font-weight-medium">{{ task.title }}</span>
      <v-chip
        :color="statusColor(task.status)"
        class="text-white"
        small
        label
      >
        {{ task.status }}
      </v-chip>
    </v-card-title>

    <v-card-subtitle class="text-caption text-grey">
      🧑 {{ task.createdBy?.name || 'neznámý' }} • 🕒 {{ formatCreatedAt(task.createdAt) }}
    </v-card-subtitle>

    <v-card-text>
      <p>{{ task.description }}</p>

      <v-chip
        :color="priorityColor(task.priority)"
        class="text-white mt-2"
        small
        label
      >
        Priorita:
        {{
          task.priority === 'high'
            ? 'Vysoká'
            : task.priority === 'low'
            ? 'Nízká'
            : 'Střední'
        }}
      </v-chip>

      <div v-if="task.dueDate" class="mt-2 text-caption text-grey">
        🗓 Termín: {{ formatDueDate(task.dueDate) }}
      </div>

      <!-- Tlačítko pro zobrazení přiřazených -->
      <v-btn
        v-if="task.assignedTo && task.assignedTo.length"
        class="mt-3"
        size="small"
        variant="text"
        @click="showAssignedDialog = true"
      >
        <v-icon start>mdi-account-multiple</v-icon>
        Zobrazit přiřazené
      </v-btn>
    </v-card-text>

    <v-card-actions>
      <v-btn size="small" color="primary" @click="$emit('edit', task)">
        <v-icon start>mdi-pencil</v-icon>
        Upravit
      </v-btn>
      <v-btn size="small" color="error" @click="$emit('delete', task.id)">
        <v-icon start>mdi-delete</v-icon>
        Smazat
      </v-btn>
    </v-card-actions>

    <!-- Dialog s přiřazenými členy -->
    <v-dialog v-model="showAssignedDialog" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Přiřazení uživatelé</span>
          <v-spacer />
          <v-btn icon @click="showAssignedDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-list density="compact">
            <v-list-item
              v-for="uid in task.assignedTo"
              :key="uid"
            >
              <v-list-item-title>
                <span class="font-weight-medium">
                  {{ usersMap[uid] || uid }}
                </span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  props: {
    task: Object,
    usersMap: Object
  },
  data() {
    return {
      showAssignedDialog: false
    };
  },
  methods: {
    formatDueDate(ts) {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleDateString();
    },
    formatCreatedAt(ts) {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    },
    priorityColor(priority) {
      if (priority === 'high') return 'red';
      if (priority === 'low') return 'blue';
      return 'orange';
    },
    statusColor(status) {
      if (status === 'done') return 'green';
      if (status === 'in progress') return 'orange';
      return 'grey';
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
</style>
