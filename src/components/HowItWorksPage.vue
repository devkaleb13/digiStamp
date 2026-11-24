<script setup>
const BRAND = 'DigiStamp'
const CONTACT_EMAIL = 'devkaleb13@gmail.com' // change to your sales address
const DEMO_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(BRAND + ' demo request')}`

const steps = [
  {
    icon: 'mdi-upload-outline',
    title: 'Upload',
    who: 'Any staff member',
    text: 'A staff member uploads a document to their institution’s secure workspace. DigiStamp immediately issues the document a private code.',
    points: [
      'The code is created by the system, so nobody can choose or change it.',
      'The code stays inside your institution. It is never shown to outsiders.',
    ],
  },
  {
    icon: 'mdi-clipboard-check-outline',
    title: 'Approve',
    who: 'Assigned officers',
    text: 'The officers you assign review the document and approve or reject it, in the order you set.',
    points: [
      'Every decision is recorded with the person who made it.',
      'Rejected documents never reach the stamp.',
    ],
  },
  {
    icon: 'mdi-check-decagram',
    title: 'Stamp',
    who: 'Authorised officers only',
    text: 'Only an officer authorised by their department can apply its stamp, and only from a registered computer.',
    points: [
      'The officer signs in with a password, proves the computer, and enters a code sent to their phone.',
      'Each officer has a personal login email issued by DigiStamp, so access cannot be shared.',
    ],
  },
  {
    icon: 'mdi-eye-check-outline',
    title: 'Track',
    who: 'The whole department',
    text: 'Everyone in the department can see whether a document has been stamped. Every action stays on record.',
    points: [
      'The audit trail logs uploads, approvals, stamps and downloads, with the officer, the computer and the time.',
      'If a conflict arises, the complete history of a document can be pulled up by its code.',
    ],
  },
]

const roles = [
  { role: 'Department member', can: 'Upload documents and see whether each one has been stamped.' },
  { role: 'Authorised officer', can: 'Approve documents and apply the stamp, from a registered computer.' },
  { role: 'Administrator', can: 'Add and remove officers, approve computers, view the full audit trail and manage billing.' },
]

const start = [
  { title: 'Register your institution', text: 'Your administrator creates the institution account and receives a personal login email.' },
  { title: 'Add your officers', text: 'The administrator adds each authorised officer. DigiStamp issues every officer a unique login email.' },
  { title: 'Officers activate', text: 'Each officer opens their activation link on their work computer, sets a password and registers that computer.' },
  { title: 'Start stamping', text: 'Documents flow from upload to approval to stamp, with a full record from the first step.' },
]

const faqs = [
  {
    q: 'Can anyone in the organisation use our stamp?',
    a: 'No. Only officers authorised by the department can stamp. Everyone else in the department can see the status, but cannot apply the stamp.',
  },
  {
    q: 'Can I use DigiStamp for personal documents?',
    a: 'Yes. A personal account gives you a private workspace where you are the only person who approves and stamps. It has the same computer registration, phone code and audit history as an institution account.',
  },
  {
    q: 'Does it work on any computer?',
    a: 'No. An officer can stamp only from a computer registered to their account. A login from any other computer is refused before any code is sent.',
  },
  {
    q: 'What if an officer leaves or loses a computer?',
    a: 'The administrator switches off the officer or removes the computer. It takes effect immediately, even if the officer was already signed in.',
  },
  {
    q: 'Can people outside our institution see our documents?',
    a: 'No. Document codes and history are visible only to signed-in members of your institution, according to their role.',
  },
  {
    q: 'What happens if there is a dispute about a document?',
    a: 'An administrator opens the document’s history by its code and sees who uploaded, approved and stamped it, from which computer and when. The record can be exported.',
  },
]
</script>

<template>
  <div>
    <!-- ============ HERO ============ -->
    <section class="bg-primary">
      <v-container style="max-width: 1200px" class="py-12 py-md-16">
        <p class="text-overline" style="color: #d4af37">How it works</p>
        <h1 class="serif mb-4" style="font-size: clamp(34px, 5vw, 54px); line-height: 1.1; max-width: 16em">
          From upload to stamped, with every step on record
        </h1>
        <p class="text-h6 font-weight-regular mb-8" style="color: #c9d6e2; max-width: 34em">
          {{ BRAND }} is an online digital stamp that clears the backlog of documents waiting for a stamp,
          while making sure only the right people can use it.
        </p>
        <div class="d-flex flex-wrap ga-3">
          <v-btn :href="DEMO_MAIL" color="secondary" variant="flat" size="large">Request a demo</v-btn>
          <v-btn to="/pricing" color="secondary" variant="outlined" size="large">See pricing</v-btn>
        </div>
      </v-container>
    </section>

    <!-- ============ THE FOUR STEPS ============ -->
    <section class="py-16">
      <v-container style="max-width: 1100px">
        <div class="mb-10" style="max-width: 640px">
          <h2 class="serif text-primary" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
            Four steps, one record
          </h2>
          <p class="mt-3 text-medium-emphasis">
            Each document moves through the same path, and each step adds to its history.
          </p>
        </div>

        <v-row v-for="(s, i) in steps" :key="s.title" class="py-4" style="border-top: 1px solid #dbe3ea">
          <v-col cols="12" md="4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="primary" size="56">
                <v-icon :icon="s.icon" color="secondary" size="30" />
              </v-avatar>
              <div>
                <p class="text-caption text-medium-emphasis">Step {{ i + 1 }}</p>
                <h3 class="serif text-primary text-h5">{{ s.title }}</h3>
                <v-chip size="small" variant="tonal" color="primary" class="mt-1">{{ s.who }}</v-chip>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="8">
            <p class="text-body-1">{{ s.text }}</p>
            <ul class="mt-3 pl-5 text-body-2 text-medium-emphasis">
              <li v-for="p in s.points" :key="p" class="mb-1">{{ p }}</li>
            </ul>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ WHO DOES WHAT ============ -->
    <section class="bg-section py-16">
      <v-container style="max-width: 1100px">
        <h2 class="serif text-primary mb-8" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
          Who does what
        </h2>
        <v-row>
          <v-col v-for="r in roles" :key="r.role" cols="12" md="4">
            <v-card rounded="lg" class="pa-6 h-100" style="border-top: 4px solid #d4af37">
              <h3 class="serif text-primary text-h6 mb-2">{{ r.role }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ r.can }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ INDIVIDUALS ============ -->
    <section class="py-16">
      <v-container style="max-width: 1100px">
        <v-card rounded="lg" class="pa-6 pa-md-8" style="border-left: 6px solid #d4af37">
          <v-row align="center">
            <v-col cols="12" md="2" class="text-center">
              <v-avatar color="primary" size="72">
                <v-icon icon="mdi-account-lock-outline" color="secondary" size="40" />
              </v-avatar>
            </v-col>
            <v-col cols="12" md="10">
              <h2 class="serif text-primary text-h5 mb-2">Using DigiStamp as an individual</h2>
              <p class="text-body-1">
                You do not need an institution. A personal account gives one person a private workspace to
                upload, approve and stamp their own documents.
              </p>
              <ul class="mt-3 pl-5 text-body-2 text-medium-emphasis">
                <li class="mb-1">The same protections apply: a login email issued by DigiStamp, a registered computer and a code sent to your phone.</li>
                <li class="mb-1">Every document gets a private code, and your own audit history records every action.</li>
                <li>Your stamp carries your name. Whether a recipient accepts a personal stamp is up to them.</li>
              </ul>
              <v-btn to="/signup" color="primary" variant="flat" class="mt-4">Create a personal account</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <!-- ============ GETTING STARTED ============ -->
    <section class="py-16">
      <v-container style="max-width: 1100px">
        <h2 class="serif text-primary mb-8" style="font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15">
          Getting your institution started
        </h2>
        <v-row>
          <v-col v-for="(g, i) in start" :key="g.title" cols="12" sm="6" md="3">
            <div class="pt-4" style="border-top: 2px solid #102a43">
              <v-avatar color="primary" size="36" class="mb-3">
                <span class="text-secondary font-weight-bold">{{ i + 1 }}</span>
              </v-avatar>
              <h3 class="serif text-primary text-h6 mb-1">{{ g.title }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ g.text }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="bg-section py-16">
      <v-container style="max-width: 800px">
        <h2 class="serif text-primary mb-6 text-center" style="font-size: clamp(26px, 3.4vw, 36px)">
          Common questions
        </h2>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel v-for="f in faqs" :key="f.q" :title="f.q" :text="f.a" />
        </v-expansion-panels>
      </v-container>
    </section>

    <!-- ============ CTA ============ -->
    <section class="bg-primary text-center py-16">
      <v-container style="max-width: 760px">
        <h2 class="serif mb-3" style="font-size: clamp(28px, 3.8vw, 42px); line-height: 1.15">
          See it working for your institution
        </h2>
        <p class="mb-8" style="color: #c9d6e2">
          Book a walkthrough and we will show you the approval and stamping process.
        </p>
        <div class="d-flex flex-wrap justify-center ga-3">
          <v-btn :href="DEMO_MAIL" color="secondary" variant="flat" size="large">Request a demo</v-btn>
          <v-btn to="/signup" color="secondary" variant="outlined" size="large">Register your institution</v-btn>
        </div>
      </v-container>
    </section>
  </div>
</template>