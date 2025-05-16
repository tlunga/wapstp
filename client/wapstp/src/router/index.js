import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import Dashboard from '../pages/Dashboard.vue';
import ProjectDetail from '../pages/ProjectDetail.vue';
import UserProfile from '../pages/UserProfile.vue';
import NewProject from '../pages/NewProject.vue';
import Home from '../pages/Home.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },

  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },

  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/projects/:id', component: ProjectDetail, meta: { requiresAuth: true } },
  { path: '/projects/new', component: NewProject, meta: { requiresAuth: true } },
  { path: '/profile', component: UserProfile, meta: { requiresAuth: true } },
  { path: '/user/:uid', name: 'UserView', component: () => import('../pages/UserView.vue') },
  { path: '/chats', component: () => import('../pages/PrivateChats.vue'), meta: { requiresAuth: true } },
{ path: '/chat/:uid', name: 'PrivateChat', component: () => import('../pages/PrivateChatRoom.vue'), meta: { requiresAuth: true } }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Ochrana přístupu
import { getAuth, onAuthStateChanged } from 'firebase/auth';

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (!requiresAuth) {
    next();
  } else {
    onAuthStateChanged(auth, user => {
      if (user) {
        next();
      } else {
        next('/login');
      }
    });
  }
});

export default router;
