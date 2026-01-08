<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getAnalysisResult, saveAnalysisResult } from '@/utils/storage'
import { requestDifficultWords } from '@/utils/llmClient'
import { useWordActions } from '@/composables/useWordActions'
import WordListItem from '@/components/WordListItem.vue'
import type { WordWithExplanation, AnalysisResult } from '@/types/words'

const { isSaved, toggleWord } = useWordActions()
const analyzedWords = ref<WordWithExplanation[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const currentUrl = ref<string>('')

async function fetchCurrentAnalysis(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url || !tab.url.includes('novelbin.com')) {
    error.value = 'Пожалуйста, откройте главу на novelbin.com'
    return
  }
  
  currentUrl.value = tab.url
  const result = await getAnalysisResult(tab.url)
  if (result) {
    analyzedWords.value = result.words
  } else {
    analyzedWords.value = []
  }
}

async function analyzeCurrentTab(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id || !tab.url?.includes('novelbin.com')) {
      error.value = 'Пожалуйста, откройте главу на novelbin.com'
      return
    }

    currentUrl.value = tab.url

    // Выполняем скрипт на странице для получения текста
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const contentSelector = '#chr-content, .chr-c'
        const container = document.querySelector(contentSelector)
        return container ? (container as HTMLElement).innerText : ''
      }
    })

    const text = results[0]?.result
    if (!text) {
      error.value = 'Не удалось найти текст главы на странице'
      return
    }

    const words = await requestDifficultWords(text)
    analyzedWords.value = words

    // Сохраняем результат, чтобы контент-скрипт тоже его увидел
    await saveAnalysisResult({
      url: tab.url,
      words,
      timestamp: Date.now()
    })
  } catch (e) {
    console.error(e)
    error.value = 'Произошла ошибка при анализе'
  } finally {
    loading.value = false
  }
}

function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, areaName: string): void {
  if (areaName === 'local' && changes.analysisResults && currentUrl.value) {
    const results = changes.analysisResults.newValue as Record<string, AnalysisResult>
    if (results && results[currentUrl.value]) {
      analyzedWords.value = results[currentUrl.value].words
    }
  }
}

onMounted(() => {
  fetchCurrentAnalysis()
  chrome.storage.onChanged.addListener(handleStorageChange)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
})
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h5 mb-0">
        Анализ страницы
      </h1>
      <v-spacer />
      <v-btn
        icon="mdi-refresh"
        size="small"
        :loading="loading"
        @click="analyzeCurrentTab"
      />
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <div v-if="loading && !analyzedWords.length" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-2">Анализируем текст главы...</p>
    </div>

    <v-card v-else-if="analyzedWords.length" elevation="0">
      <v-list density="compact">
        <WordListItem
          v-for="(word, index) in analyzedWords"
          :key="index"
          :word="word"
          :is-saved="!!isSaved(word.original)"
          class="border-bottom pa-0"
          @toggle="toggleWord(word)"
        />
      </v-list>
    </v-card>

    <v-card v-else-if="!loading" class="pa-4 text-center">
      <p>Нет данных для отображения.</p>
    </v-card>
  </v-container>
</template>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.crx:hover {
  filter: drop-shadow(0 0 2em #f2bae4aa);
}
</style>
