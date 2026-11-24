<script setup>
const features = [
  {
    icon: 'mdi-shield-account-outline',
    title: 'Authorised officers only',
    text: 'Only officers authorised by their department can use its stamp.',
  },
  {
    icon: 'mdi-cellphone-message',
    title: 'Two-step sign-in',
    text: 'Officers sign in with a password, then enter a 6-digit code sent to their registered phone. The code expires after 1 minute.',
  },
  {
    icon: 'mdi-clipboard-check-outline',
    title: 'Approval before stamping',
    text: 'Documents move through the approval steps you set. Each decision is recorded with the person who made it.',
  },
  {
    icon: 'mdi-history',
    title: 'A complete audit log',
    text: 'Every upload, approval and stamp is logged with the officer’s name and the time, so nothing happens off the record.',
  },
  {
    icon: 'mdi-account-cog-outline',
    title: 'You control access',
    text: 'Each institution manages its own officers and stamps, and can switch a person’s access off the moment they leave.',
  },
  {
    icon: 'mdi-text-box-search-outline',
    title: 'Track every document',
    text: 'Each document gets a private code at upload. Your department can see whether it has been stamped, and the full history is kept for audit.',
  },
]
</script>

<template>
  <section id="features" class="py-16">
    <v-container style="max-width: 1200px">
      <div style="max-width: 640px" class="mb-10">
        <div class="mb-4" style="width: 64px; height: 4px; background: #d4af37"></div>
        <h2 class="serif text-primary" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
          Security and accountability by design
        </h2>
        <p class="mt-3 text-medium-emphasis">
          DigiStamp answers a question an auditor will ask: who acted, who approved, and what
          happened.
        </p>
      </div>

      <v-row>
        <v-col v-for="f in features" :key="f.title" cols="12" md="6">
          <div class="d-flex ga-4 pb-4 border-b">
            <v-avatar color="primary" rounded="lg" size="48" class="flex-shrink-0">
              <v-icon :icon="f.icon" color="secondary" size="26" />
            </v-avatar>
            <div>
              <h3 class="serif text-h6 text-primary mb-1">{{ f.title }}</h3>
              <p class="text-medium-emphasis">{{ f.text }}</p>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>