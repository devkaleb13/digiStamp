<script setup>
import Features from './Features.vue'

const BRAND = 'DigiStamp'
const CONTACT_EMAIL = 'devkaleb13@gmail.com' // change to your support address
const DEMO_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(BRAND + ' demo request')}`

const audience = [
  { icon: 'mdi-hospital-building', title: 'Hospitals', text: 'Referral letters, discharge summaries and medical certificates.' },
  { icon: 'mdi-school-outline', title: 'Universities', text: 'Transcripts, certificates and admission letters.' },
  { icon: 'mdi-bank-outline', title: 'Government departments', text: 'Permits, notices and approvals that must stand up to review.' },
  { icon: 'mdi-domain', title: 'Private companies', text: 'Contracts, HR letters and internal approvals.' },
  { icon: 'mdi-account-outline', title: 'Individuals', text: 'Private letters, declarations and agreements, stamped under your own name.' },
]

const steps = [
  { title: 'Upload', text: 'Staff add a document to their institution’s workspace.' },
  { title: 'Approve', text: 'Assigned officers review and approve in the order you set.' },
  { title: 'Stamp', text: 'An authorised officer signs in with a password and a phone code, then applies the stamp.' },
  { title: 'Track', text: 'Everyone in the department can see whether it has been stamped, and every action stays on record.' },
]

// ---------- Sample history shown in the tracking section ----------
const history = [
  { title: 'Uploaded', detail: 'Records Department, 09:12. Private code issued.', color: 'primary' },
  { title: 'Approved', detail: 'Head of Department, 10:40', color: 'primary' },
  { title: 'Stamped', detail: 'Authorised officer on a registered computer, 11:05', color: 'success' },
  { title: 'Status checked', detail: 'Department member saw "Stamped", 11:30', color: 'secondary' },
]
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
            <p class="text-h6 font-weight-regular mb-0" style="color: #c9d6e2; max-width: 32em">
              {{ BRAND }} is a unique online digital stamp that eases the backlogs of organisations.
              Only authorised officers can use the stamp, and every action is recorded in an audit log.
            </p>
          </v-col>

          <v-col cols="12" md="5">
            <!-- Stamp photo: save your picture as public/stamp.jpg -->
            <v-card class="mx-auto position-relative overflow-hidden" max-width="440" elevation="12" rounded="lg">
              <v-img src="/stamp.jpg" alt="A stamp being pressed onto paper" aspect-ratio="1" cover>
                <!-- Shown only while public/stamp.jpg is missing -->
                <template #error>
                  <div class="d-flex align-center justify-center fill-height bg-section">
                    <div class="stamp stamp-static">
                      <v-icon icon="mdi-check-bold" size="22" color="success" />
                      <b>DIGISTAMP</b>
                      <small>APPROVED</small>
                    </div>
                  </div>
                </template>
              </v-img>

              <v-chip
                color="success"
                variant="flat"
                prepend-icon="mdi-check-circle"
                class="position-absolute"
                style="left: 16px; bottom: 16px"
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
            Built for people and organisations that answer for their paperwork
          </h2>
          <p class="mt-3 text-medium-emphasis">
            When a document carries your name, people need to trust it. {{ BRAND }} gives every stamp
            a traceable origin and clears the queue behind it.
          </p>
        </div>

        <v-row style="border-top: 3px solid #d4af37">
          <v-col v-for="a in audience" :key="a.title" cols="12" sm="6" md>
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
          From upload to stamped in four steps
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
      <div class="mt-8">
          <v-btn to="/how-it-works" color="primary" variant="flat" size="large" append-icon="mdi-arrow-right">
            See the full walkthrough
          </v-btn>
        </div>
      </v-container>
    </section>

    <!-- ============ SECURITY ============ -->
    <Features />

    <!-- ============ TRACKING ============ -->
    <section id="tracking" class="bg-section py-16">
      <v-container style="max-width: 1200px">
        <v-row align="center">
          <v-col cols="12" md="6">
            <h2 class="serif text-primary" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
              Every document, tracked from upload to stamp
            </h2>
            <p class="mt-3 text-medium-emphasis" style="max-width: 32em">
              Each document receives a private code when it is uploaded. The code stays inside your
              institution and ties every action to one record.
            </p>
            <v-list class="bg-transparent mt-4" lines="two">
              <v-list-item
                prepend-icon="mdi-eye-check-outline"
                title="Department monitoring"
                subtitle="Everyone in the department can see whether a document has been stamped."
              />
              <v-list-item
                prepend-icon="mdi-history"
                title="Audit trail"
                subtitle="Uploads, approvals, stamps and downloads are logged with the officer, the computer and the time."
              />
              <v-list-item
                prepend-icon="mdi-scale-balance"
                title="Settling disputes"
                subtitle="If a conflict arises, the full history of a document can be pulled up by its code."
              />
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <v-card rounded="lg" class="pa-6" style="border-top: 4px solid #d4af37">
              <p class="text-overline text-medium-emphasis">Sample document history</p>
              <div class="d-flex align-center ga-2 mb-3">
                <v-icon icon="mdi-file-document-outline" color="primary" />
                <strong class="text-primary" style="font-family: ui-monospace, Consolas, monospace">
                  DEMO-2026-000123-X7K2
                </strong>
              </div>
              <v-timeline density="compact" side="end" align="start" line-thickness="2">
                <v-timeline-item v-for="e in history" :key="e.title" :dot-color="e.color" size="small">
                  <div class="font-weight-bold">{{ e.title }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ e.detail }}</div>
                </v-timeline-item>
              </v-timeline>
              <p class="text-caption text-medium-emphasis mt-2">Sample data for illustration only.</p>
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

<style scoped>
.stamp {
  position: absolute;
  right: 22px;
  bottom: 30px;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  border: 4px solid #d4af37;
  background: rgba(212, 175, 55, 0.1);
  color: #102a43;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transform: rotate(-10deg);
  animation: stamp-press 6s ease-in-out infinite;
}
.stamp::before {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: 1.5px dashed #d4af37;
}
.stamp b { font: 700 13px/1.1 'Newsreader', Georgia, serif; letter-spacing: 0.08em; }
.stamp small { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; }

.verified-chip {
  left: -14px;
  bottom: -16px;
  animation: chip-show 6s ease-in-out infinite;
}

.stamp-static {
  position: relative;
  right: auto;
  bottom: auto;
  width: 150px;
  height: 150px;
}
.stamp-static b { font-size: 16px; }

@keyframes stamp-press {
  0%, 8%  { opacity: 0; transform: translateY(-48px) scale(1.5) rotate(-10deg); }
  16%     { opacity: 1; transform: translateY(0) scale(0.93) rotate(-10deg); }
  20%     { opacity: 1; transform: translateY(0) scale(1) rotate(-10deg); }
  82%     { opacity: 1; transform: translateY(0) scale(1) rotate(-10deg); }
  94%, 100% { opacity: 0; transform: translateY(0) scale(1) rotate(-10deg); }
}
@keyframes chip-show {
  0%, 20% { opacity: 0; transform: translateY(8px); }
  28%, 82% { opacity: 1; transform: translateY(0); }
  94%, 100% { opacity: 0; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .stamp, .verified-chip { animation: none; opacity: 1; }
}
</style>