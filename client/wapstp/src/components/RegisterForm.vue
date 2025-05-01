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
  import { auth } from '../firebase';
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  
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
          await createUserWithEmailAndPassword(auth, this.email, this.password);
          this.error = 'Registrace úspěšná!';
        } catch (err) {
          this.error = err.message;
        }
      }
    }
  };
  </script>
  