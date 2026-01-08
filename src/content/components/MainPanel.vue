<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-left'
})

const show = ref<boolean>(true)

const containerClasses = computed<Record<string, boolean>>(() => ({
  'popup-container': true,
  [`pos-${props.position}`]: true
}))

function toggle(): void {
  show.value = !show.value
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
      <v-card class="pa-4">
        <h1 class="text-h6">
          Novel Helper
        </h1>
        <p class="text-body-2">
          Выделите текст для сохранения в словарь
        </p>
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
