<script setup>
import { computed } from 'vue'
import { ISLANDS } from '../../domain/island'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-vue-next'
import goldenArt from '../../assets/islands/golden-amusement.svg'
import blueArt from '../../assets/islands/blue-whale-bay.svg'
import greenArt from '../../assets/islands/green-camping-forest.svg'

const artByIsland = { golden: goldenArt, blue: blueArt, green: greenArt }

const props = defineProps({
  totalMemories: { type: Number, default: 0 },
  memoriesByIsland: { type: Object, default: () => ({}) },
  focusIslandId: { type: String, default: null },
  transitioning: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'back'])
const visibleIslands = computed(() => props.focusIslandId
  ? ISLANDS.filter((island) => island.id === props.focusIslandId)
  : ISLANDS)
</script>

<template>
  <main class="world-scene relative min-h-screen overflow-hidden bg-night px-5 py-8 text-white sm:px-10 lg:px-16" :class="{ 'single-island-scene': focusIslandId, 'island-transitioning': transitioning }">
    <div class="stars stars-one" />
    <div class="stars stars-two" />
    <div class="island-entry-warp" aria-hidden="true">
      <i v-for="index in 14" :key="index" class="island-entry-star" />
    </div>
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center">
      <button class="world-back-button" type="button" @click="emit('back')"><ArrowLeft :size="17" />回到入口</button>
      <header class="relative z-10 mb-12 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur">
          <Sparkles :size="15" class="text-[#ffe589]" />
          我們的共同宇宙
        </div>
        <h1 class="font-display text-5xl tracking-[0.08em] text-[#fff4c7] drop-shadow-[0_0_20px_rgba(255,229,137,0.3)] sm:text-7xl">
          記憶島
        </h1>
        <p class="mt-4 text-sm tracking-[0.28em] text-white/50 sm:text-base">MEMORY ISLANDS</p>
        <p class="mx-auto mt-7 max-w-md text-sm leading-7 text-white/65">每一段回憶，都在我們的心裡漂浮成一座小島。</p>
      </header>

      <section class="memory-world relative z-10 grid gap-7 md:grid-cols-3">
        <button
          v-for="(island, index) in visibleIslands"
          :key="island.id"
          class="floating-island group relative min-h-[320px] text-left transition duration-500 hover:z-20"
          :style="{ '--island-color': island.color, '--island-accent': island.accent, '--float-delay': `${index * -1.6}s` }"
          @click="emit('select', island)"
        >
          <div class="island-aura" />
          <div class="island-platform">
            <img class="island-art" :src="artByIsland[island.id]" :alt="`${island.name}主題插畫`" />
            <div class="island-art-orbs">
              <span
                v-for="(memory, orbIndex) in (memoriesByIsland[island.id] || []).slice(0, 4)"
                :key="memory.id"
                class="preview-orb"
                :style="{
                  '--orb-left': ['24%', '42%', '60%', '34%'][orbIndex],
                  '--orb-top': ['26%', '42%', '22%', '50%'][orbIndex],
                  backgroundImage: `url(${memory.imageUrl})`,
                }"
              />
            </div>
          </div>
          <div class="island-caption">
            <div>
              <p class="mb-1 text-xs tracking-[0.2em]" :style="{ color: island.color }">{{ island.subtitle }}</p>
              <h2 class="font-display text-2xl sm:text-3xl">{{ island.icon }} {{ island.name }}</h2>
              <p class="mt-2 max-w-[230px] text-xs leading-5 text-white/55">{{ island.description }}</p>
            </div>
            <ArrowRight class="translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" :style="{ color: island.color }" />
          </div>
        </button>
      </section>

      <p class="relative z-10 mt-12 text-center text-xs tracking-wider text-white/35">目前收藏了 {{ totalMemories }} 段回憶</p>
    </div>
  </main>
</template>
