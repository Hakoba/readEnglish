<script setup lang="ts">

interface Props {
  top: number
  left: number
  original: string
  modelValue?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save', data: { original: string; translate: string }): void
  (e: 'close'): void
  (e: 'update:modelValue', value: string): void
}>()

function onSave(): void {
  console.log('WordCard: onSave triggered', props.original, props.modelValue)
  emit('save', {
    original: props.original,
    translate: props.modelValue || ''
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
        :model-value="modelValue"
        label="Перевод"
        variant="underlined"
        density="compact"
        hide-details
        class="mb-3"
        @update:model-value="emit('update:modelValue', $event)"
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
