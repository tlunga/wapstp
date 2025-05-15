<template>
  <DashboardLayout>
    <v-container fluid>
      <!-- Horní panel -->
      <v-row class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold">Nástěnka</h1>
        <v-btn color="primary" @click="$router.push('/projects/new')">+ Nový projekt</v-btn>
      </v-row>

      <!-- Projekty -->
      <v-row dense>
        <v-col v-for="project in projects" :key="project.id" cols="12" md="6" lg="3">
          <v-card class="pa-4" elevation="1">
            <v-card-title class="text-subtitle-1 font-weight-bold">{{ project.name }}</v-card-title>
            <v-card-subtitle class="text-caption mb-2">
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
            <v-card-actions class="mt-2 px-0">
              <router-link :to="`/projects/${project.id}`">Zobrazit detail</router-link>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Úkoly -->
      <v-row class="mt-8">
        <v-col cols="12" md="8">
          <v-card class="pa-4">
            <h2 class="text-h6 font-weight-bold mb-4">Moje úkoly</h2>
            <v-list v-if="myTasks.length">
              <v-list-item
                v-for="task in myTasks"
                :key="task.id"
                class="px-0"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <strong>{{ task.title }}</strong> – {{ task.status }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="task.dueDate">
                    🗓 {{ formatDate(task.dueDate) }}
                  </v-list-item-subtitle>
                  <router-link :to="`/projects/${task.projectId}`">Otevřít projekt</router-link>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <p v-else>Nemáš přiřazené žádné úkoly.</p>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4">
            <h2 class="text-h6 font-weight-bold mb-4">Kalendář</h2>
            <v-date-picker v-model="selectedDate" color="primary" show-adjacent-months />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { ref, onMounted } from 'vue'
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

function getProgressColor(progress) {
  if (progress >= 80) return 'green'
  if (progress >= 50) return 'orange'
  return 'red'
}
</script>
