<template>
    <div>
      <h1>Vytvořit nový projekt</h1>
      <form @submit.prevent="createProject">
        <input v-model="name" type="text" placeholder="Název projektu" required />
        <textarea v-model="description" placeholder="Popis projektu" required></textarea>
  
        <label>Členové týmu:</label>
        <div v-for="user in users" :key="user.uid">
          <input
            type="checkbox"
            :value="user.uid"
            v-model="members"
          />
          {{ user.name || user.email }}
        </div>
  
        <button type="submit">Vytvořit</button>
      </form>
    </div>
  </template>
  
  <script>
  import { db, auth } from '../firebase';
  import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        name: '',
        description: '',
        members: [],
        users: []
      };
    },
    async mounted() {
      const snap = await getDocs(collection(db, 'users'));
      this.users = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
  
      // přihlášený uživatel přidán automaticky
      const current = auth.currentUser;
      if (current && !this.members.includes(current.uid)) {
        this.members.push(current.uid);
      }
    },
    methods: {
      async createProject() {
        const user = auth.currentUser;
        if (!user) return;
  
        await addDoc(collection(db, 'projects'), {
          name: this.name,
          description: this.description,
          ownerId: user.uid,
          members: this.members,
          createdAt: serverTimestamp()
        });
  
        this.$router.push('/dashboard');
      }
    }
  };
  </script>
  