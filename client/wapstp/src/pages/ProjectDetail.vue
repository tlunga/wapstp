<template>
  <div v-if="project">
    <h1>{{ project.name }}</h1>
    <p>{{ project.description }}</p>
    <p><strong>Vytvořeno:</strong> {{ formatDate(project.createdAt) }}</p>
  </div>

  <div v-else>
    <p>Načítám projekt...</p>
  </div>
</template>

<script>
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  data() {
    return {
      project: null
    };
  },
  async mounted() {
    const projectId = this.$route.params.id;
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.project = {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      this.project = null;
    }
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return 'Neznámé datum';
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    }
  }
};
</script>
