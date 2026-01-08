<script setup lang="ts">
import Logo from '@/assets/crx.svg'
import { ref } from 'vue'

const show = ref(false)
const toggle = () => show.value = !show.value
</script>

<template>
  <v-app id="crxjs-v-app">
    <div class="popup-container">
      <div
        v-show="show"
        class="popup-content"
        :class="show ? 'opacity-100' : 'opacity-0'"
      >
        <v-card class="pa-4">
          <h1 class="text-h6">HELLO CRXJS</h1>
        </v-card>
      </div>
      <v-btn
        icon
        color="primary"
        class="toggle-button"
        @click="toggle()"
      >
        <v-img :src="Logo" width="24" height="24" alt="CRXJS logo" />
      </v-btn>
    </div>
  </v-app>
</template>

<style scoped>
/* Ensure Vuetify doesn't take over the whole page in content script */
#crxjs-v-app {
  position: fixed;
  right: 0;
  bottom: 0;
  height: auto;
  width: auto;
  background: transparent !important;
  z-index: 10000;
}

.popup-container {
  display: flex;
  align-items: flex-end;
  font-family: ui-sans-serif, system-ui, sans-serif;
  user-select: none;
  line-height: 1em;
  padding: 20px;
}

.popup-content {
  background-color: white;
  color: #1f2937;
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  width: max-content;
  height: min-content;
  padding: 0.5rem 1rem;
  margin: auto 0.5rem 0 0;
  transition: opacity 300ms;
}

.toggle-button {
  display: flex;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
  cursor: pointer;
  border: none;
  background-color: #288cd7;
}

.toggle-button:hover {
  background-color: #1e6aa3;
}

.button-icon {
  padding: 4px;
}
</style>
