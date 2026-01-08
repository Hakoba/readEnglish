import type { StorageSchema, WordEntry, AppSettings } from '@/types/words'

const DEFAULT_SETTINGS: AppSettings = {
  parsingMode: 'visible',
  autoAnalysis: true,
  containerPosition: 'bottom-left',
}

const DEFAULT_STORAGE: StorageSchema = {
  dictionary: [],
  settings: DEFAULT_SETTINGS,
}

/**
 * Обертка над chrome.storage.sync для удобной работы с типизированными данными.
 */
export async function getStorageData<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
  const result = await chrome.storage.sync.get(key)
  return (result[key] as StorageSchema[K]) || DEFAULT_STORAGE[key]
}

export async function setStorageData<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
  await chrome.storage.sync.set({ [key]: value })
}

/**
 * Работа со словарем
 */
export async function getDictionary(): Promise<WordEntry[]> {
  return getStorageData('dictionary')
}

export async function saveWord(word: Omit<WordEntry, 'id' | 'createdAt'>): Promise<WordEntry> {
  const dictionary = await getDictionary()
  const newEntry: WordEntry = {
    ...word,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  
  dictionary.push(newEntry)
  await setStorageData('dictionary', dictionary)
  return newEntry
}

export async function removeWord(id: string): Promise<void> {
  const dictionary = await getDictionary()
  const filtered = dictionary.filter((w) => w.id !== id)
  await setStorageData('dictionary', filtered)
}

/**
 * Работа с настройками
 */
export async function getSettings(): Promise<AppSettings> {
  return getStorageData('settings')
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...settings }
  await setStorageData('settings', updated)
  return updated
}
