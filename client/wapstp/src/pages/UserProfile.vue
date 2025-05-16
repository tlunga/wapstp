<template>
  <DashboardLayout>
    <v-container class="py-6">
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">Můj profil</v-card-title>
            <v-card-text>
              <v-container>
                <!-- Profilový obrázek -->
                <v-row justify="center" class="mb-4">
                  <v-avatar size="100">
                    <v-img :src="photoPreview || photoURL || defaultAvatar" alt="Profil" />
                  </v-avatar>
                </v-row>

                <!-- Nahrání obrázku -->
                <v-file-input
                  label="Nahrát profilový obrázek"
                  prepend-icon="mdi-camera"
                  accept="image/*"
                  @change="onFileChange"
                  show-size
                  dense
                />

                <v-form @submit.prevent="saveProfile">
                  <v-text-field
                    v-model="name"
                    label="Jméno"
                    prepend-inner-icon="mdi-account"
                    required
                  />
                  <v-text-field
                    v-model="email"
                    label="Email"
                    prepend-inner-icon="mdi-email"
                    disabled
                  />
                  <v-textarea
                    v-model="info"
                    label="Informace o mně"
                    rows="3"
                    prepend-inner-icon="mdi-information"
                  />

                  <v-btn type="submit" color="primary" class="mt-4" block>Uložit profil</v-btn>

                  <v-alert
                    v-if="message"
                    type="success"
                    class="mt-4"
                    dense
                    text
                  >
                    {{ message }}
                  </v-alert>
                </v-form>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { auth, db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default {
  components: {
    DashboardLayout
  },
  data() {
    return {
      name: '',
      email: '',
      info: '',
      photoURL: '',
      photoPreview: '',
      message: '',
      defaultAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
    }
  },
  async mounted() {
    const user = auth.currentUser
    if (!user) return

    this.photoURL = user.photoURL || ''
    this.email = user.email

    const docRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      this.name = data.name || ''
      this.info = data.info || ''
      this.photoURL = data.photoURL || ''
    }
  },
  methods: {
    async saveProfile() {
      const user = auth.currentUser
      if (!user) return

      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, {
        name: this.name,
        email: this.email,
        info: this.info,
        photoURL: this.photoPreview || this.photoURL // preferuje lokální náhled, pokud byl nahrán
      })

      this.photoURL = this.photoPreview || this.photoURL
      this.photoPreview = ''
      this.message = 'Profil byl úspěšně uložen.'
    },

    onFileChange(file) {
      if (!file) {
        this.photoPreview = ''
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        this.photoPreview = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
}
</script>
