<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSettings, updateSettings } from '@/utils/storage'
import type { AppSettings } from '@/types/words'

const settings = ref<AppSettings>({
  parsingMode: 'visible',
  autoAnalysis: true,
  containerPosition: 'bottom-left'
})

const loading = ref<boolean>(true)
const snackbar = ref<boolean>(false)

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
