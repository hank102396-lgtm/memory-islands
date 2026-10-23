// Vite bundles every image placed in these three folders as a local memory orb.
const photoModules = import.meta.glob('../assets/memories/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const islandIds = ['golden', 'blue', 'green']

export const localMemories = Object.entries(photoModules)
  .map(([path, imageUrl], index) => {
    const islandId = islandIds.find((id) => path.includes(`/memories/${id}/`) || path.includes(`\\memories\\${id}\\`))
    if (!islandId) return null

    return {
      id: `local-${islandId}-${index}`,
      islandId,
      title: '島上的一張照片',
      note: '這是一段放進記憶島的日常。你可以在雲端模式中建立更完整的標題與留言。',
      imageUrl,
      x: 22 + ((index * 31) % 62),
      y: 25 + ((index * 19) % 48),
      createdAt: new Date(),
    }
  })
  .filter(Boolean)
