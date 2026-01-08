<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SelectionButton from '../components/SelectionButton.vue'
import WordCard from '../components/WordCard.vue'
import MainPanel from '../components/MainPanel.vue'
import { saveWord, getSettings } from '@/utils/storage'
import type { AppSettings } from '@/types/words'

const settings = ref<AppSettings>({
  parsingMode: 'visible',
  autoAnalysis: true,
  containerPosition: 'bottom-left'
})
const selectionVisible = ref<boolean>(false)
const cardVisible = ref<boolean>(false)
const selectionPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })
const cardPos = ref<{ top: number; left: number }>({ top: 0, left: 0 })
const selectedText = ref<string>('')

async function fetchSettings(): Promise<void> {
  const data = await getSettings()
  settings.value = data
}

function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }): void {
  if (changes.settings) {
    settings.value = changes.settings.newValue as AppSettings
  }
}

function handleSelection(): void {
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

    <MainPanel :position="settings.containerPosition" />
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
  z-index: 10000;
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
