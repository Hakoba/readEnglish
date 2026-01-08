import { ref, onMounted, onUnmounted } from 'vue'
import { getDictionary, saveWord, removeWord } from '@/utils/storage'
import type { WordEntry, WordWithExplanation } from '@/types/words'

export function useWordActions() {
  const dictionary = ref<WordEntry[]>([])

  async function fetchDictionary() {
    dictionary.value = await getDictionary()
  }

  function isSaved(original: string): string | undefined {
    const entry = dictionary.value.find(w => w.original.toLowerCase() === original.toLowerCase())
    return entry?.id
  }

  async function toggleWord(word: WordWithExplanation | WordEntry) {
    const savedId = isSaved(word.original)
    if (savedId) {
      await removeWord(savedId)
    } else {
      await saveWord({
        original: word.original,
        translate: word.translate,
        context: (word as WordEntry).context || ''
      })
    }
    // dictionary обновится через storage listener в компоненте или вручную
    await fetchDictionary()
  }

  const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'sync' && changes.dictionary) {
      dictionary.value = changes.dictionary.newValue as WordEntry[]
    }
  }

  onMounted(() => {
    fetchDictionary()
    chrome.storage.onChanged.addListener(handleStorageChange)
  })

  onUnmounted(() => {
    chrome.storage.onChanged.removeListener(handleStorageChange)
  })

  return {
    dictionary,
    isSaved,
    toggleWord,
    fetchDictionary
  }
}
