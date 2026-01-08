<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSettings, updateSettings, clearDictionary, clearAnalysisResults } from '@/utils/storage'
import type { AppSettings } from '@/types/words'

const settings = ref<AppSettings>({
  parsingMode: 'visible',
  autoAnalysis: false,
  containerPosition: 'bottom-left',
  llmUrl: '',
  llmApiKey: '',
  llmModel: ''
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
    snackbarText.value = 'Словарь очищен'
    snackbar.value = true
  }
}

async function handleClearAnalysis(): Promise<void> {
  await clearAnalysisResults()
  snackbarText.value = 'Кэш анализа очищен'
  snackbar.value = true
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
        class="mb-4"
      />

      <v-btn
        color="primary"
        block
        prepend-icon="mdi-content-save"
        @click="saveSettings"
      >
        Сохранить
      </v-btn>
    </v-card>

    <v-skeleton-loader v-else type="card" />

    <v-snackbar
      v-model="snackbar"
      timeout="2000"
      color="success"
    >
      Настройки сохранены
    </v-snackbar>
  </v-container>
</template>
