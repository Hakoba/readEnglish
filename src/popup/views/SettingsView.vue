<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSettings, updateSettings, clearDictionary, clearAnalysisResults } from '@/utils/storage'
import type { AppSettings } from '@/types/words'

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

const loading = ref<boolean>(true)
const snackbar = ref<boolean>(false)
const snackbarText = ref<string>('')

const positions = [
  { title: 'Слева внизу', value: 'bottom-left' },
  { title: 'Справа внизу', value: 'bottom-right' },
  { title: 'Слева вверху', value: 'top-left' },
  { title: 'Справа вверху', value: 'top-right' },
]

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

async function loadSettings(): Promise<void> {
  const data = await getSettings()
  settings.value = data
  loading.value = false
}

async function saveSettings(): Promise<void> {
  await updateSettings(settings.value)
  snackbarText.value = 'Настройки сохранены'
  snackbar.value = true
}

async function handleClearDictionary(): Promise<void> {
  if (confirm('Вы уверены, что хотите полностью очистить словарь? Это действие необратимо.')) {
    await clearDictionary()
    snackbarText.value = 'Словарь очищен. Перезагрузка страницы...'
    snackbar.value = true
    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.reload(tabs[0].id)
        }
      })
    }, 1500)
  }
}

async function handleClearAnalysis(): Promise<void> {
  if (confirm('Вы уверены, что хотите очистить кэш анализа страниц?')) {
    await clearAnalysisResults()
    snackbarText.value = 'Кэш анализа очищен. Перезагрузка страницы...'
    snackbar.value = true
    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.reload(tabs[0].id)
        }
      })
    }, 1500)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <v-container>
    <h1 class="text-h5 mb-4">Настройки</h1>

    <v-card v-if="!loading" class="pa-4">
      <v-select
        v-model="settings.containerPosition"
        label="Положение панели на странице"
        :items="positions"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
        class="mb-4"
      />

      <v-select
        v-model="settings.parsingMode"
        label="Режим парсинга"
        :items="[
          { title: 'Только видимая часть', value: 'visible' },
          { title: 'Вся глава', value: 'full' }
        ]"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
        class="mb-4"
      />
      <v-select
        v-model="settings.translationMode"
        label="Режим анализа страницы"
        :items="[
          { title: 'LLM поиск и перевод', value: 'llm' },
          { title: 'LLM поиск + LibreTranslate', value: 'libret' }
        ]"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
        class="mb-4"
      />

      <v-select
        v-model="settings.selectionTranslationMode"
        label="Перевод выделенного текста"
        :items="[
          { title: 'LLM (объяснение контекста)', value: 'llm' },
          { title: 'LibreTranslate (простой перевод)', value: 'libret' }
        ]"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
        class="mb-4"
      />

      <v-switch
        v-model="settings.autoAnalysis"
        label="Автоматический анализ главы"
        color="primary"
        hide-details
        class="mb-4"
      />

      <v-divider class="mb-4" />
      <h2 class="text-subtitle-1 mb-2">Настройки LLM</h2>

      <v-text-field
        v-model="settings.llmUrl"
        label="LLM API URL"
        placeholder="http://192.168.0.11:1234"
        variant="outlined"
        density="compact"
        class="mb-2"
      />

      <v-text-field
        v-model="settings.llmModel"
        label="Модель"
        placeholder="gpt-oss"
        variant="outlined"
        density="compact"
        class="mb-2"
      />

      <v-text-field
        v-model="settings.llmApiKey"
        label="API Ключ (необязательно)"
        type="password"
        variant="outlined"
        density="compact"
        class="mb-2"
      />

      <div class="d-flex gap-2 mb-4">
        <v-select
          v-model="settings.llmLevel"
          label="Уровень сложности"
          :items="cefrLevels"
          variant="outlined"
          density="compact"
          hide-details
          class="mr-2"
        />
        <v-text-field
          v-model.number="settings.llmTemperature"
          label="Temperature"
          type="number"
          step="0.1"
          min="0"
          max="1"
          variant="outlined"
          density="compact"
          hide-details
        />
      </div>

      <v-btn
        color="primary"
        block
        prepend-icon="mdi-content-save"
        class="mb-4"
        @click="saveSettings"
      >
        Сохранить
      </v-btn>

      <v-divider class="mb-4" />
      <h2 class="text-subtitle-1 mb-2 text-error">Опасная зона</h2>
      
      <v-btn
        color="error"
        variant="outlined"
        block
        prepend-icon="mdi-delete-sweep"
        class="mb-2"
        @click="handleClearAnalysis"
      >
        Очистить кэш анализа
      </v-btn>

      <v-btn
        color="error"
        variant="tonal"
        block
        prepend-icon="mdi-delete-forever"
        @click="handleClearDictionary"
      >
        Сбросить словарь
      </v-btn>
    </v-card>

    <v-skeleton-loader v-else type="card" />

    <v-snackbar
      v-model="snackbar"
      timeout="2000"
      color="success"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>
