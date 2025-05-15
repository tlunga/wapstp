<template>
  <DashboardLayout>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">Vytvořit nový projekt</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="createProject">
                <!-- Název a popis -->
                <v-text-field
                  v-model="name"
                  label="Název projektu"
                  prepend-inner-icon="mdi-folder"
                  required
                />
                <v-textarea
                  v-model="description"
                  label="Popis projektu"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  required
                />

                <v-divider class="my-4" />

                <!-- Vyhledávání členů -->
                <h4 class="text-subtitle-1 mb-2">Členové týmu</h4>
                <v-text-field
                  v-model="searchUserQuery"
                  label="Hledat uživatele"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                  class="mb-4"
                />

                <!-- Výběr členů -->
                <v-row>
                  <v-col
                    v-for="user in filteredUsers"
                    :key="user.uid"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-checkbox
                      :label="user.name || user.email"
                      :value="user.uid"
                      v-model="members"
                      hide-details
                      density="compact"
                    />
                  </v-col>
                </v-row>

                <!-- Odeslání -->
                <v-btn type="submit" color="primary" class="mt-4">Vytvořit projekt</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>

<script>
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import DashboardLayout from '../layouts/DashboardLayout.vue'

export default {
  components: {
    DashboardLayout
  },
  data() {
    return {
      name: '',
      description: '',
      members: [],
      users: [],
      searchUserQuery: ''
    }
  },
  async mounted() {
    const snap = await getDocs(collection(db, 'users'))
    this.users = snap.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))

    const current = auth.currentUser
    if (current && !this.members.includes(current.uid)) {
      this.members.push(current.uid)
    }
  },
  computed: {
    filteredUsers() {
      const query = this.searchUserQuery.toLowerCase()
      return this.users.filter(u => {
        const name = u.name?.toLowerCase() || ''
        const email = u.email?.toLowerCase() || ''
        return name.includes(query) || email.includes(query)
      })
    }
  },
  methods: {
    async createProject() {
      const user = auth.currentUser
      if (!user) return

      await addDoc(collection(db, 'projects'), {
        name: this.name,
        description: this.description,
        ownerId: user.uid,
        members: this.members,
        createdAt: serverTimestamp()
      })

      this.$router.push('/dashboard')
    }
  }
}
</script>
