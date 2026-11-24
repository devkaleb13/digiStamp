<script setup>
import { ref } from 'vue'
import StampPlacerDemo from './components/StampPlacerDemo.vue'

const placement = ref({ page: 1, x: 0.8, y: 0.88, width: 0.18, rotation: -8 })
const confirmed = ref(null)
</script>

<template>
  <div class="bg-section py-10" style="min-height: calc(100vh - 68px)">
    <v-container style="max-width: 1000px">
      <h1 class="serif text-primary mb-1" style="font-size: 32px">Place the stamp</h1>
      <p class="text-medium-emphasis mb-6">Demo of the movable stamp, using a sample page.</p>

      <v-card rounded="lg" class="pa-6" style="border-top: 4px solid #d4af37">
        <StampPlacer v-model="placement" @confirm="confirmed = $event" @cancel="confirmed = null" />
      </v-card>

      <v-alert v-if="confirmed" type="success" variant="tonal" class="mt-4" title="What would be sent to the server">
        <pre class="text-body-2" style="white-space: pre-wrap">{{ JSON.stringify(confirmed, null, 2) }}</pre>
      </v-alert>
    </v-container>
  </div>
</template>