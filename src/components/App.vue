<script setup>
import { useRouter } from 'vue-router'
import Navbar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

const router = useRouter()
</script>

<template>
  <v-app>
    <Navbar @logout="router.push('/login')" />

    <v-main>
      <router-view
        @authenticated="router.push('/dashboard')"
        @unauthorized="router.push('/login')"
      />
    </v-main>

    <Footer />
  </v-app>
</template>

<style>
body { margin: 0; }
.v-application { font-family: 'Public Sans', system-ui, sans-serif !important; }
.serif { font-family: 'Newsreader', Georgia, serif !important; font-weight: 600; letter-spacing: -0.01em; }
[id] { scroll-margin-top: 80px; }
</style>