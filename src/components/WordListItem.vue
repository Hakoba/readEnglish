<script setup lang="ts">
import type { WordWithExplanation, WordEntry } from '@/types/words'

interface Props {
  word: WordWithExplanation | WordEntry
  isSaved: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <v-list-item class="px-3 py-1 mb-0" min-height="32">
    <template #append>
      <v-btn
        :icon="isSaved ? 'mdi-delete' : 'mdi-plus'"
        size="x-small"
        variant="text"
        :color="isSaved ? 'error' : 'primary'"
        @click="emit('toggle')"
      />
    </template>
    <v-list-item-title class="text-caption font-weight-bold" style="line-height: 1.2;">
      {{ word.original }}
    </v-list-item-title>
    <v-list-item-subtitle class="text-caption" style="font-size: 0.7rem !important; line-height: 1.1;">
      {{ word.translate }}
    </v-list-item-subtitle>
  </v-list-item>
</template>
