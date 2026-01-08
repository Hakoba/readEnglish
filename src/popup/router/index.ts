import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getLocalData, setLocalData } from '@/utils/storage'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/dictionary',
    name: 'dictionary',
    component: () => import('../views/DictionaryView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Восстановление последнего пути
router.isReady().then(async () => {
  const lastRoute = await getLocalData('lastPopupRoute')
  if (lastRoute && lastRoute !== '/') {
    router.push(lastRoute)
  }
})

// Сохранение текущего пути
router.afterEach((to) => {
  setLocalData('lastPopupRoute', to.path)
})

export default router
