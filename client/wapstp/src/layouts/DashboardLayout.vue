<template>
  <v-app>
    <!-- Horní lišta -->
    <v-app-bar
      app
      color="primary"
      dark
      :style="{ transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)', transition: 'transform 0.3s ease' }"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <!-- Logo + název Projectica přesně uprostřed -->
      <div
        class="d-flex align-center"
        style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);"
      >
        <v-img
          src="src/assets/logo.png"
          alt="Projectica Logo"
          contain
          width="40"
          height="40"
          class="mr-2"
        />
        <span class="text-h6 font-weight-medium">Projectica</span>
      </div>

      <v-spacer />

      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigace vlevo -->
    <v-navigation-drawer app v-model="drawer" color="grey-lighten-4">
      <v-list density="compact" nav>
        <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard" title="Dashboard" />

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
        <v-list-item to="/chats" prepend-icon="mdi-message-text-outline" title="Zprávy" />
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

const drawer = ref(true)
const router = useRouter()
const userProjects = ref([])
const showNavbar = ref(true)
let lastScrollY = window.scrollY

function logout() {
  router.push('/login')
}

function handleScroll() {
  const currentScrollY = window.scrollY
  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    showNavbar.value = false
  } else if (currentScrollY < lastScrollY) {
    showNavbar.value = true
  }
  lastScrollY = currentScrollY
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

  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
