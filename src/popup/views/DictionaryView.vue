<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getDictionary, removeWord } from '@/utils/storage'
import type { WordEntry } from '@/types/words'

const dictionary = ref<WordEntry[]>([])
const search = ref<string>('')

async function fetchDictionary(): Promise<void> {
  dictionary.value = await getDictionary()
}

async function handleDelete(id: string): Promise<void> {
  await removeWord(id)
  // fetchDictionary() теперь вызывается автоматически через handleStorageChange
}

function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, areaName: string): void {
  if (areaName === 'sync' && changes.dictionary) {
    dictionary.value = changes.dictionary.newValue as WordEntry[]
  }
}

const filteredDictionary = () => {
  if (!search.value) return dictionary.value
  const s = search.value.toLowerCase()
  return dictionary.value.filter(item => 
    item.original.toLowerCase().includes(s) || 
    item.translate.toLowerCase().includes(s)
  )
}

onMounted(() => {
  fetchDictionary()
  chrome.storage.onChanged.addListener(handleStorageChange)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
})
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-2">
      <h1 class="text-h5 mb-0">
        Словарь
      </h1>
      <v-spacer />
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Поиск"
        single-line
        hide-details
        density="compact"
        class="max-width-200"
      />
    </div>

    <v-card v-if="dictionary.length === 0" class="pa-4 text-center">
      <p class="text-body-1 text-grey">Ваш словарь пока пуст.</p>
    </v-card>

    <v-list v-else density="compact" class="pa-0">
      <v-list-item
        v-for="word in filteredDictionary()"
        :key="word.id"
        class="mb-1 border rounded pa-2"
        min-height="40"
      >
        <v-list-item-title class="text-subtitle-2 font-weight-bold">
          {{ word.original }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          {{ word.translate }}
        </v-list-item-subtitle>
        
        <template #append>
          <v-btn
            icon="mdi-delete"
            variant="text"
            color="error"
            size="x-small"
            @click="handleDelete(word.id)"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
.border {
  border: 1px solid rgba(0,0,0,0.12);
}
</style>

<style scoped>
</style>
