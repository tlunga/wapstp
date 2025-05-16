<template>
  <DashboardLayout>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-card class="pa-4 text-center">
            <v-avatar size="100" class="mb-4 mx-auto">
              <v-img :src="user.photoURL || defaultAvatar" alt="Profilový obrázek" />
            </v-avatar>

            <v-card-title class="text-h6 font-weight-bold">
              {{ user.name || 'Neznámý uživatel' }}
            </v-card-title>

            <v-card-subtitle class="mb-2">
              <v-icon start>mdi-email</v-icon> {{ user.email }}
            </v-card-subtitle>

            <v-card-text>
              <p><strong>Informace:</strong></p>
              <p>{{ user.info || '—' }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>

<script>
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import DashboardLayout from '../layouts/DashboardLayout.vue'

export default {
  components: {
    DashboardLayout
  },
  data() {
    return {
      user: {},
      defaultAvatar: 'https://www.w3schools.com/howto/img_avatar.png'
    }
  },
  async mounted() {
    const userId = this.$route.params.uid
    const docSnap = await getDoc(doc(db, 'users', userId))
    if (docSnap.exists()) {
      this.user = { uid: docSnap.id, ...docSnap.data() }
    }
  }
}
</script>
