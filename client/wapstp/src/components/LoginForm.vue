<template>
    <div>
      <h2>Přihlášení</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Heslo" required />
        <button type="submit">Přihlásit se</button>
      </form>
      <p>{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { auth } from '../firebase';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        error: ''
      };
    },
    methods: {
      async login() {
        try {
          await signInWithEmailAndPassword(auth, this.email, this.password);
          this.error = 'Přihlášení úspěšné!';
          this.$emit('userLoggedIn');
        } catch (err) {
          this.error = err.message;
        }
      }
    }
  };
  </script>
  