<template>
  <DashboardLayout>
    <v-container fluid>
      <!-- Horní panel -->
      <v-row class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold">📌 Nástěnka</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/projects/new')">
          Nový projekt
        </v-btn>
      </v-row>

      <!-- Projekty -->
      <v-row dense>
        <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="pa-4 transition-ease-in-out"
            elevation="2"
            hover
            rounded="xl"
          >
            <v-card-title class="text-subtitle-1 font-weight-bold">{{ project.name }}</v-card-title>
            <v-card-subtitle class="text-caption mb-3">
              {{ project.taskCount || 0 }} úkolů
            </v-card-subtitle>
            <v-progress-linear
              :model-value="project.progress"
              :color="getProgressColor(project.progress)"
              height="8"
              rounded
            />
            <div class="text-caption text-right mt-1">
              {{ project.progress }} %
            </div>
            <v-card-actions class="mt-3 px-0">
<v-btn
  :to="`/projects/${project.id}`"
  variant="text"
  size="small"
  color="primary"
>
  Zobrazit detail
</v-btn>

            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Úkoly a kalendář -->
      <v-row class="mt-10">
        <!-- Moje úkoly -->
        <v-col cols="12" md="8">
          <v-card class="pa-4" elevation="1" rounded="xl">
            <v-card-title class="text-h6 font-weight-bold mb-4">🧾 Moje úkoly</v-card-title>
            <v-divider class="mb-4"></v-divider>

            <v-row class="mb-4" dense>
  <v-col cols="12" sm="6" md="3">
    <v-select
      v-model="filterStatus"
      :items="[
        { title: 'Všechny', value: '' },
        { title: 'To Do', value: 'todo' },
        { title: 'In Progress', value: 'inprogress' },
        { title: 'Hotovo', value: 'done' }
      ]"
      label="Stav"
      dense
      clearable
    />
  </v-col>

  <!-- Termín -->
  <v-col cols="12" sm="6" md="3">
    <v-select
      v-model="filterDate"
      :items="[
        { title: 'Všechny', value: '' },
        { title: 'Dnes', value: 'today' },
        { title: 'Budoucí', value: 'upcoming' },
        { title: 'Po termínu', value: 'overdue' }
      ]"
      label="Termín"
      dense
      clearable
    />
  </v-col>

    <!-- Priorita -->
  <v-col cols="12" sm="6" md="3">
    <v-select
      v-model="filterPriority"
      :items="[
        { title: 'Všechny', value: '' },
        { title: 'Nízká', value: 'low' },
        { title: 'Střední', value: 'medium' },
        { title: 'Vysoká', value: 'high' }
      ]"
      label="Priorita"
      dense
      clearable
    />
  </v-col>

  <!-- Řazení -->
  <v-col cols="12" sm="6" md="3">
    <v-select
      v-model="sortOrder"
      :items="[
        { title: 'Nejnovější', value: 'desc' },
        { title: 'Nejstarší', value: 'asc' }
      ]"
      label="Seřadit podle"
      dense
    />
  </v-col>
</v-row>
            <v-list v-if="filteredTasks.length" lines="two">
              <v-list-item
  v-for="(task, index) in filteredTasks"
  :key="task.id"
  class="px-0"
>
  <!-- Úkol -->
  <v-list-item-title class="font-weight-medium">
    {{ task.title }}

    <v-chip
      class="ml-2"
      size="x-small"
      label
      :color="getPriorityColor(task.priority)"
      text-color="white"
    >
      {{ task.priority }}
    </v-chip>

    <v-chip
      class="ml-2"
      size="x-small"
      label
      :color="getStatusColor(task.status)"
      variant="tonal"
    >
      {{ task.status }}
    </v-chip>
  </v-list-item-title>

  <v-list-item-subtitle>
    <div class="d-flex align-center justify-space-between">
      <span v-if="task.dueDate">🗓 {{ formatDate(task.dueDate) }}</span>
      <span v-else style="visibility: hidden">placeholder</span>

      <v-btn
        :to="`/projects/${task.projectId}`"
        variant="tonal"
        size="small"
        color="primary"
      >
        Projekt
      </v-btn>
    </div>
  </v-list-item-subtitle>

  <!-- Oddělovač mezi úkoly (kromě posledního) -->
  <v-divider v-if="index < myTasks.length - 1" class="my-3" />
</v-list-item>

            </v-list>
            <v-card-text v-else>
              <v-alert type="info" variant="tonal" border="start" color="primary">
                Nemáš přiřazené žádné úkoly.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Kalendář -->
        <v-col cols="12" md="4">
          <v-card class="pa-4" elevation="1" rounded="xl">
            <v-card-title class="text-h6 font-weight-bold mb-4">📅 Kalendář</v-card-title>
            <v-divider class="mb-3"></v-divider>
            <v-date-picker v-model="selectedDate" color="primary" show-adjacent-months />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>


<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '../firebase'
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'

const projects = ref([])
const myTasks = ref([])
const selectedDate = ref(new Date())
const filterStatus = ref('')
const filterDate = ref('')
const filterPriority = ref('')
const sortOrder = ref('desc') // 'desc' = nejnovější nahoře


const filteredTasks = computed(() => {
  const now = new Date()
  let tasks = myTasks.value.filter(task => {
    // Stav
    if (filterStatus.value && task.status !== filterStatus.value) return false

    // Termín
    if (filterDate.value && task.dueDate?.toDate) {
      const due = task.dueDate.toDate()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filterDate.value === 'today' && due.toDateString() !== today.toDateString()) return false
      if (filterDate.value === 'upcoming' && due <= now) return false
      if (filterDate.value === 'overdue' && due > now) return false
    }

    // Priorita
    if (filterPriority.value && task.priority !== filterPriority.value) return false

    return true
  })

  // Řazení podle createdAt
  return tasks.sort((a, b) => {
    const aDate = a.createdAt?.toDate?.() || new Date(0)
    const bDate = b.createdAt?.toDate?.() || new Date(0)
    return sortOrder.value === 'desc'
      ? bDate - aDate
      : aDate - bDate
  })
})


onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  const q = query(
    collection(db, 'projects'),
    where('members', 'array-contains', user.uid)
  )

  const querySnapshot = await getDocs(q)
  projects.value = []

  for (const docSnap of querySnapshot.docs) {
    const project = { id: docSnap.id, ...docSnap.data() }

    const tasksSnap = await getDocs(
      query(collection(db, 'tasks'), where('projectId', '==', project.id))
    )
    const tasks = tasksSnap.docs.map(doc => doc.data())
    const total = tasks.length
    const done = tasks.filter(t => t.status === 'done').length
    project.progress = total ? Math.round((done / total) * 100) : 0
    project.taskCount = total

    projects.value.push(project)
  }

  const tasksQuery = query(
    collection(db, 'tasks'),
    where('assignedTo', 'array-contains', user.uid)
  )
  const tasksSnap = await getDocs(tasksQuery)
  myTasks.value = tasksSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
})

function formatDate(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString()
}


function getPriorityColor(priority) {
  switch (priority?.toLowerCase()) {
    case 'vysoká':
    case 'high':
      return 'red'
    case 'střední':
    case 'medium':
      return 'orange'
    case 'nízká':
    case 'low':
      return 'green'
    default:
      return 'grey'
  }
}


function getStatusColor(status) {
  switch (status) {
    case 'done': return 'green'
    case 'in progress': return 'orange'
    case 'to do': return 'blue'
    default: return 'grey'
  }
}

function getProgressColor(progress) {
  if (progress >= 80) return 'green'
  if (progress >= 50) return 'orange'
  return 'red'
}
</script>
