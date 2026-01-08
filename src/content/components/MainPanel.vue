<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WordWithExplanation, WordEntry } from '@/types/words'
import WordListItem from '@/components/WordListItem.vue'

interface Props {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  words?: WordWithExplanation[]
  dictionary?: WordEntry[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-left',
  words: () => [],
  dictionary: () => [],
  loading: false
})

const show = ref<boolean>(false)

const containerClasses = computed<Record<string, boolean>>(() => ({
  'popup-container': true,
  [`pos-${props.position}`]: true
}))

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'save-word', word: WordWithExplanation): void
  (e: 'remove-word', id: string): void
  (e: 'toggle-word', word: WordWithExplanation | WordEntry): void
  (e: 'analyze'): void
}>()

function isSaved(word: string): string | undefined {
  const entry = props.dictionary.find(w => w.original.toLowerCase() === word.toLowerCase())
  return entry?.id
}

function toggle(): void {
  show.value = !show.value
  emit('toggle')
}

function onAnalyze(): void {
  emit('analyze')
}
</script>

<template>
  <main :class="containerClasses">
    <v-btn
      icon="mdi-book"
      color="primary"
      class="toggle-button"
      text="Меню"
      @click="toggle"
    />

    <section
      v-show="show"
      class="popup-content"
    >
      <v-card

        width="300"
        max-height="400"
        style="overflow-y: auto;"
      >
        <div class="d-flex align-center px-3 py-2 mb-2">
          <h1 class="text-h6 mb-0">
            Novel Helper
          </h1>
          <v-spacer />
          <v-btn
            v-if="!loading"
            prepend-icon="mdi-magnify"
            size="small"
            variant="elevated"
            color="primary"
            class="text-none"
            @click="onAnalyze"
          >
            Анализ
          </v-btn>
          <v-progress-circular
            v-else
            indeterminate
            size="20"
            width="2"
            color="primary"
          />
        </div>

        <p
          v-if="!words.length && !loading"
          class="text-body-2 px-3 pb-3"
        >
          Выделите текст для сохранения в словарь или нажмите кнопку «Анализ» для поиска сложных слов
        </p>

        <v-list
          v-else-if="words.length"
          density="compact"
          class="pa-0"
        >
          <WordListItem
            v-for="(word, index) in words"
            :key="index"
            :word="word"
            :is-saved="!!isSaved(word.original)"
            @toggle="emit('toggle-word', word)"
          />
        </v-list>
      </v-card>
    </section>
  </main>
</template>

<style scoped>
.popup-container {
  position: fixed;
  display: flex;
  font-family: ui-sans-serif, system-ui, sans-serif;
  user-select: none;
  line-height: 1em;
  padding: 20px;
  z-index: 10001;
}

/* Позиционирование */
.pos-bottom-left {
  bottom: 0;
  left: 0;
  flex-direction: row;
  align-items: flex-end;
}

.pos-bottom-right {
  bottom: 0;
  right: 0;
  flex-direction: row-reverse;
  align-items: flex-end;
}

.pos-top-left {
  top: 0;
  left: 0;
  flex-direction: row;
  align-items: flex-start;
}

.pos-top-right {
  top: 0;
  right: 0;
  flex-direction: row-reverse;
  align-items: flex-start;
}

.popup-content {
  width: max-content;
  padding: 0;
  height: min-content;
  transition: opacity 300ms;
}

/* Отступы контента в зависимости от позиции */
.pos-bottom-left .popup-content { margin: 0 0 0 0.5rem; }
.pos-bottom-right .popup-content { margin: 0 0.5rem 0 0; }
.pos-top-left .popup-content { margin: 0 0 0 0.5rem; }
.pos-top-right .popup-content { margin: 0 0.5rem 0 0; }

.toggle-button {
  display: flex;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}
</style>
