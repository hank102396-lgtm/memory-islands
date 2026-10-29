import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  query,
  serverTimestamp,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { localMemories } from './localPhotoService'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)
const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null
const auth = firebaseApp ? getAuth(firebaseApp) : null
const firestore = firebaseApp ? getFirestore(firebaseApp) : null
const storage = firebaseApp ? getStorage(firebaseApp) : null
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const hasCloudinaryConfig = Boolean(cloudinaryCloudName && cloudinaryUploadPreset)
let authenticationPromise

const demoMemories = [
  {
    id: 'demo-sunrise',
    islandId: 'golden',
    title: '一起看過的第一場日出',
    note: '那天的天空像一顆慢慢融化的橘子糖。',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85',
    x: 33,
    y: 35,
    createdAt: new Date('2024-01-07'),
  },
  {
    id: 'demo-noodle',
    islandId: 'green',
    title: '半夜偷吃泡麵',
    note: '明明說好只吃一口，最後變成兩個人的宵夜。',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85',
    x: 68,
    y: 55,
    createdAt: new Date('2024-03-16'),
  },
  {
    id: 'demo-letter',
    islandId: 'blue',
    title: '雨天裡的一封信',
    note: '謝謝你總是願意聽我把小事說得很久。',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85',
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

async function ensureAuthenticated() {
  if (!auth) return null
  if (auth.currentUser) return auth.currentUser
  authenticationPromise ??= signInAnonymously(auth).then(({ user }) => user)
  return authenticationPromise
}

function getCloudMemories(snapshot) {
  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .sort((left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt))
}

function mergeMemories(islandId, cloudMemories) {
  const deletedIds = getDeletedMemoryIds()
  return [
    ...localMemories.filter((memory) => memory.islandId === islandId && !deletedIds.includes(memory.id)),
    ...cloudMemories,
  ]
}

async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', cloudinaryUploadPreset)
  formData.append('folder', 'memory-islands')

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error?.message || '圖片上傳失敗。')
  return result.secure_url || result.url
}

export const firebaseService = {
  isConnected: hasFirebaseConfig,

  async fetchMemories(islandId) {
    if (!firestore) return getDemoMemories().filter((memory) => memory.islandId === islandId)

    await ensureAuthenticated()
    // Sort in memory so a fresh Firebase project does not require a composite index.
    const memoriesQuery = query(collection(firestore, 'memories'), where('islandId', '==', islandId))
    const snapshot = await getDocs(memoriesQuery)
    return mergeMemories(islandId, getCloudMemories(snapshot))
  },

  subscribeMemories(islandId, onChange, onError) {
    if (!firestore) {
      onChange(getDemoMemories().filter((memory) => memory.islandId === islandId))
      return () => {}
    }

    let disposed = false
    let unsubscribe = () => {}
    const memoriesQuery = query(collection(firestore, 'memories'), where('islandId', '==', islandId))

    ensureAuthenticated()
      .then(() => {
        if (disposed) return
        unsubscribe = onSnapshot(
          memoriesQuery,
          (snapshot) => onChange(mergeMemories(islandId, getCloudMemories(snapshot))),
          onError,
        )
      })
      .catch(onError)

    return () => {
      disposed = true
      unsubscribe()
    }
  },

  async uploadImage(file) {
    if (hasCloudinaryConfig) return uploadToCloudinary(file)
    if (firestore) throw new Error('尚未設定 Cloudinary 圖片儲存，請確認 GitHub Secrets。')

    if (!storage) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('照片讀取失敗，請換一張照片再試。'))
        reader.readAsDataURL(file)
      })
    }

    await ensureAuthenticated()
    const path = `memories/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const imageRef = ref(storage, path)
    const snapshot = await uploadBytes(imageRef, file)
    return getDownloadURL(snapshot.ref)
  },

  async saveMemory(memory) {
    if (!firestore) {
      const memories = getDemoMemories()
      const savedMemory = { ...memory, id: crypto.randomUUID() }
      saveDemoMemories([savedMemory, ...memories])
      return savedMemory
    }

    await ensureAuthenticated()
    const document = await addDoc(collection(firestore, 'memories'), {
      ...memory,
      createdAt: serverTimestamp(),
    })
    return { ...memory, id: document.id }
  },

  async deleteMemory(memory) {
    if (!firestore || memory.id.startsWith('local-') || memory.id.startsWith('demo-')) {
      markMemoryDeleted(memory.id)
      return
    }

    await ensureAuthenticated()
    await deleteDoc(doc(firestore, 'memories', memory.id))
  },
}

function toTimestamp(value) {
  if (value?.toMillis) return value.toMillis()
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export default firebaseService
