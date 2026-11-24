<script setup>
const BRAND = 'DigiStamp'
const CONTACT_EMAIL = 'devkaleb13@gmail.com' // change to your support address
const year = new Date().getFullYear()
</script>

<template>
  <v-footer color="#0b1f33" class="d-block pa-0">
    <v-container style="max-width: 1200px" class="pt-10 pb-4">
      <v-row>
        <v-col cols="12" md="5">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-shield-check" color="secondary" size="28" class="mr-2" />
            <span class="serif text-h6 text-white">{{ BRAND }}</span>
          </div>
          <p class="text-body-2 footer-text" style="max-width: 28em">
            A unique online digital stamp that eases the backlogs of organisations, with only
            authorised officers able to use the stamp.
          </p>
        </v-col>

        <v-col cols="6" md="2">
          <h2 class="text-overline text-white mb-2">Product</h2>
          <router-link class="flink" to="/#how">How it works</router-link>
          <router-link class="flink" to="/#features">Security</router-link>
          <router-link class="flink" to="/#tracking">Document tracking</router-link>
          <router-link class="flink" to="/pricing">Pricing</router-link>
        </v-col>

        <v-col cols="6" md="2">
          <h2 class="text-overline text-white mb-2">Account</h2>
          <router-link class="flink" to="/login">Sign in</router-link>
          <router-link class="flink" to="/signup">Sign up</router-link>
          <router-link class="flink" to="/about">About</router-link>
        </v-col>

        <v-col cols="12" md="3">
          <h2 class="text-overline text-white mb-2">Contact</h2>
          <a class="flink d-flex align-center" :href="`mailto:${CONTACT_EMAIL}`">
            <v-icon icon="mdi-email-outline" size="18" class="mr-2" />
            {{ CONTACT_EMAIL }}
          </a>
          <p class="text-caption footer-text mt-2">For demos, support and institution onboarding.</p>
        </v-col>
      </v-row>

      <v-divider class="my-4" style="border-color: rgba(255, 255, 255, 0.15)" />

      <div class="d-flex flex-wrap justify-space-between align-center ga-2 pb-2">
        <span class="text-caption footer-text">© {{ year }} {{ BRAND }}. All rights reserved.</span>
        <span class="text-caption footer-text d-flex align-center">
          <v-icon icon="mdi-lock-outline" color="success" size="16" class="mr-1" />
          Secure. Stamp. Sign.
        </span>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
.footer-text { color: #a9bacb; }
.flink {
  display: block;
  color: #a9bacb;
  text-decoration: none;
  padding: 3px 0;
  font-size: 15px;
  word-break: break-all;
}
.flink:hover { color: #d4af37; text-decoration: underline; }
</style>