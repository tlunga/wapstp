<template>
  <ProjectDetailLayout :title="project?.name">
  <div v-if="project">
    <h1>{{ project.name }}</h1>
    <p>{{ project.description }}</p>

    <!-- Sekce členové + chat v jedné řádce -->
<v-row class="my-6" align="start">
  <!-- Členové projektu -->
  <v-col cols="12" md="6">
    <h3 class="mb-4">Členové projektu:</h3>
    <v-row>
      <v-col
        v-for="user in membersInfo"
        :key="user.uid"
        cols="4"
        class="text-center"
      >
        <router-link
          :to="`/user/${user.uid}`"
          style="text-decoration: none; color: inherit;"
        >
          <v-avatar size="64" class="mx-auto mb-2">
            <v-img
              :src="user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png'"
            />
          </v-avatar>
          <div class="font-weight-medium">{{ user.name || user.email }}</div>
          <div
            v-if="user.uid === project.ownerId"
            class="text-caption"
            style="color: #10b981"
          >
            vedoucí
          </div>
        </router-link>
      </v-col>
    </v-row>
  </v-col>

  <!-- Chat -->
  <v-col cols="12" md="6">
    <v-card class="pa-4">
      <h3 class="mb-4">Projektový chat</h3>
      <div class="chat-messages" ref="chatContainer" style="max-height: 250px; overflow-y: auto;">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="mb-2 pa-2"
          style="background: #f3f4f6; border-radius: 8px;"
        >
          <strong>{{ msg.userName }}:</strong> {{ msg.text }}<br />
          <small style="color: #6b7280">{{ formatTimestamp(msg.createdAt) }}</small>
        </div>
      </div>

      <form @submit.prevent="sendMessage" class="d-flex mt-4" style="gap: 0.5rem;">
        <v-text-field
          v-model="newMessage"
          label="Napsat zprávu..."
          dense
          hide-details
          outlined
          class="flex-grow-1"
        />
        <v-btn color="primary" type="submit">Odeslat</v-btn>
      </form>
    </v-card>
  </v-col>
</v-row>
    
<v-btn color="primary" class="my-4" @click="openTaskDialog">+ Přidat úkol</v-btn>

<v-btn color="secondary" class="ml-2" v-if="isOwner" @click="showMembersDialog = true">
  Správa členů
</v-btn>

<v-btn
  v-if="isOwner"
  color="warning"
  class="ml-2"
  @click="showEditProjectDialog = true"
>
  Upravit projekt
</v-btn>

<v-btn
  v-if="isOwner"
  color="error"
  class="ml-2"
  @click="showDeleteDialog = true"
>
  Smazat projekt
</v-btn>

<v-btn
  v-if="project && currentUserId && project.members.includes(currentUserId)"
  color="error"
  class="ml-2"
  @click="leaveDialog = true"
>
  Odejít z projektu
</v-btn>


<v-dialog v-model="leaveDialog" max-width="500">
  <v-card>
    <v-card-title class="text-h6">Odejít z projektu?</v-card-title>
    <v-card-text>
      <div v-if="isOwner && project.members.length > 1">
        Jste vedoucím projektu. Než odejdete, musíte zvolit nového vedoucího:
        <v-select
          v-model="newOwnerId"
          :items="project.members
            .filter(uid => uid !== currentUserId)
            .map(uid => ({ text: usersMap[uid], value: uid }))"
          label="Nový vedoucí"
          item-title="text"
          item-value="value"
          dense
          outlined
        />
      </div>
      <div v-else-if="isOwner && project.members.length === 1">
        Jste jediným členem projektu. Projekt bude smazán.
      </div>
      <div v-else>
        Opravdu chcete odejít z projektu?
      </div>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn text @click="leaveDialog = false">Zrušit</v-btn>
      <v-btn color="error" @click="leaveProject">Odejít</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>






<v-dialog v-model="showDeleteDialog" max-width="500">
  <v-card>
    <v-card-title class="text-h6">Opravdu chcete smazat projekt?</v-card-title>
    <v-card-text>Tímto krokem nenávratně odstraníte projekt a všechny jeho úkoly.</v-card-text>
    <v-card-actions class="justify-end">
      <v-btn text @click="showDeleteDialog = false">Zrušit</v-btn>
      <v-btn color="error" @click="deleteProject">Smazat</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="showEditProjectDialog" max-width="600px">
  <v-card>
    <v-card-title>
      <span class="text-h6">Úprava projektu</span>
      <v-spacer />
      <v-btn icon @click="showEditProjectDialog = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="editProjectName"
        label="Název projektu"
        outlined
        dense
        required
      />
      <v-textarea
        v-model="editProjectDescription"
        label="Popis projektu"
        outlined
        rows="4"
        dense
      />
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn color="primary" @click="saveProjectChanges">Uložit změny</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- Dialog pro výběr členů -->
<v-dialog v-model="showMembersDialog" max-width="600px">
  <v-card>
    <v-card-title>
      <span class="text-h6">Správa členů týmu</span>
      <v-spacer />
      <v-btn icon @click="showMembersDialog = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="user in allUsers" :key="user.uid">
          <v-list-item-content>
            <v-checkbox
              v-model="user.selected"
              :label="usersMap[user.uid] || user.email"
              density="compact"
              hide-details
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn color="primary" @click="saveMembers">Uložit změny</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- Dialog s TaskForm -->
<v-dialog v-model="showTaskDialog" max-width="600px">
  <v-card>
    <v-card-title>
      <span class="text-h6">{{ taskToEdit ? 'Upravit úkol' : 'Nový úkol' }}</span>
      <v-spacer />
      <v-btn icon @click="closeTaskDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <TaskForm
        :projectId="project.id"
        :taskToEdit="taskToEdit"
        :members="project.members"
        @taskAdded="onTaskSaved"
        @taskUpdated="onTaskSaved"
        @cancelEdit="closeTaskDialog"
      />
    </v-card-text>
  </v-card>
</v-dialog>

    <div style="margin-top: 1rem;">
      <strong>Průběh projektu:</strong>
      <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin-top: 0.25rem;">
        <div
          :style="{
            width: projectProgress + '%',
            background: '#10b981',
            height: '100%',
            transition: 'width 0.3s'
          }"
        ></div>
      </div>
      <p style="margin-top: 0.3rem;">{{ projectProgress }} % dokončeno</p>
    </div>

<v-card class="pa-4 mb-6" outlined>
  <h3 class="mb-4">Filtry:</h3>
  <v-row dense>
    <!-- Pouze moje úkoly -->
    <v-col cols="12" sm="6" md="2">
      <v-checkbox
        v-model="filterMineOnly"
        label="Pouze moje úkoly"
        hide-details
        density="compact"
      />
    </v-col>

    <!-- Priorita -->
    <v-col cols="12" sm="6" md="2">
      <v-select
        v-model="filterPriority"
        label="Priorita"
        :items="[
          { text: 'Vše', value: '' },
          { text: 'Vysoká', value: 'high' },
          { text: 'Střední', value: 'medium' },
          { text: 'Nízká', value: 'low' }
        ]"
        item-title="text"
        item-value="value"
        density="compact"
        hide-details
        clearable
      />
    </v-col>

    <!-- Termín -->
    <v-col cols="12" sm="6" md="2">
      <v-select
        v-model="filterDate"
        label="Termín"
        :items="[
          { text: 'Vše', value: '' },
          { text: 'Dnes', value: 'today' },
          { text: 'Budoucí', value: 'upcoming' },
          { text: 'Po termínu', value: 'overdue' }
        ]"
        item-title="text"
        item-value="value"
        density="compact"
        hide-details
        clearable
      />
    </v-col>

    <!-- Autor -->
    <v-col cols="12" sm="6" md="2">
      <v-select
        v-model="filterAuthor"
        label="Autor"
        :items="[
          { text: 'Všichni', value: '' },
          ...membersInfo.map(u => ({
            text: u.name || u.email,
            value: u.uid
          }))
        ]"
        item-title="text"
        item-value="value"
        density="compact"
        hide-details
        clearable
      />
    </v-col>

    <!-- Přiřazeno -->
    <v-col cols="12" sm="6" md="2">
      <v-select
        v-model="filterAssignedTo"
        label="Přiřazeno"
        :items="[
          { text: 'Všichni', value: '' },
          ...membersInfo.map(u => ({
            text: u.name || u.email,
            value: u.uid
          }))
        ]"
        item-title="text"
        item-value="value"
        density="compact"
        hide-details
        clearable
      />
    </v-col>
  </v-row>
</v-card>


</div>
    <h2>Kanban nástěnka</h2>
    <div class="kanban-board">
      <div class="kanban-column">
        <h3>To Do</h3>
        <draggable v-model="tasksByStatus.todo" group="tasks" @end="onDragEnd" item-key="id">
          <template #item="{ element }">
            <TaskCard
              :task="element"
              :usersMap="usersMap"
              @edit="editTask"
              @delete="deleteTask"
              @statusChanged="fetchTasks"
            />
          </template>
        </draggable>
      </div>

      <div class="kanban-column">
        <h3>In Progress</h3>
        <draggable v-model="tasksByStatus.inProgress" group="tasks" @end="onDragEnd" item-key="id">
          <template #item="{ element }">
            <TaskCard :task="element" :usersMap="usersMap" @edit="editTask" @delete="deleteTask" />
          </template>
        </draggable>
      </div>

      <div class="kanban-column">
        <h3>Done</h3>
        <draggable v-model="tasksByStatus.done" group="tasks" @end="onDragEnd" item-key="id">
          <template #item="{ element }">
            <TaskCard :task="element" :usersMap="usersMap" @edit="editTask" @delete="deleteTask" />
          </template>
        </draggable>
      </div>
    </div>


</ProjectDetailLayout>
</template>

<script>
import ProjectDetailLayout from '../layouts/ProjectDetailLayout.vue';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import TaskForm from '../components/TaskForm.vue';
import TaskCard from '../components/TaskCard.vue';
import draggable from 'vuedraggable';

export default {
  components: { TaskForm, TaskCard, draggable, ProjectDetailLayout },
  data() {
    return {
      project: null,
      tasks: [],
      taskToEdit: null,
      usersMap: {},
      membersInfo: [],
      allUsers: [],
      isOwner: false,
      messages: [],
      newMessage: '',
      showTaskDialog: false,
      filterMineOnly: false,
      filterPriority: '',
      filterDate: '',
      filterAuthor: '',
      filterAssignedTo: '',
      showMembersDialog: false,
      showEditProjectDialog: false,
      editProjectName: '',
      editProjectDescription: '',
      showDeleteDialog: false,
      leaveDialog: false,
      newOwnerId: '',
      currentUserId: null,
    };
  },
  async mounted() {
    await this.loadProjectAndTasks();
    await this.loadProjectMembers();
    this.listenToMessages();
    this.editProjectName = this.project.name;
    this.editProjectDescription = this.project.description;
    this.currentUserId = auth.currentUser?.uid || null;
  },
  computed: {
    tasksByStatus() {
      const uid = auth.currentUser?.uid;

      return {
        todo: this.tasks.filter(t => this.filter(t, uid) && t.status === 'todo'),
        inProgress: this.tasks.filter(t => this.filter(t, uid) && t.status === 'in progress'),
        done: this.tasks.filter(t => this.filter(t, uid) && t.status === 'done')
      };
    },
    projectProgress() {
      const total = this.tasks.length;
      const done = this.tasks.filter(t => t.status === 'done').length;
      return total === 0 ? 0 : Math.round((done / total) * 100);
    }
  },
  methods: {

    async reloadProject() {
  this.project = null
  this.tasks = []
  this.taskToEdit = null
  this.membersInfo = []
  this.allUsers = []
  this.usersMap = {}
  this.messages = []
  await this.loadProjectAndTasks()
  await this.loadProjectMembers()
  this.listenToMessages()
},

async leaveProject() {
  const userId = this.currentUserId;
  if (!userId || !this.project) return;

  const remainingMembers = this.project.members.filter(uid => uid !== userId);

  if (this.isOwner) {
    if (remainingMembers.length === 0) {
      // Vedoucí je jediný člen — smažeme celý projekt
      await this.deleteProject();
      return;
    }

    if (!this.newOwnerId) {
      alert('Musíte zvolit nového vedoucího.');
      return;
    }

    // Předání vlastnictví a odebrání vedoucího ze seznamu členů
    const docRef = doc(db, 'projects', this.project.id);
    await updateDoc(docRef, {
      ownerId: this.newOwnerId,
      members: remainingMembers
    });
  } else {
    // Běžný člen odchází
    const docRef = doc(db, 'projects', this.project.id);
    await updateDoc(docRef, {
      members: remainingMembers
    });
  }

  this.leaveDialog = false;
  this.$router.push('/dashboard');
},
    
    async loadProjectAndTasks() {
      const projectId = this.$route.params.id;
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.project = { id: docSnap.id, ...docSnap.data() };
        this.isOwner = auth.currentUser && auth.currentUser.uid === this.project.ownerId;
        await this.fetchTasks();
      }
    },

    async saveProjectChanges() {
  const docRef = doc(db, 'projects', this.project.id);
  await updateDoc(docRef, {
    name: this.editProjectName,
    description: this.editProjectDescription
  });

  this.project.name = this.editProjectName;
  this.project.description = this.editProjectDescription;
  this.showEditProjectDialog = false;
},

async deleteProject() {
  const confirmed = confirm('Opravdu chcete projekt smazat?');
  if (!confirmed) return;

  // Smaž všechny úkoly patřící do projektu
  const tasksQuery = query(
    collection(db, 'tasks'),
    where('projectId', '==', this.project.id)
  );
  const tasksSnap = await getDocs(tasksQuery);
  for (const taskDoc of tasksSnap.docs) {
    await deleteDoc(doc(db, 'tasks', taskDoc.id));
  }

  // Smaž samotný projekt
  await deleteDoc(doc(db, 'projects', this.project.id));

  this.$router.push('/dashboard');
},

    async loadProjectMembers() {
      if (!this.project?.members) return;

      const querySnapshot = await getDocs(collection(db, 'users'));
      this.allUsers = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
      }));


      this.allUsers.forEach(u => {
        u.selected = this.project.members.includes(u.uid);
      });
      

      this.membersInfo = this.allUsers
  .filter(u => this.project.members.includes(u.uid))
  .sort((a, b) => {
    if (a.uid === this.project.ownerId) return -1;
    if (b.uid === this.project.ownerId) return 1;
    return 0;
  });

      this.usersMap = Object.fromEntries(
        this.membersInfo.map(u => [u.uid, u.name || u.email])
      );
    },

    async fetchTasks() {
      if (!this.project?.id) return;

      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', this.project.id),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      this.tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async deleteTask(taskId) {
      await deleteDoc(doc(db, 'tasks', taskId));
      await this.fetchTasks();
    },

    async onTaskUpdated() {
      this.taskToEdit = null;
      await this.fetchTasks();
    },

    async updateMembers() {
      const newMembers = this.allUsers.filter(u => u.selected).map(u => u.uid);
      const docRef = doc(db, 'projects', this.project.id);
      await updateDoc(docRef, { members: newMembers });

      await this.loadProjectAndTasks();
      await this.loadProjectMembers();
    },

    async saveMembers() {
  await this.updateMembers();
  this.showMembersDialog = false;
},

    async onDragEnd(event) {
      const { item, to } = event;

      let newStatus = '';
      if (to.innerText.includes('To Do')) newStatus = 'todo';
      else if (to.innerText.includes('In Progress')) newStatus = 'in progress';
      else if (to.innerText.includes('Done')) newStatus = 'done';

      if (item && item.id && item.status !== newStatus) {
        const docRef = doc(db, 'tasks', item.id);
        await updateDoc(docRef, { status: newStatus });
        await this.fetchTasks();
      }
    },

    listenToMessages() {
      const q = query(
        collection(db, 'projects', this.project.id, 'messages'),
        orderBy('createdAt', 'asc')
      );

      onSnapshot(q, snapshot => {
        this.messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.$nextTick(() => {
          const el = this.$refs.chatContainer;
          if (el) el.scrollTop = el.scrollHeight;
        });
      });
    },

    async sendMessage() {
      const user = auth.currentUser;
      if (!user || !this.project.members.includes(user.uid)) return;

      const msg = {
        text: this.newMessage,
        userId: user.uid,
        userName: this.usersMap[user.uid] || user.email,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects', this.project.id, 'messages'), msg);
      this.newMessage = '';
    },

    formatTimestamp(ts) {
      if (!ts) return '';
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString();
    },

    openTaskDialog() {
      this.taskToEdit = null;
      this.showTaskDialog = true;
    },

    closeTaskDialog() {
      this.showTaskDialog = false;
      this.taskToEdit = null;
    },

    onTaskSaved() {
      this.fetchTasks();
      this.closeTaskDialog();
    },

    editTask(task) {
      this.taskToEdit = task;
      this.showTaskDialog = true;
    },

    filter(task, uid) {
      if (this.filterMineOnly && (!Array.isArray(task.assignedTo) || !task.assignedTo.includes(uid))) {
        return false;
      }

      if (this.filterPriority && task.priority !== this.filterPriority) {
        return false;
      }

      if (this.filterAuthor && task.createdBy?.uid !== this.filterAuthor) {
        return false;
      }

      if (this.filterDate && task.dueDate?.toDate) {
        const now = new Date();
        const due = task.dueDate.toDate();
        const isSameDay = d1 => d1.toDateString() === now.toDateString();

        if (this.filterDate === 'today' && !isSameDay(due)) return false;
        if (this.filterDate === 'upcoming' && due <= now) return false;
        if (this.filterDate === 'overdue' && due > now) return false;
      }

      if (
        this.filterAssignedTo &&
        (!Array.isArray(task.assignedTo) || !task.assignedTo.includes(this.filterAssignedTo))
      ) {
        return false;
      }

      return true;
    }
  },
  watch: {
    '$route.params.id': function () {
      this.reloadProject()
    }
  }
};
</script>


<style scoped>
h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

ul {
  padding-left: 1.2rem;
}

input[type='text'],
textarea,
select {
  padding: 0.5rem;
  margin: 0.3rem 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

button:hover {
  background-color: #2563eb;
}

.kanban-board {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.kanban-column {
  flex: 1;
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  min-height: 300px;
}

.task-card {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.task-card strong {
  font-size: 1rem;
  display: block;
  margin-bottom: 0.3rem;
}

.task-card p {
  margin: 0.3rem 0;
}

.task-card em {
  color: #6b7280;
  font-size: 0.9rem;
}

label {
  font-weight: bold;
  margin-top: 0.5rem;
  display: block;
}

.kanban-board {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.kanban-column {
  flex: 1;
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  min-height: 300px;
}

.chat-box {
  margin-top: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
}

.chat-messages {
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.chat-message {
  margin-bottom: 0.5rem;
  padding: 0.3rem;
  background: #e5e7eb;
  border-radius: 6px;
}

.chat-form {
  display: flex;
  gap: 0.5rem;
}

.chat-form input {
  flex: 1;
  padding: 0.5rem;
}

.chat-form button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
}
</style>