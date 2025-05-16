<template>
  <DashboardLayout>
    <v-container>
      <h2>Soukromé zprávy</h2>

      <!-- Vyhledávání uživatele -->
      <v-text-field
        v-model="search"
        label="Vyhledat uživatele podle jména nebo e-mailu"
        prepend-inner-icon="mdi-magnify"
        clearable
        class="mb-4"
      />

      <!-- Výsledky hledání -->
      <v-list v-if="filteredUsers.length && search">
        <v-subheader>Nový chat</v-subheader>
        <v-list-item
          v-for="user in filteredUsers"
          :key="user.uid"
          @click="goToChat(user.uid)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ user.name || user.email }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Existující konverzace -->
      <v-divider class="my-4" />
      <v-list v-if="existingChats.length">
        <v-subheader>Probíhající konverzace</v-subheader>
        <v-list-item
          v-for="chatUser in existingChats"
          :key="chatUser.uid"
          @click="goToChat(chatUser.uid)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ chatUser.name || chatUser.email }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <p v-else class="mt-4">Nemáš žádné aktivní chaty.</p>
    </v-container>
  </DashboardLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc
} from 'firebase/firestore';
import DashboardLayout from '../layouts/DashboardLayout.vue';

export default {
  components: { DashboardLayout },
  setup() {
    const currentUser = auth.currentUser;
    const allUsers = ref([]);
    const existingChats = ref([]);
    const search = ref('');
    const defaultAvatar = 'https://www.w3schools.com/howto/img_avatar.png';

    // Načti všechny uživatele
    onMounted(async () => {
      const userSnap = await getDocs(collection(db, 'users'));
      allUsers.value = userSnap.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser.uid);

      // Načti existující soukromé chaty
      const chatsSnap = await getDocs(
        collection(db, 'privateChats')
      );

      const chatIds = chatsSnap.docs.map(doc => doc.id);
      const matchedUids = chatIds
        .map(id => id.split('_'))
        .filter(pair => pair.includes(currentUser.uid))
        .map(pair => pair.find(uid => uid !== currentUser.uid));

      existingChats.value = allUsers.value.filter(u => matchedUids.includes(u.uid));
    });

    const filteredUsers = computed(() => {
      const q = search.value.toLowerCase();
      return allUsers.value.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });

    const goToChat = (uid) => {
      window.location.href = `/chat/${uid}`;
    };

    return {
      search,
      filteredUsers,
      existingChats,
      goToChat,
      defaultAvatar
    };
  }
};
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style>
