<script setup>
import { reactive, ref, computed, onBeforeUnmount } from 'vue'
import { startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser'

const emit = defineEmits(['authenticated'])

// true  = click through every step with sample data (no backend needed)
// false = call the real Laravel API
const USE_DEMO = true

const API = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'digistamp_token'
const USER_KEY = 'digistamp_user' // { name, role }, read by the navigation bar
const OTP_LENGTH = 6
const OTP_SECONDS = 60 // codes last 1 minute

// ---------- State ----------
// credentials -> device -> otp   (or blocked, when the computer is not registered)
const step = ref('credentials')
const form = reactive({ email: '', password: '', rememberMe: false })
const showPassword = ref(false)

const loginToken = ref('') // issued after a correct password
const deviceOptions = ref(null) // passkey challenge from the server
const otpToken = ref('')
const maskedPhone = ref('')
const otp = ref('')
const otpKey = ref(0) // changing this resets the code boxes

const errorMessage = ref('')
const infoMessage = ref('')
const loading = ref(false)
const deviceBusy = ref(false)
const secondsLeft = ref(0)
let timer = null

const stepNumber = computed(() => ({ credentials: 1, device: 2, blocked: 2, otp: 3 })[step.value])
const canResend = computed(() => secondsLeft.value === 0 && !loading.value)
const progress = computed(() => (secondsLeft.value / OTP_SECONDS) * 100)
const countdown = computed(() => {
  const m = String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')
  const s = String(secondsLeft.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

// ---------- API ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Sample responses so the screens can be tested without Laravel
let demoRole = 'officer'
async function demoApi(path, body) {
  await sleep(600)
  if (path === '/login') {
    demoRole = String(body.email).toLowerCase().includes('admin') ? 'admin' : 'officer'
    // password "blocked" shows the "computer not registered" screen
    if (body.password === 'blocked') {
      const err = new Error('This computer is not registered.')
      err.code = 'device_not_registered'
      throw err
    }
    return { login_token: 'demo', device_options: {} }
  }
  if (path === '/login/device') return { otp_token: 'demo', masked_phone: '••••••5678' }
  if (path === '/otp/resend') return {}
  if (path === '/otp/verify') {
    if (body.code !== '123456') throw new Error('That code is not correct.')
    return { token: 'demo-token', user: { name: 'Demo User', role: demoRole } }
  }
  return {}
}

async function post(path, body) {
  if (USE_DEMO) return demoApi(path, body)

  let res
  try {
    res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong. Please try again.')
    err.code = data.code // e.g. 'device_not_registered'
    throw err
  }
  return data
}

// ---------- Helpers ----------
function startTimer() {
  clearInterval(timer)
  secondsLeft.value = OTP_SECONDS
  timer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value--
    else clearInterval(timer)
  }, 1000)
}

function clearMessages() {
  errorMessage.value = ''
  infoMessage.value = ''
}

function resetCode() {
  otp.value = ''
  otpKey.value++
}

// ---------- Step 1: login email + password ----------
async function loginUser() {
  clearMessages()

  const email = form.email.trim()
  if (!email || !form.password) {
    errorMessage.value = 'Please enter your login email and password.'
    return
  }

  loading.value = true
  try {
    const data = await post('/login', { email, password: form.password, remember: form.rememberMe })
    loginToken.value = data.login_token
    deviceOptions.value = data.device_options
    step.value = 'device'
    verifyDevice() // opens the Windows Hello / fingerprint prompt straight away
  } catch (e) {
    if (e.code === 'device_not_registered') step.value = 'blocked'
    else errorMessage.value = e.message
  } finally {
    loading.value = false
  }
}

// ---------- Step 2: verify this computer (passkey) ----------
// The server only sends the SMS code after this computer has been proven,
// so an unregistered computer never triggers a text message.
async function verifyDevice() {
  clearMessages()
  deviceBusy.value = true
  try {
    let data
    if (USE_DEMO) {
      await sleep(900)
      data = await post('/login/device', { login_token: loginToken.value })
    } else {
      if (!browserSupportsWebAuthn()) {
        throw new Error('This browser cannot verify the computer. Use an up-to-date Chrome, Edge or Safari.')
      }
      const assertion = await startAuthentication({ optionsJSON: deviceOptions.value })
      data = await post('/login/device', { login_token: loginToken.value, assertion })
    }

    otpToken.value = data.otp_token
    maskedPhone.value = data.masked_phone || 'your registered phone'
    resetCode()
    step.value = 'otp'
    startTimer()
  } catch (e) {
    if (e.code === 'device_not_registered') step.value = 'blocked'
    else if (e.name === 'NotAllowedError') errorMessage.value = 'Verification was cancelled or timed out. Try again.'
    else errorMessage.value = e.message
  } finally {
    deviceBusy.value = false
  }
}

// ---------- Step 3: the 6-digit phone code ----------
async function resend() {
  if (!canResend.value) return
  clearMessages()
  loading.value = true
  try {
    await post('/otp/resend', { otp_token: otpToken.value })
    resetCode()
    startTimer()
    infoMessage.value = 'A new code has been sent.'
  } catch (e) {
    errorMessage.value = e.message
  } finally {
    loading.value = false
  }
}

// Runs automatically when the 6th digit is entered
async function verify(value) {
  if (loading.value) return // prevents a double submit
  const entered = typeof value === 'string' ? value : otp.value
  clearMessages()

  if (entered.length < OTP_LENGTH) return
  if (secondsLeft.value === 0) {
    errorMessage.value = 'This code has expired. Request a new one.'
    resetCode()
    return
  }

  loading.value = true
  try {
    const data = await post('/otp/verify', { otp_token: otpToken.value, code: entered })
    if (data.token) {
      const store = form.rememberMe ? localStorage : sessionStorage
      store.setItem(TOKEN_KEY, data.token)
      if (data.user) store.setItem(USER_KEY, JSON.stringify(data.user))
    }
    clearInterval(timer)
    emit('authenticated', data) // App.vue redirects to the dashboard
  } catch (e) {
    errorMessage.value = e.message
    resetCode()
  } finally {
    loading.value = false
  }
}

function backToCredentials() {
  clearInterval(timer)
  step.value = 'credentials'
  form.password = ''
  loginToken.value = ''
  otpToken.value = ''
  deviceOptions.value = null
  resetCode()
  clearMessages()
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="bg-section d-flex align-center justify-center py-12 px-4" style="min-height: calc(100vh - 68px)">
    <v-card
      max-width="440"
      width="100%"
      rounded="lg"
      elevation="6"
      class="pa-6 pa-sm-8"
      style="border-top: 4px solid #d4af37"
    >
      <!-- ============ STEP 1: LOGIN EMAIL + PASSWORD ============ -->
      <template v-if="step === 'credentials'">
        <div class="text-center mb-6">
          <v-avatar color="primary" size="56" class="mb-3">
            <v-icon icon="mdi-shield-lock-outline" color="secondary" size="30" />
          </v-avatar>
          <h1 class="serif text-h5 text-primary">Authorised Officer Sign In</h1>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Only authorised officers, on a registered computer, can use the stamp.
          </p>
          <p class="text-overline text-primary mt-2">Step 1 of 3: your credentials</p>
        </div>

        <v-alert v-if="USE_DEMO" type="info" variant="tonal" density="compact" class="mb-4 text-caption">
          Demo mode: any email and password work. An email containing <strong>admin</strong> signs in as an administrator. Use the password <strong>blocked</strong> to see the
          unregistered-computer screen. The phone code is <strong>123456</strong>.
        </v-alert>

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-4" role="alert">
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="loginUser">
          <v-text-field
            v-model="form.email"
            label="DigiStamp login email"
            hint="The email issued to you by DigiStamp"
            persistent-hint
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            autocomplete="username"
            class="mb-3"
          />
          <v-text-field
            v-model="form.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            autocomplete="current-password"
            @click:append-inner="showPassword = !showPassword"
          />

          <div class="d-flex justify-space-between align-center flex-wrap mb-4">
            <v-checkbox v-model="form.rememberMe" label="Remember me" color="primary" density="compact" hide-details />
            <router-link to="/forgot-password" class="text-body-2 text-primary font-weight-bold">
              Forgot password?
            </router-link>
          </div>

          <v-btn type="submit" block size="large" color="secondary" variant="flat" :loading="loading">
            Continue
          </v-btn>
        </v-form>
      </template>

      <!-- ============ STEP 2: VERIFY THIS COMPUTER ============ -->
      <template v-else-if="step === 'device'">
        <div class="text-center mb-6">
          <v-avatar color="primary" size="56" class="mb-3">
            <v-icon icon="mdi-fingerprint" color="secondary" size="30" />
          </v-avatar>
          <h1 class="serif text-h5 text-primary">Verify this computer</h1>
          <p class="text-body-2 text-medium-emphasis mt-2">
            Confirm with Windows Hello, your fingerprint or your computer PIN. This proves you are on
            your registered computer.
          </p>
          <p class="text-overline text-primary mt-2">Step 2 of 3: computer check</p>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-4" role="alert">
          {{ errorMessage }}
        </v-alert>

        <div v-if="deviceBusy" class="text-center py-4" aria-live="polite">
          <v-progress-circular indeterminate color="secondary" size="40" />
          <p class="text-body-2 text-medium-emphasis mt-3">Waiting for your confirmation…</p>
        </div>

        <v-btn v-else block size="large" color="secondary" variant="flat" prepend-icon="mdi-fingerprint" @click="verifyDevice">
          Try again
        </v-btn>

        <div class="text-center mt-4">
          <v-btn variant="text" size="small" color="primary" prepend-icon="mdi-arrow-left" @click="backToCredentials">
            Back to sign in
          </v-btn>
        </div>
      </template>

      <!-- ============ BLOCKED: COMPUTER NOT REGISTERED ============ -->
      <template v-else-if="step === 'blocked'">
        <div class="text-center mb-6">
          <v-avatar color="error" size="56" class="mb-3">
            <v-icon icon="mdi-laptop-off" color="white" size="30" />
          </v-avatar>
          <h1 class="serif text-h5 text-primary">This computer is not registered</h1>
          <p class="text-body-2 text-medium-emphasis mt-2">
            DigiStamp can only be used on computers registered to your account. No code has been sent.
          </p>
        </div>

        <v-sheet color="section" rounded class="pa-4 text-body-2 mb-4">
          <strong>What to do</strong>
          <ol class="ml-4 mt-2">
            <li>Ask your institution administrator to approve this computer.</li>
            <li>Or sign in from the computer you registered when you activated your account.</li>
          </ol>
        </v-sheet>

        <v-btn block variant="outlined" color="primary" prepend-icon="mdi-arrow-left" @click="backToCredentials">
          Back to sign in
        </v-btn>
      </template>

      <!-- ============ STEP 3: 6-DIGIT PHONE CODE ============ -->
      <template v-else>
        <div class="text-center mb-6">
          <v-avatar color="primary" size="56" class="mb-3">
            <v-icon icon="mdi-cellphone-message" color="secondary" size="30" />
          </v-avatar>
          <h1 class="serif text-h5 text-primary">Enter your code</h1>
          <p class="text-body-2 text-medium-emphasis mt-2">
            We sent a {{ OTP_LENGTH }}-digit code by SMS to <strong>{{ maskedPhone }}</strong>.
            You will be signed in as soon as you enter it.
          </p>
          <p class="text-overline text-primary mt-2">Step 3 of 3: identity verification</p>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-4" role="alert">
          {{ errorMessage }}
        </v-alert>
        <v-alert v-if="infoMessage" type="success" variant="tonal" density="compact" class="mb-4" role="status">
          {{ infoMessage }}
        </v-alert>

        <v-otp-input
          :key="otpKey"
          v-model="otp"
          :length="OTP_LENGTH"
          :disabled="loading"
          variant="outlined"
          autofocus
          @finish="verify"
        />

        <v-progress-linear :model-value="progress" color="secondary" height="4" rounded class="mt-2 mb-2" />
        <p
          class="text-center text-body-2 mb-4"
          :class="secondsLeft === 0 ? 'text-error font-weight-bold' : 'text-medium-emphasis'"
          aria-live="polite"
        >
          <template v-if="loading">Signing you in…</template>
          <template v-else>{{ secondsLeft > 0 ? `Code expires in ${countdown}` : 'Code expired' }}</template>
        </p>

        <div class="d-flex justify-space-between flex-wrap">
          <v-btn variant="text" size="small" color="primary" :disabled="!canResend" @click="resend">
            Resend code
          </v-btn>
          <v-btn variant="text" size="small" color="primary" prepend-icon="mdi-arrow-left" @click="backToCredentials">
            Back to sign in
          </v-btn>
        </div>
      </template>

      <!-- Security note -->
      <v-sheet color="section" rounded class="d-flex ga-3 pa-3 mt-6 text-body-2 text-medium-emphasis">
        <v-icon icon="mdi-lock-outline" color="success" size="20" class="mt-1" />
        <span>
          Every sign-in needs your password, your registered computer and a code sent to your phone.
        </span>
      </v-sheet>

      <p v-if="step === 'credentials'" class="text-center text-body-2 text-medium-emphasis mt-5">
        Need access? Contact your institution administrator.<br />
        Registering an institution?
        <router-link to="/signup" class="text-primary font-weight-bold">Register here</router-link>
      </p>
    </v-card>
  </div>
</template>