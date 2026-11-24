import { createRouter, createWebHistory } from 'vue-router'

// Pages used on the first load
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import SignUp from '../components/signUp.vue'
import HowItWorks from '../components/HowItWorksPage.vue'
const BRAND = 'DigiStamp'
const TOKEN_KEY = 'digistamp_token'
const USER_KEY = 'digistamp_user' // { name, role }, saved by the login page

function read(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}
function isSignedIn() {
  return !!read(TOKEN_KEY)
}
function currentRole() {
  try {
    return JSON.parse(read(USER_KEY) || '{}').role || ''
  } catch {
    return ''
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // ---------- Public pages (anyone can open these) ----------
    { path: '/', component: HomePage, meta: { title: 'Home' } },
    { path: '/login', component: LoginPage, meta: { title: 'Login' } },
    { path: '/signup', component: SignUp, meta: { title: 'Sign up' } },
    {
      path: '/how-it-works',
      component: () => import('../components/HowItWorksPage.vue'),
      meta: { title: 'How it works' },
    },

    // ---------- Administrator pages (signed in AND administrator) ----------
    {
      path: '/admin/officers',
      component: () => import('../components/AdminPage.vue'),
      meta: { title: 'Officers', auth: true, admin: true },
    },
    {
      path: '/admin/devices',
      component: () => import('../components/AdminPage.vue'),
      meta: { title: 'Computers', auth: true, admin: true },
    },
    {
    },

    // ---------- Temporary: after login the app goes to /dashboard ----------
    // The Dashboard page is not built yet. Until it is, administrators land on
    // the Officers page and everyone else on the homepage.
    // When you create DashboardPage.vue, delete this route and use the one below.
    {
      path: '/dashboard',
      redirect: () => (currentRole() === 'admin' ? '/admin/officers' : '/'),
      meta: { auth: true },
    },
    // {
    //   path: '/dashboard',
    //   component: () => import('../components/DashboardPage.vue'),
    //   meta: { title: 'Dashboard', auth: true },
    // },

    // ---------- Demo page: remove when you no longer need it ----------
    {
      path: '/stamp-demo',
      component: () => import('../components/StampPlacerDemo.vue'),
      meta: { title: 'Stamp placement demo' },
    },

    // ---------- Add each of these when you create the file ----------
    // { path: '/pricing', component: () => import('../components/PricingPage.vue'), meta: { title: 'Pricing' } },
    // { path: '/about', component: () => import('../components/AboutPage.vue'), meta: { title: 'About' } },
    // { path: '/activate/:token', component: () => import('../components/ActivatePage.vue'), meta: { title: 'Activate your account' } },

    // Any address that does not exist goes to the homepage
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],

  // Links like /#tracking scroll to that section; other pages open at the top
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0 }
  },
})

// Gatekeeper: runs before every page change.
// This only controls what the browser shows. Laravel must refuse the same requests.
router.beforeEach((to) => {
  if (to.meta.auth && !isSignedIn()) {
    return { path: '/login' } // not signed in
  }
  if (to.meta.admin && currentRole() !== 'admin') {
    return { path: '/' } // signed in, but not an administrator
  }
})

// Browser tab title, for example "Officers · DigiStamp"
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${BRAND}` : BRAND
})

export default router
