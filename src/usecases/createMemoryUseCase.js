import { createMemory } from '../domain/memory'

/**
 * Uploads the asset first, then persists a domain object with the resulting URL.
 */
export function createCreateMemoryUseCase(memoryService) {
  return async function createNewMemory({ islandId, title, note, file }) {
    if (!file) throw new Error('請選擇一張照片。')
    if (!title?.trim()) throw new Error('請為這段記憶寫一個標題。')

    const uploadedImage = await memoryService.uploadImage(file)
    const imageUrl = uploadedImage.url ?? uploadedImage
    const imagePath = uploadedImage.path ?? ''
    const memory = createMemory({
      islandId,
      title,
      note,
      imageUrl,
      imagePath,
      x: 18 + Math.random() * 68,
      y: 22 + Math.random() * 52,
      createdAt: new Date(),
    })

    return memoryService.saveMemory(memory)
  }
}

export default createCreateMemoryUseCase
