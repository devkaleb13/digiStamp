<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits(['unauthorized'])

// true  = sample data, everything works in the browser without a backend
// false = call the real Laravel API
const USE_DEMO = true

const API = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'digistamp_token'
const MAIL_DOMAIN = 'digistamp.app' // change to the domain you own
const INSTITUTION_SLUG = 'demoinstitution' // demo only: the server builds the real address

const route = useRoute()
const tab = computed(() => (route.path.endsWith('/devices') ? 'devices' : 'officers'))

const departments = ['Records', 'Finance', 'Human Resources', 'Procurement', 'Registry']

// ---------- State ----------
const loading = ref(true)
const error = ref('')
const snackbar = reactive({ show: false, text: '', color: 'success' })
const officers = ref([])
const devices = ref([])
const activity = ref([])
const filter = ref('all')

// ---------- Sample data ----------
function demoData() {
  officers.value = [
    { id: 1, name: 'Jane Wanjiru', loginEmail: `jane.wanjiru@${INSTITUTION_SLUG}.${MAIL_DOMAIN}`, phone: '••••••5678', department: 'Records', status: 'approved' },
    { id: 2, name: 'Peter Otieno', loginEmail: `peter.otieno@${INSTITUTION_SLUG}.${MAIL_DOMAIN}`, phone: '••••••2210', department: 'Finance', status: 'pending' },
    { id: 3, name: 'Amina Hassan', loginEmail: `amina.hassan@${INSTITUTION_SLUG}.${MAIL_DOMAIN}`, phone: '••••••9034', department: 'Registry', status: 'pending' },
    { id: 4, name: 'Samuel Kiptoo', loginEmail: `samuel.kiptoo@${INSTITUTION_SLUG}.${MAIL_DOMAIN}`, phone: '••••••4471', department: 'Procurement', status: 'invited' },
    { id: 5, name: 'Mary Njeri', loginEmail: `mary.njeri@${INSTITUTION_SLUG}.${MAIL_DOMAIN}`, phone: '••••••1189', department: 'Records', status: 'revoked' },
  ]
  devices.value = [
    { id: 1, officerId: 1, officer: 'Jane Wanjiru', label: 'Records office PC', status: 'approved', registered: '3 Nov 2026', lastUsed: 'Today' },
    { id: 2, officerId: 2, officer: 'Peter Otieno', label: 'Finance PC 2', status: 'pending', registered: 'Today', lastUsed: 'Never' },
    { id: 3, officerId: 1, officer: 'Jane Wanjiru', label: 'Laptop', status: 'pending', registered: 'Today', lastUsed: 'Never' },
    { id: 4, officerId: 5, officer: 'Mary Njeri', label: 'Records PC 4', status: 'revoked', registered: '1 Oct 2026', lastUsed: '12 Oct 2026' },
  ]
  activity.value = []
}

// ---------- API ----------
function token() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

async function api(path, options = {}) {
  let res
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`,
      },
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection.')
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) {
    emit('unauthorized')
    throw new Error('Your session has ended. Please sign in again.')
  }
  if (!res.ok) throw new Error(data.message || 'Something went wrong.')
  return data
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (USE_DEMO) {
      await new Promise((r) => setTimeout(r, 350))
      demoData()
    } else {
      const [o, d] = await Promise.all([api('/admin/officers'), api('/admin/devices')])
      officers.value = o.officers
      devices.value = d.devices
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ---------- Labels ----------
const officerStatus = {
  invited: { label: 'Invited', color: 'grey' },
  pending: { label: 'Awaiting approval', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
  revoked: { label: 'Access revoked', color: 'error' },
}
const deviceStatus = {
  pending: { label: 'Awaiting approval', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  revoked: { label: 'Revoked', color: 'error' },
}

const officerFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Awaiting approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'invited', label: 'Invited' },
  { value: 'revoked', label: 'Revoked or declined' },
]

// ---------- Derived ----------
const pendingOfficers = computed(() => officers.value.filter((o) => o.status === 'pending'))
const pendingDevices = computed(() => devices.value.filter((d) => d.status === 'pending'))

const stats = computed(() => [
  { label: 'Officers awaiting approval', value: pendingOfficers.value.length, icon: 'mdi-account-clock-outline', color: 'warning' },
  { label: 'Computers awaiting approval', value: pendingDevices.value.length, icon: 'mdi-laptop', color: 'warning' },
  { label: 'Approved officers', value: officers.value.filter((o) => o.status === 'approved').length, icon: 'mdi-account-check-outline', color: 'success' },
  { label: 'Invited, not activated', value: officers.value.filter((o) => o.status === 'invited').length, icon: 'mdi-email-fast-outline', color: 'primary' },
])

const visibleOfficers = computed(() => {
  if (filter.value === 'all') return officers.value
  if (filter.value === 'revoked') return officers.value.filter((o) => ['revoked', 'declined'].includes(o.status))
  return officers.value.filter((o) => o.status === filter.value)
})

// ---------- Notifications and the session activity list ----------
function notify(text, color = 'success') {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}
function log(text) {
  activity.value.unshift({ id: Date.now() + Math.random(), text, time: 'Just now' })
}

// ---------- Confirmation dialog (for actions that cannot be taken back lightly) ----------
const confirm = reactive({ open: false, title: '', text: '', button: '', color: 'error', run: null, busy: false })

function ask({ title, text, button, color = 'error', run }) {
  Object.assign(confirm, { open: true, title, text, button, color, run, busy: false })
}
async function confirmed() {
  confirm.busy = true
  try {
    await confirm.run()
    confirm.open = false
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    confirm.busy = false
  }
}

// ---------- Officer actions ----------
async function changeOfficer(o, action, status, message) {
  if (USE_DEMO) await new Promise((r) => setTimeout(r, 300))
  else await api(`/admin/officers/${o.id}`, { method: 'PATCH', body: JSON.stringify({ action }) })
  o.status = status
  // a revoked or declined officer's computers stop working too
  if (status === 'revoked' || status === 'declined') {
    devices.value.filter((d) => d.officerId === o.id && d.status !== 'revoked').forEach((d) => (d.status = 'revoked'))
  }
  log(message)
  notify(message)
}

const approveOfficer = (o) => changeOfficer(o, 'approve', 'approved', `${o.name} approved to use the stamp`).catch((e) => notify(e.message, 'error'))

const declineOfficer = (o) =>
  ask({
    title: `Decline ${o.name}?`,
    text: 'They will not be able to use the stamp, and their computers will stop working. You can approve them later.',
    button: 'Decline',
    run: () => changeOfficer(o, 'decline', 'declined', `${o.name} declined`),
  })

const revokeOfficer = (o) =>
  ask({
    title: `Switch off ${o.name}?`,
    text: 'Access ends immediately, even if they are signed in now. Their computers are revoked as well.',
    button: 'Switch off access',
    run: () => changeOfficer(o, 'revoke', 'revoked', `Access switched off for ${o.name}`),
  })

const restoreOfficer = (o) => changeOfficer(o, 'approve', 'approved', `${o.name} approved to use the stamp`).catch((e) => notify(e.message, 'error'))

// ---------- Computer actions ----------
async function changeDevice(d, action, status, message) {
  if (USE_DEMO) await new Promise((r) => setTimeout(r, 300))
  else await api(`/admin/devices/${d.id}`, { method: 'PATCH', body: JSON.stringify({ action }) })
  d.status = status
  log(message)
  notify(message)
}

const approveDevice = (d) => changeDevice(d, 'approve', 'approved', `Computer "${d.label}" approved for ${d.officer}`).catch((e) => notify(e.message, 'error'))

const revokeDevice = (d) =>
  ask({
    title: `Revoke "${d.label}"?`,
    text: `${d.officer} will no longer be able to stamp from this computer.`,
    button: 'Revoke computer',
    run: () => changeDevice(d, 'revoke', 'revoked', `Computer "${d.label}" revoked for ${d.officer}`),
  })

// ---------- Add officer ----------
const addDialog = ref(false)
const addForm = reactive({ name: '', phone: '', email: '', department: null })
const addFormRef = ref(null)
const adding = ref(false)
const created = ref(null) // shows the issued login email after success
const copied = ref(false)

const rules = {
  required: (v) => !!String(v ?? '').trim() || 'This field is required.',
  phone: (v) => /^(\+?254|0)\d{9}$/.test(String(v).replace(/\s/g, '')) || 'Enter a valid mobile number, e.g. 0712 345 678.',
  email: (v) => /^\S+@\S+\.\S+$/.test(String(v).trim()) || 'Enter a valid email address.',
}

function openAdd() {
  Object.assign(addForm, { name: '', phone: '', email: '', department: null })
  created.value = null
  addDialog.value = true
}

// Demo only: the server generates the real address and guarantees it is unique
function demoLoginEmail(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
  return `${clean || 'officer'}@${INSTITUTION_SLUG}.${MAIL_DOMAIN}`
}

async function submitAdd() {
  const { valid } = await addFormRef.value.validate()
  if (!valid) return
  adding.value = true
  try {
    let officer
    if (USE_DEMO) {
      await new Promise((r) => setTimeout(r, 600))
      officer = {
        id: Date.now(),
        name: addForm.name.trim(),
        loginEmail: demoLoginEmail(addForm.name),
        phone: '••••••' + String(addForm.phone).replace(/\D/g, '').slice(-4),
        department: addForm.department,
        status: 'invited',
      }
    } else {
      const data = await api('/admin/officers', {
        method: 'POST',
        body: JSON.stringify({
          name: addForm.name.trim(),
          phone: addForm.phone,
          contact_email: addForm.email.trim(),
          department: addForm.department,
        }),
      })
      officer = data.officer
    }
    officers.value.unshift(officer)
    created.value = officer
    log(`${officer.name} added and sent an activation link`)
  } catch (e) {
    notify(e.message, 'error')
  } finally {
    adding.value = false
  }
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(created.value.loginEmail)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    /* clipboard not available: the address is still on screen */
  }
}
</script>

<template>
  <div class="bg-section py-10" style="min-height: calc(100vh - 68px)">
    <v-container style="max-width: 1200px">
      <!-- Heading -->
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-2">
        <div>
          <h1 class="serif text-primary" style="font-size: clamp(26px, 3.4vw, 36px); line-height: 1.15">
            Administration
          </h1>
          <p class="text-medium-emphasis">Decide who can use your institution's stamp, and from which computers.</p>
        </div>
        <v-btn v-if="tab === 'officers'" color="secondary" variant="flat" prepend-icon="mdi-account-plus-outline" @click="openAdd">
          Add officer
        </v-btn>
      </div>

      <v-alert v-if="USE_DEMO" type="info" variant="tonal" density="compact" class="mb-4 text-caption">
        Demo mode with sample officers and computers. Every button works, but nothing is saved.
      </v-alert>
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">{{ error }}</v-alert>

      <!-- Tabs -->
      <v-tabs color="primary" class="mb-6">
        <v-tab to="/admin/officers" prepend-icon="mdi-account-group-outline">
          Officers
          <v-badge v-if="pendingOfficers.length" :content="pendingOfficers.length" color="warning" inline class="ml-2" />
        </v-tab>
        <v-tab to="/admin/devices" prepend-icon="mdi-laptop">
          Computers
          <v-badge v-if="pendingDevices.length" :content="pendingDevices.length" color="warning" inline class="ml-2" />
        </v-tab>
      </v-tabs>

      <v-progress-linear v-if="loading" indeterminate color="secondary" class="mb-4" />

      <template v-else>
        <!-- Summary -->
        <v-row class="mb-2">
          <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
            <v-card rounded="lg" class="pa-4 h-100">
              <v-icon :icon="s.icon" :color="s.color" size="26" />
              <div class="serif text-primary mt-1" style="font-size: 30px; line-height: 1.1">{{ s.value }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ s.label }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ================= OFFICERS ================= -->
        <template v-if="tab === 'officers'">
          <!-- Approval queue -->
          <v-card v-if="pendingOfficers.length" rounded="lg" class="pa-5 mb-6" style="border-left: 6px solid #d4af37">
            <h2 class="serif text-primary text-h6 mb-1">Waiting for your approval</h2>
            <p class="text-body-2 text-medium-emphasis mb-3">
              These officers have activated their accounts. They cannot use the stamp until you approve them.
            </p>
            <v-list class="bg-transparent px-0">
              <v-list-item v-for="o in pendingOfficers" :key="o.id" class="px-0 border-t">
                <template #prepend>
                  <v-avatar color="primary" size="40" class="mr-3">
                    <span class="text-secondary font-weight-bold">{{ o.name.charAt(0) }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ o.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ o.department }} · {{ o.loginEmail }}</v-list-item-subtitle>
                <template #append>
                  <div class="d-flex ga-2">
                    <v-btn size="small" variant="outlined" color="error" @click="declineOfficer(o)">Decline</v-btn>
                    <v-btn size="small" variant="flat" color="success" @click="approveOfficer(o)">Approve</v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- All officers -->
          <v-card rounded="lg" class="pa-5">
            <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-3">
              <h2 class="serif text-primary text-h6">All officers</h2>
              <v-chip-group v-model="filter" mandatory selected-class="bg-primary">
                <v-chip v-for="f in officerFilters" :key="f.value" :value="f.value" size="small" filter>{{ f.label }}</v-chip>
              </v-chip-group>
            </div>

            <div style="overflow-x: auto">
              <v-table style="min-width: 720px">
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Login email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in visibleOfficers" :key="o.id">
                    <td>
                      <div class="font-weight-medium">{{ o.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ o.phone }}</div>
                    </td>
                    <td class="text-body-2" style="word-break: break-all">{{ o.loginEmail }}</td>
                    <td>{{ o.department }}</td>
                    <td>
                      <v-chip size="small" variant="tonal" :color="officerStatus[o.status].color">
                        {{ officerStatus[o.status].label }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn v-if="o.status === 'pending'" size="small" variant="flat" color="success" class="mr-1" @click="approveOfficer(o)">Approve</v-btn>
                      <v-btn v-if="o.status === 'approved'" size="small" variant="outlined" color="error" @click="revokeOfficer(o)">Switch off</v-btn>
                      <v-btn v-if="o.status === 'revoked' || o.status === 'declined'" size="small" variant="outlined" color="primary" @click="restoreOfficer(o)">Approve again</v-btn>
                      <span v-if="o.status === 'invited'" class="text-caption text-medium-emphasis">Waiting for activation</span>
                    </td>
                  </tr>
                  <tr v-if="!visibleOfficers.length">
                    <td colspan="5" class="text-center text-medium-emphasis py-6">No officers in this view.</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </template>

        <!-- ================= COMPUTERS ================= -->
        <template v-else>
          <v-card v-if="pendingDevices.length" rounded="lg" class="pa-5 mb-6" style="border-left: 6px solid #d4af37">
            <h2 class="serif text-primary text-h6 mb-1">Computers waiting for approval</h2>
            <p class="text-body-2 text-medium-emphasis mb-3">
              An officer can only stamp from a computer you have approved. Approve only computers you recognise.
            </p>
            <v-list class="bg-transparent px-0">
              <v-list-item v-for="d in pendingDevices" :key="d.id" class="px-0 border-t">
                <template #prepend>
                  <v-avatar color="primary" size="40" class="mr-3">
                    <v-icon icon="mdi-laptop" color="secondary" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ d.label }}</v-list-item-title>
                <v-list-item-subtitle>{{ d.officer }} · registered {{ d.registered }}</v-list-item-subtitle>
                <template #append>
                  <div class="d-flex ga-2">
                    <v-btn size="small" variant="outlined" color="error" @click="revokeDevice(d)">Reject</v-btn>
                    <v-btn size="small" variant="flat" color="success" @click="approveDevice(d)">Approve</v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card rounded="lg" class="pa-5">
            <h2 class="serif text-primary text-h6 mb-3">All computers</h2>
            <div style="overflow-x: auto">
              <v-table style="min-width: 640px">
                <thead>
                  <tr>
                    <th>Computer</th>
                    <th>Officer</th>
                    <th>Registered</th>
                    <th>Last used</th>
                    <th>Status</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in devices" :key="d.id">
                    <td class="font-weight-medium">{{ d.label }}</td>
                    <td>{{ d.officer }}</td>
                    <td>{{ d.registered }}</td>
                    <td>{{ d.lastUsed }}</td>
                    <td>
                      <v-chip size="small" variant="tonal" :color="deviceStatus[d.status].color">
                        {{ deviceStatus[d.status].label }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn v-if="d.status === 'pending'" size="small" variant="flat" color="success" @click="approveDevice(d)">Approve</v-btn>
                      <v-btn v-if="d.status === 'approved'" size="small" variant="outlined" color="error" @click="revokeDevice(d)">Revoke</v-btn>
                    </td>
                  </tr>
                  <tr v-if="!devices.length">
                    <td colspan="6" class="text-center text-medium-emphasis py-6">No computers registered yet.</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </template>

        <!-- Recent actions -->
        <v-card v-if="activity.length" rounded="lg" class="pa-5 mt-6">
          <h2 class="serif text-primary text-h6 mb-2">Your recent actions</h2>
          <v-list density="compact" class="bg-transparent px-0">
            <v-list-item v-for="a in activity" :key="a.id" class="px-0">
              <v-list-item-title class="text-body-2">{{ a.text }}</v-list-item-title>
              <template #append><span class="text-caption text-medium-emphasis">{{ a.time }}</span></template>
            </v-list-item>
          </v-list>
          <p class="text-caption text-medium-emphasis">
            Every approval, decline and revocation is also written to the institution's audit log.
          </p>
        </v-card>
      </template>
    </v-container>

    <!-- ============ ADD OFFICER ============ -->
    <v-dialog v-model="addDialog" max-width="520" persistent>
      <v-card rounded="lg" class="pa-6">
        <!-- After success -->
        <template v-if="created">
          <div class="text-center mb-4">
            <v-avatar color="success" size="56" class="mb-3"><v-icon icon="mdi-check-bold" color="white" size="30" /></v-avatar>
            <h2 class="serif text-primary text-h6">Officer added</h2>
            <p class="text-body-2 text-medium-emphasis mt-1">
              An activation link was sent to their contact email. They cannot stamp until they activate and you approve them.
            </p>
          </div>
          <v-sheet rounded class="pa-4 border" style="border-color: #d4af37 !important">
            <p class="text-overline text-medium-emphasis">Login email issued</p>
            <div class="d-flex align-center ga-2">
              <strong class="text-primary" style="word-break: break-all">{{ created.loginEmail }}</strong>
              <v-btn :icon="copied ? 'mdi-check' : 'mdi-content-copy'" :color="copied ? 'success' : 'primary'" variant="text" size="small" aria-label="Copy login email" @click="copyEmail" />
            </div>
          </v-sheet>
          <div class="d-flex justify-end ga-2 mt-5">
            <v-btn variant="text" color="primary" @click="openAdd">Add another</v-btn>
            <v-btn variant="flat" color="primary" @click="addDialog = false">Done</v-btn>
          </div>
        </template>

        <!-- Form -->
        <template v-else>
          <h2 class="serif text-primary text-h6 mb-1">Add an officer</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            DigiStamp issues the officer a unique login email, and sends an activation link to the contact email below.
          </p>
          <v-form ref="addFormRef" validate-on="blur lazy" @submit.prevent="submitAdd">
            <v-text-field v-model="addForm.name" label="Full name" variant="outlined" prepend-inner-icon="mdi-account-outline" :rules="[rules.required]" />
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="addForm.phone" label="Mobile number" hint="Login codes are sent here" variant="outlined" prepend-inner-icon="mdi-cellphone" placeholder="0712 345 678" :rules="[rules.phone]" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="addForm.email" label="Contact email" hint="Receives the activation link" type="email" variant="outlined" prepend-inner-icon="mdi-email-outline" :rules="[rules.email]" />
              </v-col>
            </v-row>
            <v-select v-model="addForm.department" :items="departments" label="Department" variant="outlined" :rules="[rules.required]" />
            <div class="d-flex justify-end ga-2 mt-2">
              <v-btn variant="text" color="primary" :disabled="adding" @click="addDialog = false">Cancel</v-btn>
              <v-btn type="submit" variant="flat" color="secondary" :loading="adding">Add officer</v-btn>
            </div>
          </v-form>
        </template>
      </v-card>
    </v-dialog>

    <!-- ============ CONFIRM ============ -->
    <v-dialog v-model="confirm.open" max-width="440" :persistent="confirm.busy">
      <v-card rounded="lg" class="pa-6">
        <h2 class="serif text-primary text-h6 mb-2">{{ confirm.title }}</h2>
        <p class="text-body-2 text-medium-emphasis">{{ confirm.text }}</p>
        <div class="d-flex justify-end ga-2 mt-5">
          <v-btn variant="text" color="primary" :disabled="confirm.busy" @click="confirm.open = false">Cancel</v-btn>
          <v-btn variant="flat" :color="confirm.color" :loading="confirm.busy" @click="confirmed">{{ confirm.button }}</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3500">{{ snackbar.text }}</v-snackbar>
  </div>
</template>