import type { StorageSchema, WordEntry, AppSettings, LocalStorageSchema, AnalysisResult } from '@/types/words'

const DEFAULT_SETTINGS: AppSettings = {
  parsingMode: 'visible',
  autoAnalysis: false,
  containerPosition: 'bottom-left',
  llmUrl: 'http://192.168.0.11:1234',
  llmApiKey: '',
  llmModel: 'gpt-oss',
}

const DEFAULT_STORAGE: StorageSchema = {
  dictionary: [],
  settings: DEFAULT_SETTINGS,
}

const DEFAULT_LOCAL_STORAGE: LocalStorageSchema = {
  analysisResults: {}
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
 * Обертка над chrome.storage.local
 */
export async function getLocalData<K extends keyof LocalStorageSchema>(key: K): Promise<LocalStorageSchema[K]> {
  const result = await chrome.storage.local.get(key)
  return (result[key] as LocalStorageSchema[K]) || DEFAULT_LOCAL_STORAGE[key]
}

export async function setLocalData<K extends keyof LocalStorageSchema>(key: K, value: LocalStorageSchema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
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
 * Работа с результатами анализа
 */
export async function getAnalysisResult(url: string): Promise<AnalysisResult | undefined> {
  const results = await getLocalData('analysisResults')
  return results[url]
}

export async function saveAnalysisResult(result: AnalysisResult): Promise<void> {
  const results = await getLocalData('analysisResults')
  
  // Очистка старых данных (оставляем последние 10 результатов)
  const keys = Object.keys(results)
  if (keys.length >= 10) {
    const sorted = keys.sort((a, b) => (results[a]?.timestamp || 0) - (results[b]?.timestamp || 0))
    delete results[sorted[0]!]
  }

  results[result.url] = result
  await setLocalData('analysisResults', results)
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

/**
 * Очистка данных
 */
export async function clearDictionary(): Promise<void> {
  await setStorageData('dictionary', [])
}

export async function clearAnalysisResults(): Promise<void> {
  await setLocalData('analysisResults', {})
}
