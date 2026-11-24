<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

const emit = defineEmits(['logout'])

const BRAND = 'DigiStamp'
const TOKEN_KEY = 'digistamp_token'
const USER_KEY = 'digistamp_user' // { name, role } saved by the login page

const route = useRoute()
const { lgAndUp } = useDisplay()
const drawer = ref(false)
const isAuthed = ref(false)
const role = ref('')

const isAdmin = computed(() => role.value === 'admin')
const btnSize = computed(() => (lgAndUp.value ? 'default' : 'small'))

// Open to everyone, signed in or not
const openLinks = [
  { title: 'Home', to: '/' },
  { title: 'How it works', to: '/how-it-works' },
]

// Shown only to visitors who are not signed in
const visitorLinks = [
  { title: 'Tracking', to: '/#tracking' },
  { title: 'Pricing', to: '/pricing' },
  { title: 'About', to: '/about' },
]

const adminLinks = [
  { title: 'Officers', to: '/admin/officers', icon: 'mdi-account-group-outline' },
  { title: 'Devices', to: '/admin/devices', icon: 'mdi-laptop' },
  { title: 'Billing', to: '/admin/billing', icon: 'mdi-credit-card-outline' },
]

function read(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

function checkAuth() {
  isAuthed.value = !!read(TOKEN_KEY)
  try {
    role.value = JSON.parse(read(USER_KEY) || '{}').role || ''
  } catch {
    role.value = ''
  }
}

function logout() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(TOKEN_KEY)
    store.removeItem(USER_KEY)
  }
  isAuthed.value = false
  role.value = ''
  drawer.value = false
  emit('logout')
}

onMounted(checkAuth)
// Re-check on every page change, so the bar updates right after sign-in
watch(() => route.fullPath, () => {
  checkAuth()
  drawer.value = false
})
</script>

<template>
  <v-app-bar color="primary" flat height="68">
    <v-container class="d-flex align-center py-0" style="max-width: 1200px">
      <router-link
        to="/"
        class="d-flex align-center text-decoration-none text-white"
        :aria-label="`${BRAND} home`"
      >
        <v-icon icon="mdi-shield-check" color="secondary" size="32" class="mr-2" />
        <span class="serif text-h6">{{ BRAND }}</span>
      </router-link>

      <v-spacer />

      <!-- Page links: full row on large screens -->
      <template v-if="lgAndUp">
        <v-btn v-for="l in openLinks" :key="l.title" :to="l.to" variant="text">{{ l.title }}</v-btn>

        <template v-if="!isAuthed">
          <v-btn v-for="l in visitorLinks" :key="l.title" :to="l.to" variant="text">{{ l.title }}</v-btn>
        </template>
        <template v-else>
          <template v-if="isAdmin">
            <v-btn v-for="a in adminLinks" :key="a.title" :to="a.to" variant="text" :prepend-icon="a.icon">
              {{ a.title }}
            </v-btn>
          </template>
          <v-btn to="/dashboard" variant="text" prepend-icon="mdi-view-dashboard-outline">Dashboard</v-btn>
        </template>
      </template>

      <!-- Login and Sign up: always on the top bar, on every screen size -->
      <template v-if="!isAuthed">
        <v-btn to="/login" variant="text" :size="btnSize" class="ml-1">Login</v-btn>
        <v-btn to="/signup" color="secondary" variant="flat" :size="btnSize" class="ml-1">Sign up</v-btn>
      </template>
      <v-btn
        v-else-if="lgAndUp"
        color="secondary"
        variant="flat"
        class="ml-2"
        prepend-icon="mdi-logout"
        @click="logout"
      >
        Log out
      </v-btn>

      <!-- Menu button for phones and tablets -->
      <v-app-bar-nav-icon v-if="!lgAndUp" aria-label="Open menu" class="ml-1" @click="drawer = !drawer" />
    </v-container>
  </v-app-bar>

  <!-- Menu for phones and tablets -->
  <v-navigation-drawer v-model="drawer" temporary location="right" color="primary">
    <v-list nav>
      <v-list-item v-for="l in openLinks" :key="l.title" :to="l.to" :title="l.title" />

      <template v-if="!isAuthed">
        <v-list-item v-for="l in visitorLinks" :key="l.title" :to="l.to" :title="l.title" />
        <v-divider class="my-2" />
        <v-list-item to="/login" title="Login" prepend-icon="mdi-login" />
        <v-list-item to="/signup" title="Sign up" prepend-icon="mdi-account-plus-outline" />
      </template>
      

      <template v-else>
        <v-divider class="my-2" />
        <template v-if="isAdmin">
          <v-list-item
            v-for="a in adminLinks"
            :key="a.title"
            :to="a.to"
            :title="a.title"
            :prepend-icon="a.icon"
          />
        </template>
        <v-list-item to="/dashboard" title="Dashboard" prepend-icon="mdi-view-dashboard-outline" />
        <v-list-item title="Log out" prepend-icon="mdi-logout" @click="logout" />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>