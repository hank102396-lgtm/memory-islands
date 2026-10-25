<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, Plus, Heart, LoaderCircle } from 'lucide-vue-next'
import goldenArt from '../../assets/islands/golden-amusement.svg'
import blueArt from '../../assets/islands/blue-whale-bay.svg'
import greenArt from '../../assets/islands/green-camping-forest.svg'

const artByIsland = { golden: goldenArt, blue: blueArt, green: greenArt }

const props = defineProps({
  island: { type: Object, required: true },
  memories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  arrivalMemoryId: { type: String, default: null },
})

const emit = defineEmits(['back', 'select-memory', 'add', 'arrival-finished'])
const islandStyle = computed(() => ({ '--island-color': props.island.color, '--island-accent': props.island.accent }))
const islandArt = computed(() => artByIsland[props.island.id])
const arrivingMemory = computed(() => props.memories.find((memory) => memory.id === props.arrivalMemoryId))
const arrivalStars = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 101}%`,
  top: `${(index * 61) % 101}%`,
  delay: `${(index % 8) * 70}ms`,
  scale: 1 + (index % 3) * 0.45,
}))
const activeCreature = ref(null)
let creatureMessageTimer

const interactiveCreatures = {
  blue: [
    { id: 'turtle', emoji: '🐢', name: '海龜', message: '你不知道要付 30 萬才可以摸嗎？' },
    { id: 'whale', emoji: '🐳', name: '暖鯨魚', message: '噓，小聲一點，我正在唱海底情歌。' },
    { id: 'fish', emoji: '🐠', name: '小魚', message: '今天的海流，很適合去約會！' },
    { id: 'jellyfish', emoji: '🪼', name: '水母', message: '我沒有帶傘，但我會發光。' },
  ],
  green: [
    { id: 'deer', emoji: '🦌', name: '小鹿', message: '你知道我為什麼一直看著你嗎？因為我對你鹿有獨鍾。' },
    { id: 'rabbit', emoji: '🐰', name: '兔兔', message: '你是不是偷走我的胡蘿蔔？不然我怎麼會一直對你心動。' },
    { id: 'squirrel', emoji: '🐿️', name: '松鼠', message: '我不是松鼠，但我想把你收藏一輩子。' },
    { id: 'owl', emoji: '🦉', name: '貓頭鷹', message: '你是我的晚安，也是我每天最期待的早安。' },
  ],
  golden: [
    { id: 'bear', emoji: '🧸', name: '小熊', message: '你是我的旋轉木馬，想到你，我的心就一直轉圈圈。' },
    { id: 'chick', emoji: '🐥', name: '小雞', message: '你一出現，我的心情就像煙火一樣，砰砰砰！' },
    { id: 'cat', emoji: '🐱', name: '貓咪', message: '你就是我的頭獎，遇見你是我人生最幸運的事。' },
    { id: 'panda', emoji: '🐼', name: '熊貓', message: '我不是遊樂園，但我願意讓你每天都開心。' },
  ],
}
const visibleCreatures = computed(() => interactiveCreatures[props.island.id] ?? [])

function greetCreature(creature) {
  activeCreature.value = creature
  window.clearTimeout(creatureMessageTimer)
  creatureMessageTimer = window.setTimeout(() => { activeCreature.value = null }, 4200)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="memory-arrival-layer">
      <div
        v-if="arrivingMemory"
        :key="arrivingMemory.id"
        class="memory-arrival-screen"
        :style="islandStyle"
        aria-hidden="true"
        @animationend.self="emit('arrival-finished')"
      >
        <div class="memory-arrival-vortex" />
        <div class="memory-arrival-rays">
          <span v-for="ray in 14" :key="ray" :style="{ '--ray-angle': `${ray * 25.7}deg`, '--ray-delay': `${ray * 35}ms` }" />
        </div>
        <div class="memory-arrival-stars">
          <span
            v-for="star in arrivalStars"
            :key="star.id"
            class="memory-arrival-star"
            :style="{ left: star.left, top: star.top, '--star-delay': star.delay, '--star-scale': star.scale }"
          />
        </div>
        <div class="memory-arrival-projectile">
          <div class="memory-arrival-burst">
            <span v-for="burst in 16" :key="burst" :style="{ '--burst-angle': `${burst * 22.5}deg`, '--burst-delay': `${burst * 28}ms` }" />
          </div>
          <span class="memory-arrival-trail" />
          <span class="memory-arrival-orb" :style="{ borderColor: island.color }">
            <img v-if="arrivingMemory.imageUrl" :src="arrivingMemory.imageUrl" alt="" />
            <Heart v-else :size="42" :style="{ color: island.color }" />
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
  <main class="min-h-screen overflow-hidden bg-night text-white" :style="islandStyle">
    <div class="island-space relative min-h-screen px-5 py-7 sm:px-10 lg:px-16">
      <header class="relative z-20 mx-auto flex max-w-6xl items-center justify-between">
        <button class="round-button" aria-label="返回島嶼選擇" @click="emit('back')"><ArrowLeft :size="20" /></button>
        <div class="text-center">
          <p class="text-xs tracking-[0.25em]" :style="{ color: island.color }">{{ island.subtitle }}</p>
          <h1 class="mt-1 font-display text-3xl sm:text-4xl">{{ island.name }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <button class="round-button" aria-label="新增記憶" @click="emit('add')"><Plus :size="21" /></button>
        </div>
      </header>

      <div class="mx-auto mt-7 max-w-6xl text-center">
        <p class="text-sm text-white/55">{{ island.description }}</p>
      </div>

      <section class="island-stage relative mx-auto mt-5 max-w-5xl" aria-label="記憶球展示區">
        <div class="cloud cloud-one" /><div class="cloud cloud-two" />
        <div class="island-view-halo" />
        <div class="island-view-ring ring-one" /><div class="island-view-ring ring-two" />
        <img class="island-view-art" :src="islandArt" :alt="`${island.name}場景`" />
        <div v-if="visibleCreatures.length" class="sea-creature-layer" :class="`${island.id}-creature-layer`" aria-label="可互動的場景動物">
          <button
            v-for="creature in visibleCreatures"
            :key="creature.id"
            class="sea-creature"
            :class="`creature-${creature.id}`"
            type="button"
            :aria-label="`和${creature.name}互動`"
            @click="greetCreature(creature)"
          >
            <span class="creature-bubble"><span>{{ creature.emoji }}</span></span>
            <small>{{ creature.name }}</small>
          </button>
        </div>
        <Transition name="creature-message">
          <div v-if="activeCreature" class="creature-message">
            <span class="message-tail" />
            <span class="message-emoji">{{ activeCreature.emoji }}</span>
            <span><strong>{{ activeCreature.name }}</strong>：{{ activeCreature.message }}</span>
            <button type="button" aria-label="關閉訊息" @click="activeCreature = null">×</button>
          </div>
        </Transition>
        <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center text-white/60">
          <LoaderCircle class="animate-spin" :size="24" />
        </div>
        <button
          v-for="memory in memories"
          :key="memory.id"
          class="memory-orb group absolute z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 sm:h-20 sm:w-20"
          :class="{ 'memory-orb-arriving': memory.id === arrivalMemoryId }"
          :style="{ left: `${memory.x}%`, top: `${memory.y}%`, borderColor: island.color }"
          :title="memory.title"
          @click="emit('select-memory', memory)"
        >
          <img v-if="memory.imageUrl" :src="memory.imageUrl" :alt="memory.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-125" />
          <Heart v-else :size="22" :style="{ color: island.color }" />
          <span class="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
        </button>
        <div v-if="!loading && memories.length === 0" class="absolute inset-x-0 top-1/2 text-center text-sm text-white/45">
          這座島還在等待第一顆記憶球⋯⋯
        </div>
      </section>

      <footer class="relative z-20 mx-auto flex max-w-6xl items-center justify-center gap-2 text-xs text-white/40">
        <Heart :size="13" :style="{ color: island.color }" fill="currentColor" />
        點擊記憶球，重新打開一段時光
      </footer>
    </div>
  </main>
</template>
