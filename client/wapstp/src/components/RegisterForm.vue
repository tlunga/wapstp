<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Team Project Manager</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height" fluid>
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="4">
            <v-card>
              <v-card-title class="text-h6 font-weight-bold">Registrace</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="register">
                  <v-text-field v-model="firstName" label="Jméno" required />
                  <v-text-field v-model="lastName" label="Příjmení" required />
                  <v-text-field v-model="email" label="Email" type="email" required />
                  <v-text-field v-model="password" label="Heslo" type="password" required />
                  <v-btn type="submit" color="primary" class="mt-2" block>Registrovat</v-btn>
                  <v-alert
                    v-if="error"
                    type="error"
                    class="mt-3"
                    dense
                    text
                  >
                    {{ error }}
                  </v-alert>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
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

        await setDoc(doc(db, 'users', user.uid), {
          email: this.email,
          name: this.firstName + ' ' + this.lastName
        });

        this.error = '';
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = err.message;
      }
    }
  }
};
</script>
