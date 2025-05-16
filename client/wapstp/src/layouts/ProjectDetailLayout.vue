<template>
  <v-app>
    <!-- Horní lišta -->
    <v-app-bar app color="indigo" dark>
      <v-btn icon @click="$router.push('/dashboard')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ title || 'Detail projektu' }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigační panel vlevo -->
    <v-navigation-drawer app v-model="drawer" color="grey-lighten-4">
      <v-list density="compact" nav>
        <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard" title="Dashboard" />

        <!-- Projekty - rozbalovací -->
        <v-list-group prepend-icon="mdi-folder" value="true" no-action>
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Projekty" />
          </template>

          <v-list-item to="/projects/new" title="Nový projekt" prepend-icon="mdi-plus" />

          <v-list-item
            v-for="project in userProjects"
            :key="project.id"
            :to="`/projects/${project.id}`"
            :title="project.name"
            prepend-icon="mdi-file"
          />
        </v-list-group>

        <v-list-item to="/profile" prepend-icon="mdi-account" title="Profil" />
      </v-list>
    </v-navigation-drawer>

    <!-- Obsah -->
    <v-main>
      <v-container class="py-4">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const drawer = ref(true)
const router = useRouter()
const userProjects = ref([])

function logout() {
  router.push('/login')
}

onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  const q = query(collection(db, 'projects'), where('members', 'array-contains', user.uid))
  const snapshot = await getDocs(q)
  userProjects.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
})
</script>
