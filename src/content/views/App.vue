<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SelectionButton from '../components/SelectionButton.vue'
import WordCard from '../components/WordCard.vue'
import WordTooltip from '../components/WordTooltip.vue'
import MainPanel from '../components/MainPanel.vue'
import { saveWord, getSettings, getDictionary, saveAnalysisResult, getAnalysisResult, removeWord } from '@/utils/storage'
import { getChapterText, getVisibleChapterText } from '../utils/parser'
import { highlightWords } from '../utils/highlighter'
import { requestDifficultWords, extractDifficultWords, requestTranslation } from '@/utils/llmClient'
import { translateBatch, translateText } from '@/utils/translator'
import type { AppSettings, WordWithExplanation, WordEntry, AnalysisResult } from '@/types/words'

const settings = ref<AppSettings>({
  parsingMode: 'visible',
  translationMode: 'llm',
  selectionTranslationMode: 'llm',
  autoAnalysis: false,
  containerPosition: 'bottom-left',
  llmUrl: '',
  llmApiKey: '',
  llmModel: '',
  llmLevel: 'B1',
  llmTemperature: 0.5
})
const dictionary = ref<WordEntry[]>([])
const selectionVisible = ref<boolean>(false)
const cardVisible = ref<boolean>(false)
const selectionPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })
const cardPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })
const selectedText = ref<string>('')
const cardTranslate = ref<string>('')
const analyzedWords = ref<WordWithExplanation[]>([])
const isAnalyzing = ref<boolean>(false)

// Tooltip state
const tooltipVisible = ref<boolean>(false)
const tooltipText = ref<string>('')
const tooltipPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })

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
      let words: WordWithExplanation[] = []
      
      if (settings.value.translationMode === 'libret') {
        const originals = await extractDifficultWords(text)
        if (originals.length > 0) {
          const translations = await translateBatch(originals)
          words = originals.map((original, index) => ({
            original,
            translate: translations[index] || ''
          }))
        }
      } else {
        words = await requestDifficultWords(text)
      }
      
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

async function showCard(): Promise<void> {
  cardPos.value = { ...selectionPos.value }
  cardTranslate.value = 'Загрузка...'
  cardVisible.value = true
  selectionVisible.value = false
  
  try {
    let translation = ''
    if (settings.value.selectionTranslationMode === 'libret') {
      translation = await translateText(selectedText.value)
    } else {
      // LLM mode: use requestTranslation to get a context-aware translation
      let context = ''
      try {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          context = selection.anchorNode?.parentElement?.innerText || ''
        }
      } catch (e) {
        console.error('Failed to get context for LLM translation', e)
      }
      translation = await requestTranslation(selectedText.value, context)
    }
    cardTranslate.value = translation
  } catch (error) {
    console.error('Translation failed:', error)
    cardTranslate.value = ''
  }
}

async function handleSave(data: { original: string; translate: string }): Promise<void> {
  console.log('handleSave triggered', data)
  
  let context = ''
  try {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      context = selection.anchorNode?.parentElement?.innerText || ''
    }
  } catch (e) {
    console.error('Failed to get context', e)
  }

  await saveWord({
    original: data.original,
    translate: data.translate,
    context: context,
  })

  cardVisible.value = false
  window.getSelection()?.removeAllRanges()
}

async function handleRemove(id: string): Promise<void> {
  await removeWord(id)
}

function closeCard(): void {
  cardVisible.value = false
  window.getSelection()?.removeAllRanges()
}

async function handleToggleWord(word: WordWithExplanation | WordEntry): Promise<void> {
  const savedId = dictionary.value.find(w => w.original.toLowerCase() === word.original.toLowerCase())?.id
  if (savedId) {
    await handleRemove(savedId)
  } else {
    await handleSave(word)
  }
}

function handleMouseOver(event: MouseEvent): void {
  const target = event.target as HTMLElement
  const word = target.dataset.nhWord
  
  if (word && (target.classList.contains('nh-highlighted-word') || target.classList.contains('nh-llm-highlighted-word'))) {
    // Ищем перевод в словаре
    const dictEntry = dictionary.value.find(w => w.original.toLowerCase() === word.toLowerCase())
    if (dictEntry) {
      tooltipText.value = dictEntry.translate
    } else {
      // Ищем в результатах анализа
      const analyzedEntry = analyzedWords.value.find(w => w.original.toLowerCase() === word.toLowerCase())
      if (analyzedEntry) {
        tooltipText.value = analyzedEntry.translate
      }
    }

    if (tooltipText.value) {
      const rect = target.getBoundingClientRect()
      tooltipPos.value = {
        top: rect.top,
        left: rect.left + rect.width / 2
      }
      tooltipVisible.value = true
    }
  }
}

function handleMouseOut(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (target.dataset.nhWord) {
    tooltipVisible.value = false
    tooltipText.value = ''
  }
}

onMounted(() => {
  fetchSettings()
  document.addEventListener('mouseup', handleSelection, { capture: true })
  document.addEventListener('mouseover', handleMouseOver)
  document.addEventListener('mouseout', handleMouseOut)
  chrome.storage.onChanged.addListener(handleStorageChange)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleSelection, { capture: true })
  document.removeEventListener('mouseover', handleMouseOver)
  document.removeEventListener('mouseout', handleMouseOut)
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
      v-model="cardTranslate"
      :top="cardPos.top"
      :left="cardPos.left"
      :original="selectedText"
      @save="handleSave"
      @close="closeCard"
    />

    <WordTooltip
      :visible="tooltipVisible"
      :text="tooltipText"
      :top="tooltipPos.top"
      :left="tooltipPos.left"
    />

    <MainPanel
      :position="settings.containerPosition"
      :words="analyzedWords"
      :dictionary="dictionary"
      :loading="isAnalyzing"
      @toggle-word="handleToggleWord"
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
