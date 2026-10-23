<script setup>
import { ref, computed, watch } from 'vue'
import { X, ImagePlus, LoaderCircle } from 'lucide-vue-next'
import { ISLANDS } from '../../domain/island'

const props = defineProps({
  defaultIslandId: { type: String, default: 'golden' },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'submit'])
const islandId = ref(props.defaultIslandId)
const title = ref('')
const note = ref('')
const file = ref(null)
const previewUrl = ref('')

watch(() => props.defaultIslandId, (value) => { islandId.value = value })
const canSubmit = computed(() => Boolean(file.value && title.value.trim() && !props.saving))

function onFileChange(event) {
  const selectedFile = event.target.files?.[0]
  if (!selectedFile) return
  file.value = selectedFile
  previewUrl.value = URL.createObjectURL(selectedFile)
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', { islandId: islandId.value, title: title.value, note: note.value, file: file.value })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section class="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-[#fffdf7] p-6 text-ink shadow-2xl sm:p-9">
      <button class="absolute right-5 top-5 rounded-full p-2 text-ink/45 transition hover:bg-ink/5 hover:text-ink" aria-label="關閉" @click="emit('close')"><X :size="20" /></button>
      <p class="text-xs tracking-[0.2em] text-[#d8923d]">ADD A MEMORY</p>
      <h2 class="mt-2 font-display text-3xl">投放一顆新記憶</h2>
      <p class="mt-2 text-sm text-ink/50">讓今天的我們，成為明天想念的光。</p>

      <form class="mt-7 space-y-5" @submit.prevent="submit">
        <label class="block text-sm font-medium">放進哪座島？
          <select v-model="islandId" class="form-input mt-2">
            <option v-for="island in ISLANDS" :key="island.id" :value="island.id">{{ island.icon }} {{ island.name }} · {{ island.subtitle }}</option>
          </select>
        </label>
        <label class="block text-sm font-medium">照片
          <div class="relative mt-2 flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/15 bg-ink/[0.03] transition hover:border-[#d8923d]/60">
            <img v-if="previewUrl" :src="previewUrl" alt="照片預覽" class="h-full w-full object-cover" />
            <div v-else class="text-center text-ink/40"><ImagePlus class="mx-auto mb-2" :size="28" /><span class="text-xs">點此選擇照片</span></div>
            <input class="absolute inset-0 cursor-pointer opacity-0" type="file" accept="image/*" required @change="onFileChange" />
          </div>
        </label>
        <label class="block text-sm font-medium">標題
          <input v-model="title" class="form-input mt-2" maxlength="60" placeholder="例如：海邊的風很溫柔" required />
        </label>
        <label class="block text-sm font-medium">留言 <span class="font-normal text-ink/35">（選填）</span>
          <textarea v-model="note" class="form-input mt-2 min-h-24 resize-none" maxlength="300" placeholder="寫下當時的心情⋯⋯" />
        </label>
        <button class="primary-button w-full" type="submit" :disabled="!canSubmit">
          <LoaderCircle v-if="saving" class="animate-spin" :size="18" />
          {{ saving ? '正在安放記憶⋯' : '投放記憶球' }}
        </button>
      </form>
    </section>
  </div>
</template>
