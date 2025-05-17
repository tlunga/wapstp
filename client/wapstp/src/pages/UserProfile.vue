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
                  <v-avatar size="250">
                    <!-- Base64 nebo URL nebo výchozí -->
                    <v-img :src="photoPreview || photoURL || defaultAvatar" alt="Profil" />
                  </v-avatar>
                </v-row>

                <!-- Nahrání obrázku -->
                <v-file-input
  label="Nahrát profilový obrázek"
  prepend-icon="mdi-camera"
  accept="image/*"
  show-size
  dense
  @update:model-value="onFileChange"
  hint="Pouze obrázek (JPEG/PNG), max. velikost 200 kB"
  persistent-hint
/>
<v-form ref="form" @submit.prevent="saveProfile">
  <v-text-field
    v-model="name"
    label="Jméno"
    prepend-inner-icon="mdi-account"
    :rules="nameRules"
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
    :rules="infoRules"
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
    errorMessage: '',
    defaultAvatar: 'https://www.w3schools.com/howto/img_avatar.png',

    // ✅ Pravidla pro validaci
    nameRules: [
      v => !!v || 'Jméno je povinné.',
      v => v.length <= 50 || 'Jméno může mít maximálně 50 znaků.'
    ],
    infoRules: [
      v => !v || v.length <= 1000 || 'Informace mohou mít maximálně 1000 znaků.'
    ]
  }
},
  async mounted() {
    const user = auth.currentUser
    if (!user) return

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

      // Uložíme buď base64 (nový obrázek), nebo ponecháme stávající
      await setDoc(docRef, {
        name: this.name,
        email: this.email,
        info: this.info,
        photoURL: this.photoPreview || this.photoURL
      })

      // Aktualizujeme lokální zobrazení
      this.photoURL = this.photoPreview || this.photoURL
      this.photoPreview = ''
      this.message = 'Profil byl úspěšně uložen.'
    },

onFileChange(file) {
  this.errorMessage = ''
  this.photoPreview = ''

  if (!file) return

  // ✅ MIME typ whitelist
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    this.errorMessage = 'Nepodporovaný typ souboru. Povolené formáty: JPEG, PNG, WEBP.'
    return
  }

  // ✅ Přípona souboru (pro jistotu)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const fileName = file.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  if (!hasValidExtension) {
    this.errorMessage = 'Nepodporovaná přípona souboru.'
    return
  }

  // ✅ Velikost
  const maxSizeKB = 200
  if (file.size > maxSizeKB * 1024) {
    this.errorMessage = `Obrázek je příliš velký. Maximální velikost je ${maxSizeKB} kB.`
    return
  }

  // ✅ Čtení base64 + kontrola prefixu
  const reader = new FileReader()
  reader.onload = e => {
    const result = e.target.result

    // Základní kontrola bezpečného base64 formátu
    if (!result.startsWith('data:image/')) {
      this.errorMessage = 'Soubor nebyl správně načten jako obrázek.'
      return
    }

    this.photoPreview = result
  }
  reader.readAsDataURL(file)
}


  }
}
</script>
