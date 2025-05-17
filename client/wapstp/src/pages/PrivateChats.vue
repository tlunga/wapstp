<template>
  <DashboardLayout>
    <v-container fluid>
      <v-row class="chat-container" no-gutters>
  <!-- Levý panel: seznam uživatelů -->
  <v-col cols="12" md="4" class="chat-sidebar">
    <v-sheet class="pa-4" color="#f9f9f9" height="100%" elevation="1">
      <h2 class="text-h6 font-weight-medium mb-4">Soukromé zprávy</h2>
      <v-text-field
        v-model="search"
        label="Vyhledat uživatele podle jména nebo e-mailu"
        prepend-inner-icon="mdi-magnify"
        clearable
        class="mb-4"
        dense
        hide-details
      />

      <!-- Výsledky hledání -->
      <v-list v-if="filteredUsers.length && search" density="compact">
        <v-subheader>Nový chat</v-subheader>
        <v-list-item
          v-for="user in filteredUsers"
          :key="user.uid"
          @click="selectUser(user)"
          class="chat-item"
        >
          <v-list-item-title>{{ user.name || user.email }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider class="my-4" />
      <v-list v-if="existingChats.length" density="compact">
        <v-subheader>Probíhající konverzace</v-subheader>
        <v-list-item
          v-for="chatUser in existingChats"
          :key="chatUser.uid"
          @click="selectUser(chatUser)"
          class="chat-item"
        >
          <v-list-item-title>{{ chatUser.name || chatUser.email }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <p v-else class="mt-4 text-grey">Nemáš žádné aktivní chaty.</p>
    </v-sheet>
  </v-col>

  <!-- Pravý panel: otevřený chat -->
  <v-col cols="12" md="8" class="chat-panel">
    <v-sheet class="chat-sheet" elevation="3" rounded v-if="recipient">
      <v-toolbar flat color="transparent" class="mb-2">
        <v-avatar size="40" class="mr-3">
          <v-img v-if="recipient.photoURL" :src="recipient.photoURL" />
          <v-icon v-else>mdi-account-circle</v-icon>
        </v-avatar>
        <div>
<h2 class="text-h6 font-weight-medium mb-0">
  Chat s
  <router-link
    v-if="recipient"
    :to="`/user/${recipient.uid}`"
    class="chat-user-link"
  >
    {{ recipient.name || recipient.email }}
  </router-link>
</h2>

        </div>
      </v-toolbar>

      <div class="chat-messages flex-grow-1" ref="chatContainer">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['chat-message', msg.userId === currentUser.uid ? 'me' : 'other']"
        >
          <v-card
            :color="msg.userId === currentUser.uid ? 'blue-lighten-4' : 'grey-lighten-3'"
            class="pa-3 message"
            elevation="1"
            max-width="70%"
            rounded="xl"
          >
            <div>{{ msg.text }}</div>
            <div class="meta">{{ formatTimestamp(msg.createdAt) }}</div>
          </v-card>
        </div>
      </div>

      <v-form @submit.prevent="sendMessage" class="chat-form mt-3">
        <v-text-field
          v-model="newMessage"
          label="Napiš zprávu..."
          dense
          hide-details
          variant="outlined"
          append-icon="mdi-send"
          @click:append="sendMessage"
        />
      </v-form>
    </v-sheet>
    <v-sheet v-else class="pa-4 text-center text-grey" height="100%">
      <p>Vyber uživatele pro zahájení konverzace.</p>
    </v-sheet>
  </v-col>
</v-row>
    </v-container>
  </DashboardLayout>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { auth, db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import DashboardLayout from '../layouts/DashboardLayout.vue';

export default {
  components: { DashboardLayout },
  setup() {
    const currentUser = auth.currentUser;
    const allUsers = ref([]);
    const existingChats = ref([]);
    const search = ref('');
    const recipient = ref(null);
    const recipientUid = ref(null);
    const newMessage = ref('');
    const messages = ref([]);
    const chatContainer = ref(null);

    const getChatId = (uid1, uid2) =>
      uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      allUsers.value = snap.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== currentUser.uid);

      const chatsSnap = await getDocs(collection(db, 'privateChats'));
      const chatIds = chatsSnap.docs.map(doc => doc.id);
      const matchedUids = chatIds
        .map(id => id.split('_'))
        .filter(pair => pair.includes(currentUser.uid))
        .map(pair => pair.find(uid => uid !== currentUser.uid));

      existingChats.value = allUsers.value.filter(u => matchedUids.includes(u.uid));
    };

    const filteredUsers = computed(() => {
      const q = search.value.toLowerCase();
      return allUsers.value.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });

    const selectUser = async (user) => {
      recipient.value = user;
      recipientUid.value = user.uid;
      await listenToMessages();
    };

    const listenToMessages = async () => {
      const chatId = getChatId(currentUser.uid, recipientUid.value);

      const q = query(
        collection(db, 'privateChats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      onSnapshot(q, snapshot => {
        messages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        scrollToBottom();
      });
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      const chatId = getChatId(currentUser.uid, recipientUid.value);
      const chatRef = doc(db, 'privateChats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, recipientUid.value],
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(chatRef, {
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await addDoc(collection(db, 'privateChats', chatId, 'messages'), {
        text: newMessage.value,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp()
      });

      newMessage.value = '';
    };

    const scrollToBottom = () => {
      setTimeout(() => {
        const el = chatContainer.value;
        if (el) el.scrollTop = el.scrollHeight;
      }, 100);
    };

    const formatTimestamp = (ts) => {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    };

    onMounted(loadUsers);

    return {
      search,
      filteredUsers,
      existingChats,
      currentUser,
      recipient,
      newMessage,
      messages,
      chatContainer,
      selectUser,
      sendMessage,
      formatTimestamp
    };
  }
};
</script>

<style scoped>

.chat-user-link {
  margin-left: 4px;
  color: #1976d2; /* primární modrá Vuetify */
  font-weight: 500;
  text-decoration: none;
}

.chat-user-link:hover {
  text-decoration: none; /* zajistí, že ani po hoveru nebude podtržení */
  color: #1565c0; /* tmavší modrá na hover */
}

.chat-sheet {
  height: 750px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.chat-message {
  margin-bottom: 0.75rem;
  display: flex;
}
.chat-message.me {
  justify-content: flex-end;
}
.chat-message.other {
  justify-content: flex-start;
}
.message {
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.meta {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: right;
}
.chat-form {
  padding-top: 0rem;
}
.v-list-item {
  cursor: pointer;
}
</style>
