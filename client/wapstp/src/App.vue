<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Navbar from './components/Navbar.vue';

const user = ref(null);
const userRole = ref(null);
const route = useRoute();

// Sledujeme změnu přihlášení
onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    user.value = u;
    if (u) {
      await fetchUserRole();
    }
  });
});

async function fetchUserRole() {
  if (!user.value) return;
  const docRef = doc(db, 'users', user.value.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    userRole.value = docSnap.data().role;
  }
}

async function logout() {
  await signOut(auth);
  user.value = null;
  userRole.value = null;
}


// Cesty bez navigace
const hideNavbar = computed(() =>
  ['/', '/login', '/register'].includes(route.path)
);
</script>

<template>
  <div>
    <Navbar v-if="!hideNavbar" />
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
