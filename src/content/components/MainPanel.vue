<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WordWithExplanation } from '@/types/words'

interface Props {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  words?: WordWithExplanation[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-left',
  words: () => [],
  loading: false
})

const show = ref<boolean>(true)

const containerClasses = computed<Record<string, boolean>>(() => ({
  'popup-container': true,
  [`pos-${props.position}`]: true
}))

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'save-word', word: WordWithExplanation): void
}>()

function toggle(): void {
  show.value = !show.value
  emit('toggle')
}

function saveWord(word: WordWithExplanation): void {
  emit('save-word', word)
}
</script>

<template>
  <main :class="containerClasses">
    <v-btn
      icon="mdi-help"
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
        class="pa-4"
        width="300"
        max-height="400"
        style="overflow-y: auto;"
      >
        <div class="d-flex align-center mb-2">
          <h1 class="text-h6 mb-0">
            Novel Helper
          </h1>
          <v-spacer />
          <v-progress-circular
            v-if="loading"
            indeterminate
            size="20"
            width="2"
            color="primary"
          />
        </div>

        <p
          v-if="!words.length && !loading"
          class="text-body-2"
        >
          Выделите текст для сохранения в словарь или подождите завершения анализа
        </p>

        <v-list
          v-else-if="words.length"
          density="compact"
          class="pa-0"
        >
          <v-list-item
            v-for="(word, index) in words"
            :key="index"
            class="pa-0 mb-1"
          >
            <template #append>
              <v-btn
                icon="mdi-plus"
                size="x-small"
                variant="text"
                color="primary"
                @click="saveWord(word)"
              />
            </template>
            <v-list-item-title class="text-body-2 font-weight-bold">
              {{ word.original }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ word.translate }}
            </v-list-item-subtitle>
          </v-list-item>
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
  border-radius: 0.5rem;
  width: max-content;
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
