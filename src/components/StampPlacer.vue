<script setup>
import { ref, computed } from 'vue'

// The stamp position is stored as fractions of the page (0 to 1), not pixels, so it lands in
// the same place on any screen size and on the final stamped file.
//   page      which page the stamp goes on (1 = first page)
//   x, y      the CENTRE of the stamp, measured from the top-left corner of the page
//   width     stamp width as a fraction of the page width
//   rotation  degrees
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ page: 1, x: 0.8, y: 0.88, width: 0.18, rotation: -8 }),
  },
  pages: { type: Array, default: () => [] }, // one image URL per page; empty = sample sheet
  pageRatio: { type: Number, default: 1.414 }, // page height / page width (A4 = 1.414)
  title: { type: String, default: 'DIGISTAMP' },
  subtitle: { type: String, default: 'APPROVED' },
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const DEFAULT_PLACEMENT = { page: 1, x: 0.8, y: 0.88, width: 0.18, rotation: -8 }
const MARGIN = 0.04 // gap kept from the page edge by the corner buttons

const sheet = ref(null)
const dragging = ref(false)

const place = computed(() => props.modelValue)
const pageCount = computed(() => Math.max(props.pages.length, 1))
const pageImage = computed(() => props.pages[place.value.page - 1] || null)

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Half the stamp's size as a fraction of the page, horizontally and vertically (the stamp is square)
const halfW = (width) => width / 2
const halfH = (width) => width / 2 / props.pageRatio

// Every change goes through here, so the whole stamp always stays inside the page
function set(patch) {
  const next = { ...place.value, ...patch }
  next.x = clamp(next.x, halfW(next.width), 1 - halfW(next.width))
  next.y = clamp(next.y, halfH(next.width), 1 - halfH(next.width))
  emit('update:modelValue', next)
}

// ---------- Ready-made positions ----------
const presets = [
  { label: 'Top left', icon: 'mdi-arrow-top-left', fx: 0, fy: 0 },
  { label: 'Top right', icon: 'mdi-arrow-top-right', fx: 1, fy: 0 },
  { label: 'Centre', icon: 'mdi-crosshairs', fx: 0.5, fy: 0.5 },
  { label: 'Bottom left', icon: 'mdi-arrow-bottom-left', fx: 0, fy: 1 },
  { label: 'Bottom right', icon: 'mdi-arrow-bottom-right', fx: 1, fy: 1 },
]

function applyPreset(p) {
  const w = place.value.width
  const x = p.fx === 0.5 ? 0.5 : p.fx === 0 ? MARGIN + halfW(w) : 1 - MARGIN - halfW(w)
  const y = p.fy === 0.5 ? 0.5 : p.fy === 0 ? MARGIN + halfH(w) : 1 - MARGIN - halfH(w)
  set({ x, y })
}

// ---------- Dragging (mouse, finger or pen) ----------
function onDown(e) {
  dragging.value = true
  e.currentTarget.setPointerCapture(e.pointerId)
}
function onMove(e) {
  if (!dragging.value || !sheet.value) return
  const r = sheet.value.getBoundingClientRect()
  set({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
}
function onUp() {
  dragging.value = false
}

// Arrow keys nudge the stamp (Shift = bigger steps), so it works without a mouse
function onKey(e) {
  const step = e.shiftKey ? 0.05 : 0.01
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  const m = moves[e.key]
  if (!m) return
  e.preventDefault()
  set({ x: place.value.x + m[0], y: place.value.y + m[1] })
}

const readout = computed(
  () => `${Math.round(place.value.x * 100)}% across, ${Math.round(place.value.y * 100)}% down`,
)

// Sample lines drawn on the page when no page image is supplied
const sampleLines = [92, 100, 86, 100, 74, 100, 96, 60, 0, 100, 88, 100, 94, 70, 0, 100, 90, 82]
</script>

<template>
  <v-row>
    <!-- ============ THE PAGE ============ -->
    <v-col cols="12" md="7">
      <div
        ref="sheet"
        class="sheet mx-auto"
        :style="{ aspectRatio: `1 / ${pageRatio}` }"
        @pointermove="onMove"
        @pointerup="onUp"
      >
        <img v-if="pageImage" :src="pageImage" alt="Document page" class="page-img" draggable="false" />
        <div v-else class="sample" aria-hidden="true">
          <div
            v-for="(w, i) in sampleLines"
            :key="i"
            class="line"
            :style="{ width: w + '%', visibility: w ? 'visible' : 'hidden' }"
          ></div>
        </div>

        <!-- The movable stamp -->
        <div
          class="stamp"
          :class="{ dragging }"
          role="slider"
          tabindex="0"
          aria-label="Stamp position. Drag it, or use the arrow keys."
          :aria-valuetext="readout"
          :style="{
            left: place.x * 100 + '%',
            top: place.y * 100 + '%',
            width: place.width * 100 + '%',
            transform: `translate(-50%, -50%) rotate(${place.rotation}deg)`,
          }"
          @pointerdown="onDown"
          @keydown="onKey"
        >
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="55" fill="rgba(212,175,55,0.14)" stroke="#d4af37" stroke-width="4" />
            <circle cx="60" cy="60" r="44" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="3 4" />
            <text x="60" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#102a43">{{ title }}</text>
            <text x="60" y="76" text-anchor="middle" font-family="Georgia, serif" font-size="10" font-weight="600" fill="#102a43">{{ subtitle }}</text>
          </svg>
        </div>
      </div>
      <p class="text-center text-caption text-medium-emphasis mt-2">
        Drag the stamp to where you want it, or use the arrow keys.
      </p>
    </v-col>

    <!-- ============ CONTROLS ============ -->
    <v-col cols="12" md="5">
      <p class="text-overline text-medium-emphasis mb-2">Quick positions</p>
      <div class="d-flex flex-wrap ga-2 mb-5">
        <v-btn
          v-for="p in presets"
          :key="p.label"
          size="small"
          variant="outlined"
          color="primary"
          :prepend-icon="p.icon"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </v-btn>
      </div>

      <p class="text-overline text-medium-emphasis mb-1">Size</p>
      <v-slider
        :model-value="place.width * 100"
        :min="10"
        :max="35"
        :step="1"
        color="primary"
        hide-details
        aria-label="Stamp size"
        @update:model-value="(v) => set({ width: v / 100 })"
      />

      <p class="text-overline text-medium-emphasis mb-1 mt-4">Rotation</p>
      <v-slider
        :model-value="place.rotation"
        :min="-45"
        :max="45"
        :step="1"
        color="primary"
        hide-details
        aria-label="Stamp rotation"
        @update:model-value="(v) => set({ rotation: v })"
      />

      <div v-if="pageCount > 1" class="mt-4">
        <p class="text-overline text-medium-emphasis mb-1">Page</p>
        <v-pagination
          :model-value="place.page"
          :length="pageCount"
          :total-visible="5"
          density="comfortable"
          @update:model-value="(v) => set({ page: v })"
        />
      </div>

      <v-sheet color="section" rounded class="pa-3 mt-5 text-body-2">
        <strong>Position:</strong> {{ readout }}<br />
        <strong>Page:</strong> {{ place.page }} of {{ pageCount }}
      </v-sheet>

      <div class="d-flex flex-wrap ga-2 mt-5">
        <v-btn variant="text" color="primary" @click="emit('update:modelValue', { ...DEFAULT_PLACEMENT })">Reset</v-btn>
        <v-spacer />
        <v-btn variant="outlined" color="primary" :disabled="busy" @click="emit('cancel')">Cancel</v-btn>
        <v-btn color="secondary" variant="flat" :loading="busy" @click="emit('confirm', { ...place })">
          Confirm and stamp
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.sheet {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #dbe3ea;
  box-shadow: 0 6px 24px rgba(16, 42, 67, 0.15);
  overflow: hidden;
  user-select: none;
  touch-action: none;
}
.page-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
.sample {
  position: absolute;
  inset: 0;
  padding: 10% 9%;
  display: flex;
  flex-direction: column;
  gap: 2.6%;
}
.line { height: 1.4%; background: #e5ebf1; border-radius: 3px; min-height: 5px; }

.stamp {
  position: absolute;
  aspect-ratio: 1;
  cursor: grab;
  touch-action: none;
  border-radius: 50%;
  outline-offset: 4px;
}
.stamp.dragging { cursor: grabbing; filter: drop-shadow(0 4px 8px rgba(16, 42, 67, 0.3)); }
.stamp:focus-visible { outline: 3px solid #102a43; }
.stamp svg { display: block; width: 100%; height: 100%; pointer-events: none; }
</style>