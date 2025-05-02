import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import Dashboard from '../pages/Dashboard.vue';
import ProjectDetail from '../pages/ProjectDetail.vue';
import UserProfile from '../pages/UserProfile.vue';
import NewProject from '../pages/NewProject.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/projects/:id', component: ProjectDetail, meta: { requiresAuth: true } },
  { path: '/profile', component: UserProfile, meta: { requiresAuth: true } },
  { path: '/projects/new', component: NewProject, meta: { requiresAuth: true } },
  { path: '/profile',component: () => import('../pages/UserProfile.vue')}
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
