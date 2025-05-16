<template>
  <DashboardLayout>
    <v-container>
      <h2>Chat s {{ recipient?.name || recipient?.email || '...' }}</h2>

      <div class="chat-box">
        <div class="chat-messages" ref="chatContainer">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['chat-message', msg.userId === currentUser.uid ? 'me' : 'other']"
          >
            <div class="message">
              {{ msg.text }}
              <div class="meta">{{ formatTimestamp(msg.createdAt) }}</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="chat-form">
          <v-text-field
            v-model="newMessage"
            label="Napiš zprávu..."
            dense
            hide-details
            variant="outlined"
            append-icon="mdi-send"
            @click:append="sendMessage"
          />
        </form>
      </div>
    </v-container>
  </DashboardLayout>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import DashboardLayout from '../layouts/DashboardLayout.vue';

export default {
  components: { DashboardLayout },
  setup() {
    const route = useRoute();
    const recipientUid = route.params.uid;
    const currentUser = auth.currentUser;

    const recipient = ref(null);
    const newMessage = ref('');
    const messages = ref([]);
    const chatContainer = ref(null);

    const getChatId = (uid1, uid2) =>
      uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;

    const chatId = getChatId(currentUser.uid, recipientUid);

    const loadRecipient = async () => {
      const docRef = doc(db, 'users', recipientUid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        recipient.value = { uid: docSnap.id, ...docSnap.data() };
      }
    };

    const listenToMessages = () => {
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

      const msg = {
        text: newMessage.value,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'privateChats', chatId, 'messages'), msg);
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

    onMounted(() => {
      loadRecipient();
      listenToMessages();
    });

    return {
      recipient,
      currentUser,
      newMessage,
      messages,
      chatContainer,
      sendMessage,
      formatTimestamp
    };
  }
};
</script>

<style scoped>
.message {
  background-color: #bfdbfe;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  margin: 0.3rem 0;
  max-width: 70%; /* omezí maximální šířku zprávy */
  word-break: break-word; /* zalomí dlouhá slova */
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
.chat-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  background: #fff;
  height: 500px;
  display: flex;
  flex-direction: column;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
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
.chat-message .text {
  max-width: 70%;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  background: #e3f2fd;
  position: relative;
}
.chat-message.me .text {
  background: #bbdefb;
}
.meta {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: right;
}
.chat-form {
  margin-top: 1rem;
}
</style>
