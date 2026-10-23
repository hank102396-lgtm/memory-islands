<script setup>
import { ref } from 'vue'
import { ArrowRight, Feather, LockKeyhole, Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['continue'])
const opened = ref(false)
const leaving = ref(false)

function openLetter() {
  opened.value = true
}

function continueToMemory() {
  if (leaving.value) return
  leaving.value = true
  window.setTimeout(() => emit('continue'), 1500)
}
</script>

<template>
  <main class="letter-scene" :class="{ 'letter-is-leaving': leaving }">
    <div class="stars stars-one" /><div class="stars stars-two" />
    <div class="letter-haze haze-one" /><div class="letter-haze haze-two" />

    <header class="letter-heading">
      <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur">
        <Sparkles :size="15" class="text-[#ffe589]" />
        在故事開始以前
      </div>
      <p class="text-xs tracking-[0.3em] text-white/45">A LETTER FOR YOU</p>
      <button class="letter-sound-button" type="button" :class="{ active: soundEnabled }" @click="enableSound">
        <Volume2 :size="15" />{{ soundEnabled ? '背景音樂播放中' : '開啟背景音樂' }}
      </button>
    </header>

    <section class="letter-stage" :class="{ 'letter-is-open': opened }">
      <button class="envelope-wrap" type="button" aria-label="拆開給彥彤的信" @click="openLetter">
        <span class="envelope-glow" />
        <span class="envelope">
          <span class="envelope-paper"><span>給彥彤的信</span><small>To Yantong</small></span>
          <span class="envelope-back" />
          <span class="envelope-flap" />
          <span class="envelope-fold envelope-fold-left" /><span class="envelope-fold envelope-fold-right" />
          <span class="wax-seal"><LockKeyhole :size="17" /></span>
        </span>
        <span class="envelope-label"><Feather :size="15" />點一下，拆開這封信</span>
      </button>

      <Transition name="letter-reveal">
        <article v-if="opened" class="letter-content">
          <div class="letter-content-top"><span>MEMORY ISLANDS</span><span>2026 · 01</span></div>
          <h1>給彥彤：</h1>
          <!-- TODO: 將這裡替換成使用者之後提供的正式信件內容。 -->
          <p>這是一封還沒有寫完的信，先把它放在這裡，等我們一起把想說的話補上。</p>
          <p>等你讀完，我們再一起走進記憶島，把那些想收藏的時刻，一顆一顆放進去。</p>
          <p>謝謝你，讓平凡的日子也有了值得記住的光。</p>
          <div class="letter-signature">一直記得你的人<br /><span>✦</span></div>
          <button class="letter-continue" type="button" :disabled="leaving" @click="continueToMemory">{{ leaving ? '正在前往記憶島⋯' : '讀完了，進入記憶島' }} <ArrowRight :size="17" /></button>
        </article>
      </Transition>
    </section>

    <div class="letter-warp" aria-hidden="true">
      <span class="letter-warp-glow" />
      <i v-for="index in 20" :key="index" class="letter-warp-star" />
    </div>

    <p class="letter-footer">一封信，是通往共同記憶的第一道門</p>
  </main>
</template>
