/** Application boundary for removing one memory from the island. */
export function createDeleteMemoryUseCase(memoryService) {
  return async function deleteMemory(memory) {
    if (!memory?.id) throw new Error('找不到要刪除的記憶。')
    await memoryService.deleteMemory(memory)
    return memory.id
  }
}

export default createDeleteMemoryUseCase
