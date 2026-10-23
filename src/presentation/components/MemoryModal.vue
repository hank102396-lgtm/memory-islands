<script setup>
import { computed } from 'vue'
import { X, CalendarDays, Trash2, LoaderCircle } from 'lucide-vue-next'

const props = defineProps({
  memory: { type: Object, required: true },
  island: { type: Object, required: true },
  deleting: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'delete'])
const dateText = computed(() => new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(props.memory.createdAt)))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <article class="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#fffdf7] text-ink shadow-2xl">
      <button class="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50" aria-label="關閉" @click="emit('close')"><X :size="19" /></button>
      <div class="h-64 bg-slate-100 sm:h-80">
        <img v-if="memory.imageUrl" :src="memory.imageUrl" :alt="memory.title" class="h-full w-full object-cover" />
        <div v-else class="flex h-full items-center justify-center text-6xl" :style="{ backgroundColor: island.color }">{{ island.icon }}</div>
      </div>
      <div class="p-7 sm:p-9">
        <p class="mb-3 text-xs font-medium tracking-[0.2em]" :style="{ color: island.accent }">{{ island.name }} · MEMORY</p>
        <h2 class="font-display text-3xl leading-tight">{{ memory.title }}</h2>
        <p class="mt-5 whitespace-pre-line text-sm leading-7 text-ink/65">{{ memory.note || '這段記憶，值得被好好收藏。' }}</p>
        <div class="mt-7 flex items-center gap-2 text-xs text-ink/40"><CalendarDays :size="15" />{{ dateText }}</div>
        <button class="delete-memory-button mt-7" type="button" :disabled="deleting" @click="emit('delete')">
          <LoaderCircle v-if="deleting" class="animate-spin" :size="16" />
          <Trash2 v-else :size="16" />
          {{ deleting ? '正在刪除⋯' : '刪除這顆記憶球' }}
        </button>
      </div>
    </article>
  </div>
</template>
