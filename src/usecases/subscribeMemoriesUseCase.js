import { createMemory } from '../domain/memory'

export function createSubscribeMemoriesUseCase(memoryService) {
  return function subscribeMemories(islandId, onChange, onError) {
    return memoryService.subscribeMemories(
      islandId,
      (memories) => onChange(memories.map((memory) => createMemory(memory))),
      onError,
    )
  }
}

export default createSubscribeMemoriesUseCase
