<template>
    <div>
      <h2>Registrace</h2>
      <form @submit.prevent="register">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Heslo" required />
        <button type="submit">Registrovat</button>
      </form>
      <p>{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { auth, db } from '../firebase';
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        error: ''
      };
    },
    methods: {
    async register() {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // Zápis do Firestore kolekce "users"
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'member',
          createdAt: new Date()
        });

        this.error = 'Registrace úspěšná!';
      } catch (err) {
        this.error = err.message;
      }
    }
  }
};
</script>
  