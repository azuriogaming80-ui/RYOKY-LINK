// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      // À décommenter quand la vue sera créée (Phase 5)
      // {
      //   path: 'library/:id',
      //   name: 'library',
      //   component: () => import('@/views/LibraryView.vue')
      // },
      {
        path: 'item/:id',
        name: 'item',
        component: () => import('@/views/ItemDetailView.vue')
      },
      // À décommenter quand les vues seront créées
      // {
      //   path: 'search',
      //   name: 'search',
      //   component: () => import('@/views/SearchView.vue')
      // },
      // {
      //   path: 'favourites',
      //   name: 'favourites',
      //   component: () => import('@/views/FavouritesView.vue')
      // },
      // {
      //   path: 'settings',
      //   name: 'settings',
      //   component: () => import('@/views/SettingsView.vue')
      // },
      // {
      //   path: 'livetv',
      //   name: 'livetv',
      //   component: () => import('@/views/LiveTvView.vue')
      // }
    ]
  },
  {
    path: '/player',
    name: 'player',
    component: () => import('@/views/PlayerView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && auth.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router