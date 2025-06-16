import { createRouter, createWebHistory } from 'vue-router'

// 懶載入頁面組件
const Home = () => import('@/views/Home.vue')
const Transactions = () => import('@/views/Transactions.vue')
const Categories = () => import('@/views/Categories.vue')
const Budget = () => import('@/views/Budget.vue')
const Reports = () => import('@/views/Reports.vue')
const Settings = () => import('@/views/Settings.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首頁',
      icon: '🏠',
    },
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: {
      title: '交易記錄',
      icon: '📊',
    },
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: {
      title: '分類管理',
      icon: '📋',
    },
  },
  {
    path: '/budget',
    name: 'Budget',
    component: Budget,
    meta: {
      title: '預算管理',
      icon: '💰',
    },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: {
      title: '報表分析',
      icon: '📈',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '設定',
      icon: '⚙️',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守衛
router.beforeEach((to, from, next) => {
  // 設定頁面標題
  document.title = to.meta.title ? `${to.meta.title} - 個人記帳應用` : '個人記帳應用'
  next()
})

export default router
