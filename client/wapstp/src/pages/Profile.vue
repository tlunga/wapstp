<template>
    <div class="profile-page">
      <h1>Můj profil</h1>
  
      <form @submit.prevent="saveProfile">
        <label for="name">Jméno:</label>
        <input v-model="name" type="text" id="name" required />
  
        <label for="email">Email:</label>
        <input v-model="email" type="email" id="email" disabled />
  
        <label for="info">Informace:</label>
        <textarea v-model="info" id="info" rows="4" />
  
        <button type="submit">Upravit profil</button>
        <p v-if="message" style="color: green;">{{ message }}</p>
      </form>
    </div>
  </template>
  
  <script>
  import { auth, db } from '../firebase';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        name: '',
        email: '',
        info: '',
        message: ''
      };
    },
    async mounted() {
  onAuthStateChanged(auth, async (user) => {
    console.log('✅ Uživatel z onAuthStateChanged:', user);
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      this.name = data.name || '';
      this.email = data.email || user.email;
      this.info = data.info || '';
    } else {
      this.email = user.email;
      this.name = '';
      this.info = '';
      await setDoc(docRef, {
        name: this.name,
        email: this.email,
        info: this.info
      });
    }
  });
},
    
    methods: {
      async saveProfile() {
        const user = auth.currentUser;
        if (!user) return;
  
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          name: this.name,
          email: this.email,
          info: this.info
        });
  
        this.message = 'Profil byl úspěšně uložen.';
      }
    }
  };
  </script>
  
  <style scoped>
  .profile-page {
    max-width: 500px;
    margin: 2rem auto;
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  }
  
  label {
    display: block;
    margin-top: 1rem;
    font-weight: bold;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 0.6rem;
    margin-top: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  button {
    margin-top: 1.5rem;
    padding: 0.6rem 1.2rem;
    background-color: #3b82f6;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #2563eb;
  }
  </style>
  