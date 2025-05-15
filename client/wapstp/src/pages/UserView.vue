<template>
  <div class="user-profile">
    <img :src="user.photoURL || defaultAvatar" alt="Profilový obrázek" class="avatar" />
    <h2>{{ user.name }}</h2>
    <p><strong>Email:</strong> {{ user.email }}</p>
    <p><strong>Informace:</strong> {{ user.info || '—' }}</p>
  </div>
</template>

<script>
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      user: {},
      defaultAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
    };
  },
  async mounted() {
    const userId = this.$route.params.uid;
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      this.user = { uid: docSnap.id, ...docSnap.data() };
    }
  }
};
</script>

<style scoped>
.user-profile {
  max-width: 500px;
  margin: 2rem auto;
  background: #f9fafb;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
  margin-bottom: 1rem;
}
</style>
