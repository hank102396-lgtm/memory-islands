<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, Feather, LockKeyhole, Sparkles } from 'lucide-vue-next'
import { audioService } from '../../infrastructure/audioService'

const emit = defineEmits(['continue'])
const opened = ref(false)
const leaving = ref(false)
let islandMusicPreloadTimer

onMounted(() => {
  audioService.prepareTrack('./audio/forever-you.mp3')
  islandMusicPreloadTimer = window.setTimeout(() => {
    audioService.prepareTrack('./audio/green-island.mp3')
    audioService.prepareTrack('./audio/golden-island.mp3')
    audioService.prepareTrack('./audio/blue-island.mp3')
  }, 3500)
})

onBeforeUnmount(() => window.clearTimeout(islandMusicPreloadTimer))

function openLetter() {
  audioService.playCuteClick()
  audioService.playAmbient('letter')
  opened.value = true
}

function continueToMemory() {
  if (leaving.value) return
  audioService.playCuteClick()
  leaving.value = true
  window.setTimeout(() => emit('continue'), 1500)
}
</script>

<template>
  <main class="letter-scene" :class="{ 'letter-is-leaving': leaving, 'letter-has-opened': opened }">
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
          <div class="letter-paper-inner">
          <div class="letter-content-top"><span>MEMORY ISLANDS</span><span>2026 · 12· 31</span></div>
          <h1>給彤彤：</h1>
          <p>先跟你說我為了做這個網站可是違反我生理時鐘然後思念你的每個晚上做出來的喔 希望你會喜歡。</p>
          <p>今天我想跟這首《Forever You》一樣對你展現真摯的情感與愛 也是有一些私心最喜歡門童這首歌拉哈哈</p>
          <p>好啦 時間過得真快我們已經在一起六年多拉 但我愛你的那份感覺還是跟第一天在一起一樣那麼的熱烈 真的是愛慘了
          最近也是我們分開最長的一段時間 我很想你喔 我也發現原來你不在的家可以如此的安靜 我總是聽你的話聽到睡著 
          不是因為覺得無聊 而是覺得你的聲音讓我感到安心 也讓我很想念 我也漸漸學習自己一個人的生活 因為我知道我們兩個都在朝著更好的自己前進成長
          雖然不習慣不舒服但我知道這是成長的過程 讓我們繼續互相支持加油 一起牽手走下去吧胖胖</p>
        <p>這幾年我們一起去過了好多的地方 未來也希望可以跟你一起去更多的地方 可以的話就帶上Taki (減肥成功的話哈哈)</p>
        <p>你也嘗試了好多工作與很多新的挑戰 雖然結果可能會不如預期 但你要知道我在你身後當你的靠山 當覺得困難或是心理不舒服的時候可以跟我說
        我很願意聆聽 你也知道我愛聽你說話的 我也都在你身邊陪伴你 當你覺得累了的時候不用硬撐我在喔 </p>
         <p>這次我做的網站的靈感是覺得我們有很多很美麗的回憶 有開心的 有難過的 有獨一無二的 有刻骨銘心的 我希望可以藉由這個網站收藏起來
         像一個快速可以打開看的回憶錄 用圖片與文字記錄著我們的回憶   </p>
          
          <p>那我們一起走進記憶島，把那些想收藏的時刻，一顆一顆放進去。</p>
          <p>謝謝你，讓平凡的日子也有了值得記住的光。</p>
          <div class="letter-signature">一直記得你愛你的人<br /><span>✦</span></div>
          <button class="letter-continue" type="button" :disabled="leaving" @click="continueToMemory">{{ leaving ? '正在前往記憶島⋯' : '讀完了，進入記憶島' }} <ArrowRight :size="17" /></button>
          </div>
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
