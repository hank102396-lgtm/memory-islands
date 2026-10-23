const AudioContextClass = window.AudioContext || window.webkitAudioContext

let audioContext
let activeScene = null
let muted = false
const MASTER_VOLUME = 0.92

function getContext() {
  if (!AudioContextClass) return null
  audioContext ??= new AudioContextClass()
  return audioContext
}

function createNoiseBuffer(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1
  return buffer
}

function makeSoundBus(context) {
  const bus = context.createGain()
  bus.gain.value = muted ? 0 : MASTER_VOLUME
  bus.connect(context.destination)
  return bus
}

function playTone(context, bus, frequency, duration = .35, type = 'sine', volume = .08) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + .025)
  gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration)
  oscillator.connect(gain).connect(bus)
  oscillator.start()
  oscillator.stop(context.currentTime + duration + .04)
}

function playPianoTone(context, bus, frequency, duration = 1.2, volume = .12) {
  const voice = context.createGain()
  const partials = [
    { ratio: 1, level: 1, type: 'triangle' },
    { ratio: 2, level: .24, type: 'sine' },
    { ratio: 3, level: .1, type: 'sine' },
    { ratio: 4, level: .045, type: 'sine' },
  ]

  voice.gain.setValueAtTime(.0001, context.currentTime)
  voice.gain.exponentialRampToValueAtTime(volume, context.currentTime + .018)
  voice.gain.exponentialRampToValueAtTime(volume * .42, context.currentTime + .32)
  voice.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration)
  voice.connect(bus)

  partials.forEach(({ ratio, level, type }) => {
    const oscillator = context.createOscillator()
    const partialGain = context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency * ratio
    partialGain.gain.value = level
    oscillator.connect(partialGain).connect(voice)
    oscillator.start()
    oscillator.stop(context.currentTime + duration + .08)
  })
}

function createFilteredNoise(context, bus, { frequency, type, volume, lfoFrequency }) {
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  const lfo = context.createOscillator()
  const lfoGain = context.createGain()
  source.buffer = createNoiseBuffer(context)
  source.loop = true
  filter.type = type
  filter.frequency.value = frequency
  gain.gain.value = volume
  lfo.frequency.value = lfoFrequency
  lfoGain.gain.value = volume * .7
  lfo.connect(lfoGain).connect(gain.gain)
  source.connect(filter).connect(gain).connect(bus)
  source.start()
  lfo.start()
  return [source, filter, gain, lfo, lfoGain]
}

function stopActiveScene() {
  if (!activeScene) return
  activeScene.timers.forEach((timer) => window.clearInterval(timer))
  activeScene.nodes.forEach((node) => {
    try { node.stop?.() } catch { /* already stopped */ }
    try { node.disconnect?.() } catch { /* already disconnected */ }
  })
  try { activeScene.bus.disconnect() } catch { /* already disconnected */ }
  activeScene = null
}

export const audioService = {
  async playAmbient(islandId) {
    const context = getContext()
    if (!context) return
    await context.resume()
    stopActiveScene()
    const bus = makeSoundBus(context)
    const scene = { bus, nodes: [], timers: [] }
    activeScene = scene

    if (islandId === 'letter') {
      const notes = [262, 330, 392, 523, 392, 330]
      let noteIndex = 0
      const playLetterNote = () => playPianoTone(context, bus, notes[noteIndex++ % notes.length], 1.05, .14)
      playLetterNote()
      scene.timers.push(window.setInterval(playLetterNote, 1250))
    } else if (islandId === 'welcome') {
      const notes = [262, 330, 392, 523, 494, 392]
      let noteIndex = 0
      const playWelcomeNote = () => playPianoTone(context, bus, notes[noteIndex++ % notes.length], 1.25, .12)
      playWelcomeNote()
      scene.timers.push(window.setInterval(playWelcomeNote, 1450))
    } else if (islandId === 'blue') {
      const notes = [330, 392, 494, 659, 587, 494, 392]
      let noteIndex = 0
      const playOceanPianoNote = () => playPianoTone(context, bus, notes[noteIndex++ % notes.length], 1.15, .13)
      playOceanPianoNote()
      scene.timers.push(window.setInterval(playOceanPianoNote, 1350))
    } else if (islandId === 'green') {
      const notes = [392, 494, 587, 784, 698, 587, 494]
      let noteIndex = 0
      const playForestPianoNote = () => playPianoTone(context, bus, notes[noteIndex++ % notes.length], 1.05, .13)
      playForestPianoNote()
      scene.timers.push(window.setInterval(playForestPianoNote, 1250))
    } else {
      const notes = [523, 659, 784, 1047, 988, 784, 659, 880]
      let noteIndex = 0
      const playParkNote = () => playPianoTone(context, bus, notes[noteIndex++ % notes.length], .5, .14)
      playParkNote()
      scene.timers.push(window.setInterval(playParkNote, 590))
    }
  },

  stopAmbient() {
    stopActiveScene()
  },

  setMuted(nextMuted) {
    muted = nextMuted
    if (activeScene) activeScene.bus.gain.value = muted ? 0 : MASTER_VOLUME
  },

  get muted() { return muted },
}

export default audioService
