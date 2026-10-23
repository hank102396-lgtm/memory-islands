export const ISLANDS = Object.freeze([
  {
    id: 'golden',
    name: '金色島',
    subtitle: '快樂・核心',
    description: '收藏那些讓我們心裡亮起來的時刻。',
    color: '#ffd86b',
    accent: '#ffae45',
    sky: 'from-amber-100/30 via-orange-100/10 to-transparent',
    icon: '☀',
  },
  {
    id: 'blue',
    name: '藍色島',
    subtitle: '感性・深層',
    description: '把溫柔的對話和深深的感受留在這裡。',
    color: '#8bd4ff',
    accent: '#5f83ff',
    sky: 'from-sky-100/30 via-blue-100/10 to-transparent',
    icon: '☾',
  },
  {
    id: 'green',
    name: '綠色島',
    subtitle: '日常・趣味',
    description: '記下我們平凡卻可愛的日常冒險。',
    color: '#a9e89b',
    accent: '#61b875',
    sky: 'from-emerald-100/30 via-green-100/10 to-transparent',
    icon: '✿',
  },
])

export function getIslandById(islandId) {
  return ISLANDS.find((island) => island.id === islandId) ?? ISLANDS[0]
}
