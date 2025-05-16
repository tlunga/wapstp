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
              <v-card-text>
                <v-form @submit.prevent="login">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    required
                  />
                  <v-text-field
                    v-model="password"
                    label="Heslo"
                    type="password"
                    required
                  />
                  <v-btn type="submit" color="primary" class="mt-2" block>Přihlásit se</v-btn>
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
        this.error = '';
        this.$emit('userLoggedIn');
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = err.message;
      }
    }
  }
};
</script>
