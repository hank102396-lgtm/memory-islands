export function createPlayIslandAudioUseCase(audioService) {
  return function playIslandAudio(islandId) {
    return audioService.playAmbient(islandId)
  }
}

export default createPlayIslandAudioUseCase
