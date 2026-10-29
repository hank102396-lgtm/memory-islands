<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import IslandSelector from './presentation/components/IslandSelector.vue'
import WelcomeScene from './presentation/components/WelcomeScene.vue'
import LetterScene from './presentation/components/LetterScene.vue'
import IslandView from './presentation/components/IslandView.vue'
import MemoryModal from './presentation/components/MemoryModal.vue'
import AddMemoryModal from './presentation/components/AddMemoryModal.vue'
import { ISLANDS, getIslandById } from './domain/island'
import { supabaseService } from './infrastructure/supabaseService'
import { createFetchMemoriesUseCase } from './usecases/fetchMemoriesUseCase'
import { createCreateMemoryUseCase } from './usecases/createMemoryUseCase'
import { createDeleteMemoryUseCase } from './usecases/deleteMemoryUseCase'
import { createSubscribeMemoriesUseCase } from './usecases/subscribeMemoriesUseCase'
import { audioService } from './infrastructure/audioService'
import { Volume2, VolumeX } from 'lucide-vue-next'

const fetchMemories = createFetchMemoriesUseCase(supabaseService)
const createMemory = createCreateMemoryUseCase(supabaseService)
const deleteMemory = createDeleteMemoryUseCase(supabaseService)
const subscribeMemories = createSubscribeMemoriesUseCase(supabaseService)
const selectedIslandId = ref(null)
const hasEnteredWorld = ref(false)
const hasReadLetter = ref(false)
const letterStartsOpened = ref(false)
const focusIslandId = ref(null)
const enteringIsland = ref(false)
const memories = ref([])
const allMemories = ref([])
const selectedMemory = ref(null)
const showAddModal = ref(false)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const arrivalMemoryId = ref(null)
const errorMessage = ref('')
const isMusicMuted = ref(audioService.muted)
const memoryUnsubscribers = []

const selectedIsland = computed(() => selectedIslandId.value ? getIslandById(selectedIslandId.value) : null)
const totalMemories = computed(() => allMemories.value.length)
const memoriesByIsland = computed(() => Object.fromEntries(ISLANDS.map((island) => [
  island.id,
  allMemories.value.filter((memory) => memory.islandId === island.id),
])))

async function selectIsland(island) {
  if (enteringIsland.value) return
  audioService.playAmbient(island.id)
  errorMessage.value = ''
  loading.value = true
  enteringIsland.value = true
  try {
    const [loadedMemories] = await Promise.all([
      fetchMemories(island.id),
      new Promise((resolve) => window.setTimeout(resolve, 1350)),
    ])
    memories.value = loadedMemories
    selectedIslandId.value = island.id
  } catch (error) {
    errorMessage.value = error.message || '記憶暫時無法載入，請稍後再試。'
  } finally {
    loading.value = false
    enteringIsland.value = false
  }
}

function goHome() {
  const islandId = selectedIslandId.value
  audioService.stopTrack()
  audioService.stopAmbient()
  selectedIslandId.value = null
  selectedMemory.value = null
  showAddModal.value = false
  arrivalMemoryId.value = null
  if (islandId) audioService.playAmbient(islandId)
}

function returnToWelcome() {
  audioService.stopTrack()
  audioService.stopAmbient()
  selectedIslandId.value = null
  selectedMemory.value = null
  showAddModal.value = false
  hasEnteredWorld.value = false
  focusIslandId.value = null
  arrivalMemoryId.value = null
  audioService.playTrack('./audio/forever-you.mp3')
}

function enterWorld(islandId) {
  focusIslandId.value = islandId
  hasEnteredWorld.value = true
  audioService.playAmbient(islandId)
}

function continueFromLetter() {
  hasReadLetter.value = true
  letterStartsOpened.value = false
}

function returnToLetter() {
  audioService.stopTrack()
  audioService.stopAmbient()
  hasEnteredWorld.value = false
  hasReadLetter.value = false
  letterStartsOpened.value = true
}

function returnToLetterStart() {
  audioService.stopTrack()
  audioService.stopAmbient()
  hasEnteredWorld.value = false
  hasReadLetter.value = false
  letterStartsOpened.value = false
}

function toggleMusic() {
  isMusicMuted.value = !isMusicMuted.value
  audioService.setMuted(isMusicMuted.value)
  if (!isMusicMuted.value) audioService.resumeTrack()
}

async function saveNewMemory(payload) {
  saving.value = true
  errorMessage.value = ''
  try {
    const savedMemory = await createMemory(payload)
    allMemories.value = [savedMemory, ...allMemories.value]
    if (selectedIslandId.value === payload.islandId) {
      memories.value = [savedMemory, ...memories.value]
      arrivalMemoryId.value = savedMemory.id
    }
    showAddModal.value = false
  } catch (error) {
    errorMessage.value = error.message || '記憶儲存失敗，請稍後再試。'
  } finally {
    saving.value = false
  }
}

function finishMemoryArrival() {
  arrivalMemoryId.value = null
}

async function removeMemory(memory) {
  if (!window.confirm(`確定要刪除「${memory.title}」這顆記憶球嗎？`)) return

  deleting.value = true
  errorMessage.value = ''
  try {
    await deleteMemory(memory)
    memories.value = memories.value.filter((item) => item.id !== memory.id)
    allMemories.value = allMemories.value.filter((item) => item.id !== memory.id)
    selectedMemory.value = null
  } catch (error) {
    errorMessage.value = error.message || '記憶刪除失敗，請稍後再試。'
  } finally {
    deleting.value = false
  }
}

function replaceIslandMemories(islandId, islandMemories) {
  allMemories.value = [
    ...allMemories.value.filter((memory) => memory.islandId !== islandId),
    ...islandMemories,
  ]
  if (selectedIslandId.value === islandId) memories.value = islandMemories
}

function startMemorySync() {
  if (!supabaseService.isConnected) return

  ISLANDS.forEach((island) => {
    const unsubscribe = subscribeMemories(
      island.id,
      (islandMemories) => replaceIslandMemories(island.id, islandMemories),
      (error) => {
        errorMessage.value = error.message || '無法同步雲端記憶，請檢查 Firebase 設定。'
      },
    )
    if (typeof unsubscribe === 'function') memoryUnsubscribers.push(unsubscribe)
  })
}

onMounted(async () => {
  // Preload a small global count for the landing page without coupling UI to storage.
  try {
    const results = await Promise.all(ISLANDS.map((island) => fetchMemories(island.id)))
    allMemories.value = results.flat()
  } catch (error) {
    errorMessage.value = error.message || '記憶暫時無法載入。'
  }
  startMemorySync()
})

onBeforeUnmount(() => {
  memoryUnsubscribers.splice(0).forEach((unsubscribe) => unsubscribe())
})
</script>

<template>
  <LetterScene v-if="!hasReadLetter" :start-opened="letterStartsOpened" @continue="continueFromLetter" />
  <WelcomeScene v-else-if="!hasEnteredWorld" @enter="enterWorld" @back-to-letter="returnToLetter" @back-to-start="returnToLetterStart" />
  <IslandSelector
    v-else-if="!selectedIsland"
    :total-memories="totalMemories"
    :memories-by-island="memoriesByIsland"
    :focus-island-id="focusIslandId"
    :transitioning="enteringIsland"
    @select="selectIsland"
    @back="returnToWelcome"
  />
  <IslandView
    v-else
    :island="selectedIsland"
    :memories="memories"
    :loading="loading"
    :arrival-memory-id="arrivalMemoryId"
    @back="goHome"
    @add="showAddModal = true"
    @select-memory="selectedMemory = $event"
    @arrival-finished="finishMemoryArrival"
  />

  <button
    class="audio-toggle"
    type="button"
    :aria-label="isMusicMuted ? '開啟音樂' : '關閉音樂'"
    :title="isMusicMuted ? '開啟音樂' : '關閉音樂'"
    @click="toggleMusic"
  >
    <VolumeX v-if="isMusicMuted" :size="19" />
    <Volume2 v-else :size="19" />
    <span>{{ isMusicMuted ? '音樂關閉' : '音樂開啟' }}</span>
  </button>

  <div v-if="errorMessage" class="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-red-500 px-5 py-3 text-xs text-white shadow-lg">
    {{ errorMessage }}
  </div>
  <MemoryModal v-if="selectedMemory" :memory="selectedMemory" :island="getIslandById(selectedMemory.islandId)" :deleting="deleting" @close="selectedMemory = null" @delete="removeMemory(selectedMemory)" />
  <AddMemoryModal v-if="showAddModal" :default-island-id="selectedIslandId || 'golden'" :saving="saving" @close="showAddModal = false" @submit="saveNewMemory" />
</template>
