export function createMemory({
  id,
  islandId,
  title,
  note = '',
  imageUrl = '',
  x = 50,
  y = 50,
  createdAt = new Date(),
}) {
  if (!islandId || !title?.trim()) {
    throw new Error('記憶需要所屬島嶼與標題。')
  }

  return {
    id: id ?? crypto.randomUUID(),
    islandId,
    title: title.trim(),
    note: note.trim(),
    imageUrl,
    x: Math.min(86, Math.max(14, Number(x))),
    y: Math.min(76, Math.max(18, Number(y))),
    createdAt: normalizeDate(createdAt),
  }
}

export function normalizeDate(value) {
  if (value?.toDate) return value.toDate()
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}
