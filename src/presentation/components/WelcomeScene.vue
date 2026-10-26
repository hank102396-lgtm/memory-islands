<script setup>
import { ref } from 'vue'
import { ArrowRight, MailOpen, RotateCcw, Sparkles } from 'lucide-vue-next'
import { audioService } from '../../infrastructure/audioService'

const emit = defineEmits(['enter', 'start-sound', 'back-to-letter', 'back-to-start'])
const entering = ref(false)
const targetIslandId = ref(null)

function enterMemoryWorld(islandId) {
  if (entering.value) return
  audioService.playCuteClick()
  targetIslandId.value = islandId
  entering.value = true
  emit('start-sound', islandId)
  window.setTimeout(() => emit('enter', islandId), 1550)
}
</script>

<template>
  <main class="welcome-scene" :class="{ 'is-entering': entering }">
    <div class="stars stars-one" /><div class="stars stars-two" />
    <div class="welcome-nebula nebula-left" /><div class="welcome-nebula nebula-right" />
    <div class="welcome-sunset-glow" aria-hidden="true" />
    <div class="welcome-landscape" aria-hidden="true">
      <div class="welcome-hill welcome-hill-back" />
      <div class="welcome-hill welcome-hill-front" />
      <div class="welcome-village">
        <span class="welcome-house house-one" /><span class="welcome-house house-two" />
        <span class="welcome-house house-three" /><span class="welcome-house house-four" />
      </div>
      <div class="welcome-river" />
      <div class="welcome-river-light" />
      <div class="welcome-bank welcome-bank-left" /><div class="welcome-bank welcome-bank-right" />
    </div>

    <nav class="welcome-navigation" aria-label="信件導覽">
      <button type="button" @click="emit('back-to-letter')"><MailOpen :size="15" />回到信件</button>
      <button type="button" @click="emit('back-to-start')"><RotateCcw :size="15" />重新開始</button>
    </nav>

    <header class="welcome-copy">
      <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur">
        <Sparkles :size="15" class="text-[#ffe589]" />
        我們的共同宇宙
      </div>
      <h1 class="font-display text-5xl tracking-[0.08em] text-[#fff4c7] sm:text-7xl">記憶島</h1>
      <p class="mt-4 text-sm tracking-[0.28em] text-white/50 sm:text-base">MEMORY ISLANDS</p>
      <p class="mt-6 text-sm text-white/60">有些回憶，要兩個人一起點亮。</p>
    </header>

    <div class="silhouette-gate">
      <span class="gate-line gate-line-left" role="button" tabindex="0" aria-label="進入金色遊樂園島" @click.stop="enterMemoryWorld('golden')" @keydown.enter.stop="enterMemoryWorld('golden')" />
      <span class="gate-line gate-line-center" role="button" tabindex="0" aria-label="進入藍色月亮海灣島" @click.stop="enterMemoryWorld('blue')" @keydown.enter.stop="enterMemoryWorld('blue')" />
      <span class="gate-line gate-line-right" role="button" tabindex="0" aria-label="進入綠色露營森林島" @click.stop="enterMemoryWorld('green')" @keydown.enter.stop="enterMemoryWorld('green')" />
      <span class="line-node node-left" @click.stop="enterMemoryWorld('golden')" /><span class="line-node node-center" @click.stop="enterMemoryWorld('blue')" /><span class="line-node node-right" @click.stop="enterMemoryWorld('green')" />
      <button class="line-destination destination-left destination-golden" type="button" aria-label="進入金色遊樂園島" @click="enterMemoryWorld('golden')">✦</button>
      <button class="line-destination destination-center destination-blue" type="button" aria-label="進入藍色月亮海灣島" @click="enterMemoryWorld('blue')">✦</button>
      <button class="line-destination destination-right destination-green" type="button" aria-label="進入綠色露營森林島" @click="enterMemoryWorld('green')">✦</button>
      <span class="couple-shadow">
        <span class="person person-left"><i class="person-head" /><i class="person-hair" /><i class="person-body" /><i class="person-arm" /></span>
        <span class="person person-right"><i class="person-head" /><i class="person-hair" /><i class="person-body" /><i class="person-arm" /></span>
      </span>
      <span class="gate-prompt"><span>點擊其中一條記憶線</span><ArrowRight :size="16" /></span>
    </div>

    <div class="space-warp" aria-hidden="true">
      <span class="warp-glow" />
      <i v-for="index in 18" :key="index" class="warp-star" />
    </div>

    <div class="welcome-floor-glow" />
    <p class="welcome-hint">一起走進我們的記憶宇宙</p>
  </main>
</template>
