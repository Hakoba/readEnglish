<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  top: number
  left: number
  original: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save', data: { original: string; translate: string }): void
  (e: 'close'): void
}>()

const translate = ref<string>('translate')

function onSave(): void {
  emit('save', {
    original: props.original,
    translate: translate.value
  })
}

function onClose(): void {
  emit('close')
}
</script>

<template>
  <div
    class="word-card-wrapper"
    :style="{ top: `${top}px`, left: `${left}px` }"
  >
    <v-card
      class="pa-3"
      width="250"
      elevation="4"
    >
      <v-card-title class="text-subtitle-1 pa-0 mb-2">
        {{ original }}
      </v-card-title>

      <v-text-field
        v-model="translate"
        label="Перевод"
        variant="underlined"
        density="compact"
        hide-details
        class="mb-3"
      />

      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="onClose"
        />
        <v-btn
          icon="mdi-content-save"
          color="primary"
          variant="elevated"
          size="small"
          @click="onSave"
        />
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.word-card-wrapper {
  position: fixed;
  z-index: 2147483647;
  pointer-events: auto;
  transform: translate(-50%, 10px);
}
</style>
