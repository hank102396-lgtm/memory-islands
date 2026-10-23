import { createMemory } from '../domain/memory'

/**
 * Application boundary: presentation knows only this use case, never Firebase.
 */
export function createFetchMemoriesUseCase(memoryService) {
  return async function fetchMemories(islandId) {
    const memories = await memoryService.fetchMemories(islandId)
    return memories.map((memory) => createMemory(memory))
  }
}

export default createFetchMemoriesUseCase
