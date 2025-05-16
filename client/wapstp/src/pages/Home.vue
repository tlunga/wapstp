<template>
  <v-app>
    <v-main>
      <v-container class="py-12">
        <!-- Nadpis + CTA -->
        <v-row align="center" justify="center" class="text-center mb-12">
          <v-col cols="12" md="8">
            <h1 class="display-1 font-weight-bold">Spravujte týmové projekty jednoduše</h1>
            <p class="text-subtitle-1 mb-6">
              Plánujte, přiřazujte, komunikujte. Vše na jednom místě.
            </p>
            <v-btn color="primary" class="mr-4" @click="$router.push('/register')">
              Začít zdarma
            </v-btn>
            <v-btn variant="outlined" color="primary" @click="$router.push('/login')">
              Přihlásit se
            </v-btn>
          </v-col>
        </v-row>

        <!-- Ilustrační obrázek -->
        <v-row justify="center" class="mb-16">
          <v-col cols="12" md="10">
            <v-img
              src="https://cdn.pixabay.com/photo/2017/06/10/07/18/dashboard-2389216_1280.png"
              alt="Náhled aplikace"
              aspect-ratio="16/9"
              class="rounded elevation-3"
              cover
            />
          </v-col>
        </v-row>

        <!-- Výhody -->
        <v-row class="mb-16" justify="center">
          <v-col
            cols="12"
            md="3"
            v-for="(feature, i) in features"
            :key="i"
            class="text-center"
          >
            <v-icon size="48" color="primary" class="mb-3">{{ feature.icon }}</v-icon>
            <h3 class="font-weight-bold mb-2">{{ feature.title }}</h3>
            <p class="text-body-2">{{ feature.description }}</p>
          </v-col>
        </v-row>

        <!-- Jak to funguje -->
        <v-row class="text-center">
          <v-col cols="12" class="mb-8">
            <h2 class="text-h4 font-weight-bold">Jak to funguje?</h2>
          </v-col>

          <v-col
            v-for="(step, i) in steps"
            :key="i"
            cols="12"
            md="3"
            class="mb-8"
          >
            <v-avatar size="64" color="primary" class="mb-4">
              <v-icon size="36" color="white">{{ step.icon }}</v-icon>
            </v-avatar>
            <h4 class="font-weight-medium">{{ step.title }}</h4>
            <p class="text-body-2">{{ step.description }}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      features: [
        {
          icon: 'mdi-view-dashboard-outline',
          title: 'Přehledná nástěnka',
          description: 'Získejte okamžitý přehled o všech projektech a úkolech.'
        },
        {
          icon: 'mdi-account-multiple-outline',
          title: 'Týmová spolupráce',
          description: 'Přiřazujte členy, diskutujte a sledujte pokrok.'
        },
        {
          icon: 'mdi-chat-outline',
          title: 'Zabudovaný chat',
          description: 'Komunikujte efektivně přímo v rámci projektů.'
        },
        {
          icon: 'mdi-chart-bar',
          title: 'Statistiky',
          description: 'Sledujte dokončené úkoly a pokrok v čase.'
        }
      ],
      steps: [
        {
          icon: 'mdi-account-plus',
          title: 'Zaregistrujte se',
          description: 'Vytvořte si bezplatný účet během pár vteřin.'
        },
        {
          icon: 'mdi-folder-plus',
          title: 'Vytvořte projekt',
          description: 'Založte projekt a pozvěte svůj tým.'
        },
        {
          icon: 'mdi-format-list-bulleted',
          title: 'Přidejte úkoly',
          description: 'Naplánujte, co je třeba udělat.'
        },
        {
          icon: 'mdi-check-circle-outline',
          title: 'Sledujte průběh',
          description: 'Označujte splněné úkoly a sledujte progres.'
        }
      ]
    };
  }
};
</script>
