<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SelectionButton from '../components/SelectionButton.vue'
import WordCard from '../components/WordCard.vue'
import MainPanel from '../components/MainPanel.vue'
import { saveWord, getSettings, getDictionary, saveAnalysisResult, getAnalysisResult } from '@/utils/storage'
import { getChapterText, getVisibleChapterText } from '../utils/parser'
import { highlightWords } from '../utils/highlighter'
import { requestDifficultWords } from '@/utils/llmClient'
import type { AppSettings, WordWithExplanation, WordEntry, AnalysisResult } from '@/types/words'

const settings = ref<AppSettings>({
  parsingMode: 'visible',
  autoAnalysis: false,
  containerPosition: 'bottom-left',
  llmUrl: '',
  llmApiKey: '',
  llmModel: ''
})
const dictionary = ref<WordEntry[]>([])
const selectionVisible = ref<boolean>(false)
const cardVisible = ref<boolean>(false)
const selectionPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })
const cardPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })
const selectedText = ref<string>('')
const analyzedWords = ref<WordWithExplanation[]>([])
const isAnalyzing = ref<boolean>(false)

async function fetchSettings(): Promise<void> {
  const [data, dict] = await Promise.all([getSettings(), getDictionary()])
  settings.value = data
  dictionary.value = dict
  
  // Проверяем, есть ли уже результаты для этого URL
  const currentUrl = window.location.href
  const existingResult = await getAnalysisResult(currentUrl)
  if (existingResult) {
    analyzedWords.value = existingResult.words
  }
  
  applyHighlight()

  if (!existingResult && settings.value.autoAnalysis) {
    runAnalysis()
  }
}

function applyHighlight(): void {
  const dictWords = dictionary.value.map(w => w.original)
  const llmWords = analyzedWords.value.map(w => w.original)
  highlightWords('#chr-content, .chr-c', dictWords, llmWords)
}

async function runAnalysis(): Promise<void> {
  if (isAnalyzing.value) return
  
  isAnalyzing.value = true
  try {
    const text = settings.value.parsingMode === 'full' 
      ? getChapterText() 
      : getVisibleChapterText()
      
    if (text) {
      const words = await requestDifficultWords(text)
      analyzedWords.value = words
      
      // Сохраняем результат анализа в chrome.storage.local
      await saveAnalysisResult({
        url: window.location.href,
        words,
        timestamp: Date.now()
      })
    }
  } catch (error) {
    console.error('Analysis failed:', error)
  } finally {
    isAnalyzing.value = false
  }
}

function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, areaName: string): void {
  if (areaName === 'sync') {
    if (changes.settings) {
      settings.value = changes.settings.newValue as AppSettings
    }
    if (changes.dictionary) {
      dictionary.value = changes.dictionary.newValue as WordEntry[]
      applyHighlight()
    }
  }
  
  if (areaName === 'local' && changes.analysisResults) {
    const currentUrl = window.location.href
    const results = changes.analysisResults.newValue as Record<string, AnalysisResult>
    if (results && results[currentUrl]) {
      analyzedWords.value = results[currentUrl].words
      applyHighlight()
    }
  }
}

function handleSelection(event: MouseEvent): void {
  // Don't process if clicking inside our app
  const target = event.target as HTMLElement
  if (target.closest('#crxjs-app')) {
    return
  }

  const selection = window.getSelection()
  const text = selection?.toString().trim()

  if (text && text.length > 0) {
    const range = selection?.getRangeAt(0)
    const rect = range?.getBoundingClientRect()

    if (rect) {
      selectionPos.value = {
        top: rect.top,
        left: rect.left + rect.width / 2,
      }
      selectedText.value = text
      selectionVisible.value = true
      cardVisible.value = false
    }
  } else {
    // If we click elsewhere, hide button unless we're interacting with card
    selectionVisible.value = false
  }
}

function showCard(): void {
  cardPos.value = { ...selectionPos.value }
  cardVisible.value = true
  selectionVisible.value = false
}

async function handleSave(data: { original: string; translate: string }): Promise<void> {
  console.log('handleSave triggered', data)
  await saveWord({
    original: data.original,
    translate: data.translate,
    context: window.getSelection()?.anchorNode?.parentElement?.innerText || '',
  })

  cardVisible.value = false
  window.getSelection()?.removeAllRanges()
}

function closeCard(): void {
  cardVisible.value = false
  window.getSelection()?.removeAllRanges()
}

onMounted(() => {
  fetchSettings()
  document.addEventListener('mouseup', handleSelection, { capture: true })
  chrome.storage.onChanged.addListener(handleStorageChange)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleSelection, { capture: true })
  chrome.storage.onChanged.removeListener(handleStorageChange)
})
</script>

<template>
  <v-app id="crxjs-v-app">
    <SelectionButton
      v-if="selectionVisible"
      :top="selectionPos.top"
      :left="selectionPos.left"
      @save="showCard"
    />

    <WordCard
      v-if="cardVisible"
      :top="cardPos.top"
      :left="cardPos.left"
      :original="selectedText"
      @save="handleSave"
      @close="closeCard"
    />

    <MainPanel
      :position="settings.containerPosition"
      :words="analyzedWords"
      :loading="isAnalyzing"
      @save-word="handleSave"
      @analyze="runAnalysis"
    />
  </v-app>
</template>

<style scoped>
#crxjs-v-app {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 0;
  background: transparent !important;
  z-index: 2147483647;
  pointer-events: none;
  overflow: visible;
}

#crxjs-v-app :deep(.v-application__wrap) {
  min-height: 0 !important;
  background: transparent !important;
  overflow: visible;
}

#crxjs-v-app > * {
  pointer-events: auto; /* Re-enable events for child elements */
}
</style>
