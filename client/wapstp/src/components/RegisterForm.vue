<template>
  <div>
    <h2>Registrace</h2>
    <form @submit.prevent="register">
      <input v-model="firstName" type="text" placeholder="Jméno" required />
      <input v-model="lastName" type="text" placeholder="Příjmení" required />
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
import { setDoc, doc } from 'firebase/firestore';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async register() {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );

        const user = userCredential.user;

        // Uložit údaje do kolekce users
        await setDoc(doc(db, 'users', user.uid), {
          email: this.email,
          name: this.firstName + ' ' + this.lastName
        });

        this.error = 'Registrace úspěšná!';
      } catch (err) {
        this.error = err.message;
      }
    }
  }
};
</script>
 