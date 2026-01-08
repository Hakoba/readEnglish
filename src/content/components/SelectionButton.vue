<script setup lang="ts">
interface Props {
  top: number
  left: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'save'): void
}>()

function onSave(): void {
  emit('save')
}
</script>

<template>
  <div
    class="selection-button-wrapper"
    :style="{  top: `${top}px`, left: `${left}px` }"
  >
    <v-btn
      icon="mdi-translate"
      color="primary"
      size="x-small"
      class="save-btn"
      @click="onSave"
    />
  </div>
</template>

<style scoped>
.selection-button-wrapper {
  position: fixed;
  z-index: 2147483647;
  pointer-events: auto;
  transform: translate(-50%, -120%);
}

.save-btn {
  box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
}
</style>
