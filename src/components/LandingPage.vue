<script setup>
import { ref } from 'vue'
import Features from './LandingPage.vue'

const BRAND = 'DigiStamp'
const CONTACT_EMAIL = 'devkaleb13@gmail.com' // change to your support address
const DEMO_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(BRAND + ' demo request')}`

// Set to false once your Laravel verify endpoint is ready
const USE_DEMO = true
const API = import.meta.env.VITE_API_URL || '/api'

const audience = [
  { icon: 'mdi-hospital-building', title: 'Hospitals', text: 'Referral letters, discharge summaries and medical certificates.' },
  { icon: 'mdi-school-outline', title: 'Universities', text: 'Transcripts, certificates and admission letters.' },
  { icon: 'mdi-bank-outline', title: 'Government departments', text: 'Permits, notices and approvals that must stand up to review.' },
  { icon: 'mdi-domain', title: 'Private companies', text: 'Contracts, HR letters and internal approvals.' },
]

const steps = [
  { title: 'Upload', text: 'Staff add a document to their institution’s workspace.' },
  { title: 'Approve', text: 'Assigned officers review and approve in the order you set.' },
  { title: 'Stamp', text: 'An authorised officer signs in with a password and a phone code, then applies the stamp.' },
  { title: 'Verify', text: 'Anyone can check the document’s authenticity with its reference code.' },
]

// ---------- Verify box ----------
const code = ref('SS-2026-48213')
const result = ref(null) // { ok: true, institution, date, officer } | { ok: false }
const checking = ref(false)

async function verify() {
  const reference = code.value.trim().toUpperCase()
  result.value = null
  if (!reference) return

  checking.value = true
  try {
    if (USE_DEMO) {
      result.value =
        reference === 'SS-2026-48213'
          ? { ok: true, institution: 'Sample County Hospital', date: '26 October 2026', officer: 'J. Wanjiru' }
          : { ok: false }
    } else {
      const res = await fetch(`${API}/verify/${encodeURIComponent(reference)}`, {
        headers: { Accept: 'application/json' },
      })
      result.value = res.ok ? { ok: true, ...(await res.json()) } : { ok: false }
    }
  } catch {
    result.value = { ok: false, offline: true }
  } finally {
    checking.value = false
  }
}

verify() // show the sample result on load
</script>

<template>
  <div>
    <!-- ============ HERO ============ -->
    <section class="bg-primary">
      <v-container style="max-width: 1200px" class="py-12 py-md-16">
        <v-row align="center">
          <v-col cols="12" md="7">
            <h1 class="serif mb-5" style="font-size: clamp(34px, 5vw, 56px); line-height: 1.1">
              Official documents, stamped online with proof.
            </h1>
            <p class="text-h6 font-weight-regular mb-8" style="color: #c9d6e2; max-width: 32em">
              {{ BRAND }} is a unique online digital stamp that eases the backlogs of organisations.
              Only authorised officers can use the stamp, and every action is recorded in an audit log.
            </p>
            <div class="d-flex flex-wrap ga-3">
              <v-btn to="/signup" color="secondary" variant="flat" size="large">Sign up</v-btn>
              <v-btn :href="DEMO_MAIL" color="secondary" variant="outlined" size="large">Request a demo</v-btn>
              <v-btn to="/#verify" variant="text" size="large">Verify a document</v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-card class="mx-auto position-relative pa-6" max-width="420" elevation="12" rounded="lg" aria-hidden="true">
              <div class="serif text-subtitle-1 text-primary pb-2 mb-4" style="border-bottom: 2px solid #d4af37">
                Sample County Hospital
              </div>
              <div
                v-for="(w, i) in ['100%', '84%', '100%', '62%', '84%']"
                :key="i"
                class="mb-3"
                :style="{ width: w, height: '8px', borderRadius: '4px', background: '#e5ebf1' }"
              ></div>
              <div class="d-flex justify-space-between align-end mt-6">
                <span class="serif text-primary text-h5" style="font-style: italic; border-bottom: 1px solid #9fb0c0">
                  J. Wanjiru
                </span>
                <v-icon icon="mdi-check-decagram" color="secondary" size="88" style="transform: rotate(-8deg)" />
              </div>
              <v-chip
                color="success"
                variant="flat"
                prepend-icon="mdi-check-circle"
                class="position-absolute"
                style="left: -14px; bottom: -16px"
              >
                Verified and approved
              </v-chip>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ AUDIENCE ============ -->
    <section class="py-16">
      <v-container style="max-width: 1200px">
        <div style="max-width: 640px" class="mb-10">
          <h2 class="serif text-primary" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
            Built for organisations that answer for their paperwork
          </h2>
          <p class="mt-3 text-medium-emphasis">
            When a document carries your name, people need to trust it. {{ BRAND }} gives every stamp
            a traceable origin and clears the queue behind it.
          </p>
        </div>

        <v-row style="border-top: 3px solid #d4af37">
          <v-col v-for="a in audience" :key="a.title" cols="12" sm="6" md="3">
            <v-icon :icon="a.icon" color="primary" size="36" class="mb-2" />
            <h3 class="serif text-h6 text-primary mb-1">{{ a.title }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ a.text }}</p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ HOW IT WORKS ============ -->
    <section id="how" class="bg-section py-16">
      <v-container style="max-width: 1200px">
        <h2 class="serif text-primary mb-10" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
          From upload to verified in four steps
        </h2>
        <v-row>
          <v-col v-for="(s, i) in steps" :key="s.title" cols="12" sm="6" md="3">
            <div class="pt-4" style="border-top: 2px solid #102a43">
              <v-avatar color="primary" size="36" class="mb-3">
                <span class="text-secondary font-weight-bold">{{ i + 1 }}</span>
              </v-avatar>
              <h3 class="serif text-h6 text-primary mb-1">{{ s.title }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ s.text }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ SECURITY ============ -->
    <Features />

    <!-- ============ VERIFY ============ -->
    <section id="verify" class="bg-section py-16">
      <v-container style="max-width: 1200px">
        <v-row align="center">
          <v-col cols="12" md="6">
            <h2 class="serif text-primary" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
              Check any document in seconds
            </h2>
            <p class="mt-3 text-medium-emphasis" style="max-width: 30em">
              Enter the reference printed on the document. A green result confirms it was approved and
              stamped by the named institution.
            </p>
          </v-col>

          <v-col cols="12" md="6">
            <v-card rounded="lg" class="pa-6" style="border-top: 4px solid #d4af37">
              <v-form @submit.prevent="verify">
                <div class="d-flex ga-3">
                  <v-text-field
                    v-model="code"
                    label="Document reference"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-file-document-check-outline"
                    hide-details
                    autocomplete="off"
                  />
                  <v-btn type="submit" color="primary" size="large" :loading="checking">Verify</v-btn>
                </div>
              </v-form>

              <div class="mt-4" style="min-height: 130px" aria-live="polite">
                <v-alert v-if="result && result.ok" type="success" variant="tonal" border="start" title="Verified">
                  This document is authentic.
                  <div class="text-body-2 mt-2">
                    <div><strong>Institution:</strong> {{ result.institution }}</div>
                    <div><strong>Approved:</strong> {{ result.date }}</div>
                    <div><strong>Stamped by:</strong> {{ result.officer }}</div>
                  </div>
                </v-alert>

                <v-alert
                  v-else-if="result"
                  type="error"
                  variant="tonal"
                  border="start"
                  :title="result.offline ? 'Could not check' : 'Not found'"
                >
                  {{
                    result.offline
                      ? 'The server could not be reached. Try again.'
                      : 'No document matches this reference. Check the code and try again.'
                  }}
                </v-alert>
              </div>

              <p v-if="USE_DEMO" class="text-caption text-medium-emphasis mt-2">
                Sample reference for demonstration only.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ FINAL CTA ============ -->
    <section id="contact" class="bg-primary text-center py-16">
      <v-container style="max-width: 760px">
        <h2 class="serif mb-3" style="font-size: clamp(28px, 3.8vw, 42px); line-height: 1.15">
          Bring trusted stamping to your institution
        </h2>
        <p class="mb-8" style="color: #c9d6e2">
          Book a walkthrough and see how {{ BRAND }} clears the backlog in your approval process.
        </p>
        <div class="d-flex flex-wrap justify-center ga-3">
          <v-btn :href="DEMO_MAIL" color="secondary" variant="flat" size="large">Request a demo</v-btn>
          <v-btn to="/login" color="secondary" variant="outlined" size="large">Officer sign in</v-btn>
        </div>
      </v-container>
    </section>
  </div>
</template>