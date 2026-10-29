import { createClient } from '@supabase/supabase-js'
import { localMemories } from './localPhotoService'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null
const imageBucket = 'memory-images'

const demoMemories = [
  {
    id: 'demo-sunrise',
    islandId: 'golden',
    title: 'A quiet sunrise',
    note: 'A small demo memory for the golden island.',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85',
    imagePath: '',
    x: 33,
    y: 35,
    createdAt: new Date('2024-01-07'),
  },
  {
    id: 'demo-noodle',
    islandId: 'green',
    title: 'A shared meal',
    note: 'A small demo memory for the green island.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85',
    imagePath: '',
    x: 68,
    y: 55,
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'demo-letter',
    islandId: 'blue',
    title: 'A letter under the stars',
    note: 'A small demo memory for the blue island.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85',
    imagePath: '',
    x: 48,
    y: 29,
    createdAt: new Date('2024-05-21'),
  },
]

function localStorageKey() {
  return 'memory-islands-demo-memories'
}

function deletedMemoriesKey() {
  return 'memory-islands-deleted-memories'
}

function getDeletedMemoryIds() {
  try {
    return JSON.parse(localStorage.getItem(deletedMemoriesKey()) ?? '[]')
  } catch {
    return []
  }
}

function markMemoryDeleted(memoryId) {
  localStorage.setItem(deletedMemoriesKey(), JSON.stringify([...new Set([...getDeletedMemoryIds(), memoryId])]))
}

function getDemoMemories() {
  const deletedIds = getDeletedMemoryIds()
  try {
    const stored = JSON.parse(localStorage.getItem(localStorageKey()) ?? 'null')
    return [...localMemories, ...(stored ?? demoMemories)].filter((memory) => !deletedIds.includes(memory.id))
  } catch {
    return [...localMemories, ...demoMemories].filter((memory) => !deletedIds.includes(memory.id))
  }
}

function saveDemoMemories(memories) {
  localStorage.setItem(localStorageKey(), JSON.stringify(memories))
}

function fromRow(row) {
  return {
    id: row.id,
    islandId: row.island_id,
    title: row.title,
    note: row.note ?? '',
    imageUrl: row.image_url ?? '',
    imagePath: row.image_path ?? '',
    x: row.x,
    y: row.y,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }
}

function toRow(memory) {
  return {
    island_id: memory.islandId,
    title: memory.title,
    note: memory.note,
    image_url: memory.imageUrl,
    image_path: memory.imagePath ?? '',
    x: memory.x,
    y: memory.y,
  }
}

function mergeMemories(islandId, cloudMemories) {
  const deletedIds = getDeletedMemoryIds()
  return [
    ...localMemories.filter((memory) => memory.islandId === islandId && !deletedIds.includes(memory.id)),
    ...cloudMemories.filter((memory) => !deletedIds.includes(memory.id)),
  ]
}

async function uploadToSupabase(file) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(imageBucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(imageBucket).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export const supabaseService = {
  isConnected: hasSupabaseConfig,

  async fetchMemories(islandId) {
    if (!supabase) return getDemoMemories().filter((memory) => memory.islandId === islandId)

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('island_id', islandId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return mergeMemories(islandId, data.map(fromRow))
  },

  subscribeMemories(islandId, onChange, onError) {
    if (!supabase) {
      onChange(getDemoMemories().filter((memory) => memory.islandId === islandId))
      return () => {}
    }

    const channel = supabase
      .channel(`memories-${islandId}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories', filter: `island_id=eq.${islandId}` },
        () => {
          this.fetchMemories(islandId).then(onChange).catch(onError)
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          onError?.(new Error('Supabase 即時同步連線失敗。'))
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  },

  async uploadImage(file) {
    if (supabase) return uploadToSupabase(file)

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ url: reader.result, path: '' })
      reader.onerror = () => reject(new Error('無法讀取圖片檔案。'))
      reader.readAsDataURL(file)
    })
  },

  async saveMemory(memory) {
    if (!supabase) {
      const memories = getDemoMemories()
      const savedMemory = { ...memory, id: crypto.randomUUID() }
      saveDemoMemories([savedMemory, ...memories])
      return savedMemory
    }

    const { data, error } = await supabase.from('memories').insert(toRow(memory)).select().single()
    if (error) throw error
    return fromRow(data)
  },

  async deleteMemory(memory) {
    if (!supabase || memory.id.startsWith('local-') || memory.id.startsWith('demo-')) {
      markMemoryDeleted(memory.id)
      return
    }

    const { error } = await supabase.from('memories').delete().eq('id', memory.id)
    if (error) throw error
    if (memory.imagePath) {
      await supabase.storage.from(imageBucket).remove([memory.imagePath])
    }
  },
}

export default supabaseService
