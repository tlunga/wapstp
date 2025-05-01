<template>
    <div>
      <h1>Vytvořit nový projekt</h1>
      <form @submit.prevent="createProject">
        <input v-model="name" type="text" placeholder="Název projektu" required />
        <textarea v-model="description" placeholder="Popis projektu" required></textarea>
        <button type="submit">Vytvořit</button>
        <p v-if="error" style="color:red">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script>
  import { db, auth } from '../firebase';
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        name: '',
        description: '',
        error: ''
      };
    },
    methods: {
      async createProject() {
        try {
          const user = auth.currentUser;
          if (!user) {
            this.error = 'Musíte být přihlášen.';
            return;
          }
  
          await addDoc(collection(db, 'projects'), {
            name: this.name,
            description: this.description,
            createdAt: serverTimestamp(),
            ownerId: user.uid
          });
  
          this.$router.push('/dashboard');
        } catch (err) {
          this.error = 'Chyba při vytváření projektu: ' + err.message;
        }
      }
    }
  };
  </script>
  