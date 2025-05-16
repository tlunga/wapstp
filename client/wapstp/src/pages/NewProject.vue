<template>
  <DashboardLayout>
    <v-container class="py-10">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card elevation="2">
            <v-card-title class="text-h6 font-weight-bold">
              <v-icon left class="mr-2">mdi-folder-plus</v-icon>
              Vytvořit nový projekt
            </v-card-title>

            <v-divider />

            <v-card-text>
              <v-form ref="formRef" v-model="valid" @submit.prevent="createProject">
                <!-- Název projektu -->
                <v-text-field
                  v-model="name"
                  label="Název projektu"
                  prepend-inner-icon="mdi-format-title"
                  :rules="nameRules"
                  required
                />

                <!-- Popis projektu -->
                <v-textarea
                  v-model="description"
                  label="Popis projektu"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  required
                />

                <v-divider class="my-6" />

                <!-- Hledání uživatelů -->
                <v-text-field
                  v-model="searchUserQuery"
                  label="Vyhledat uživatele"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                />

                <!-- Výběr uživatelů -->
                <v-row>
                  <v-col
                    v-for="user in filteredUsers"
                    :key="user.uid"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-checkbox
                      v-model="members"
                      :value="user.uid"
                      :label="`${user.name || user.email}  (${user.email})`"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                </v-row>

                <!-- Tlačítko odeslání -->
                <v-btn type="submit" color="primary" class="mt-4" block>
                  <v-icon start>mdi-check</v-icon>
                  Vytvořit projekt
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

const router = useRouter()

const formRef = ref(null)
const valid = ref(true)

const name = ref('')
const description = ref('')
const members = ref([])
const users = ref([])
const searchUserQuery = ref('')

const nameRules = [
  v => !!v || 'Název projektu je povinný'
]

const filteredUsers = computed(() => {
  const query = searchUserQuery.value.toLowerCase()
  return users.value.filter(u => {
    const name = u.name?.toLowerCase() || ''
    const email = u.email?.toLowerCase() || ''
    return name.includes(query) || email.includes(query)
  })
})

onMounted(async () => {
  const snap = await getDocs(collection(db, 'users'))
  users.value = snap.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }))

  const current = auth.currentUser
  if (current && !members.value.includes(current.uid)) {
    members.value.push(current.uid)
  }
})

const createProject = async () => {
  const result = await formRef.value.validate()
  if (!result.valid) return

  const user = auth.currentUser
  if (!user) return

  await addDoc(collection(db, 'projects'), {
    name: name.value,
    description: description.value,
    ownerId: user.uid,
    members: members.value,
    createdAt: serverTimestamp()
  })

  router.push('/dashboard')
}
</script>
