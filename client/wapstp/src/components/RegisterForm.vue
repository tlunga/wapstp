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
                <v-form @submit.prevent="register" v-model="valid" ref="form">
                  <v-text-field
                    v-model="firstName"
                    label="Jméno"
                    :rules="[v => !!v || 'Jméno je povinné']"
                    required
                  />
                  <v-text-field
                    v-model="lastName"
                    label="Příjmení"
                    :rules="[v => !!v || 'Příjmení je povinné']"
                    required
                  />
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    :rules="emailRules"
                    required
                  />
                  <v-text-field
                    v-model="password"
                    label="Heslo"
                    type="password"
                    :rules="passwordRules"
                    required
                  />
                  <v-text-field
                    v-model="confirmPassword"
                    label="Heslo znovu"
                    type="password"
                    :rules="[v => v === password || 'Hesla se neshodují']"
                    required
                  />

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

                  <v-btn variant="text" class="mt-4" block @click="$router.push('/login')">
                    Máš už účet? Přihlas se
                  </v-btn>
                  <br />
                  <v-btn variant="text" block @click="$router.push('/')">
                    ← Zpět na úvodní stránku
                  </v-btn>
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
      confirmPassword: '',
      error: '',
      valid: true,
      emailRules: [
        v => !!v || 'E-mail je povinný',
        v => /.+@.+\..+/.test(v) || 'Neplatný formát e-mailu'
      ],
      passwordRules: [
        v => !!v || 'Heslo je povinné',
        v => v.length >= 6 || 'Heslo musí mít alespoň 6 znaků'
      ]
    };
  },
  methods: {
    async register() {
      const isValid = await this.$refs.form.validate();
      if (!isValid) return;

      if (this.password !== this.confirmPassword) {
        this.error = 'Hesla se neshodují.';
        return;
      }

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
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'Tento e-mail je již zaregistrovaný.';
        } else {
          this.error = 'Registrace se nezdařila: ' + err.message;
        }
      }
    }
  }
};
</script>
