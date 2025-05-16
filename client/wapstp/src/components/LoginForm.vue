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
                <v-form @submit.prevent="login" v-model="valid" ref="loginForm">
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
                  <v-btn type="submit" color="primary" class="mt-2" block>Přihlásit se</v-btn>
                  <v-alert
  v-if="error"
  type="error"
  class="mt-3"
  prominent
  border="left"
  colored-border
  elevation="2"
>
  {{ error }}
</v-alert>
                  <br>
                  <v-btn variant="text" class="mt-4" block @click="$router.push('/register')">
                    Ještě nemáš účet? Zaregistruj se
                  </v-btn>
                  <br>
                  <v-btn variant="text" block @click="$router.push('/')">
                    ← Zpět na úvodní stránku
                  </v-btn>
                  <br>
                  <v-btn variant="text" block @click="showResetDialog = true">
                    Zapomněli jste heslo?
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
  <v-dialog v-model="showResetDialog" max-width="400">
  <v-card>
    <v-card-title>Obnovit heslo</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="resetEmail"
        label="Zadejte svůj e-mail"
        type="email"
        required
      />
      <v-alert
        v-if="resetMessage"
        type="info"
        dense
        class="mt-2"
      >
        {{ resetMessage }}
      </v-alert>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn text @click="showResetDialog = false">Zrušit</v-btn>
      <v-btn color="primary" @click="sendResetEmail">Odeslat</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</template>

<script>
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
      showResetDialog: false,
      resetEmail: '',
      resetMessage: '',
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
    async login() {
  const isValid = await this.$refs.loginForm.validate();
  if (!isValid) return;

  try {
    await signInWithEmailAndPassword(auth, this.email, this.password);
    this.error = '';
    this.$emit('userLoggedIn');
    this.$router.push('/dashboard');
  } catch (err) {
    // 🔽 Zobrazit vlastní přívětivé hlášky podle kódu chyby
    switch (err.code) {
      case 'auth/user-not-found':
        this.error = 'Uživatel s tímto e-mailem nebyl nalezen.';
        break;
      case 'auth/wrong-password':
        this.error = 'Zadali jste nesprávné heslo.';
        break;
      case 'auth/invalid-email':
        this.error = 'E-mail nemá platný formát.';
        break;
      case 'auth/too-many-requests':
        this.error = 'Příliš mnoho pokusů o přihlášení. Zkuste to později.';
        break;
      default:
        this.error = 'Přihlášení se nezdařilo. Zkuste to znovu.';
    }
  }
},
    async sendResetEmail() {
      console.log('Zasílám reset hesla na:', this.resetEmail);
      try {
        await sendPasswordResetEmail(auth, this.resetEmail);
        this.resetMessage = 'Odkaz na obnovení hesla byl odeslán.';
        console.log('Reset hesla odeslán.');
      } catch (err) {
        this.resetMessage = 'Nepodařilo se odeslat e-mail: ' + err.message;
        console.error(err);
      }
    }
  }
};
</script>
