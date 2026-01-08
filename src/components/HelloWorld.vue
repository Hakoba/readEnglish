<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1 class="text-h4 mb-4">{{ msg }}</h1>

  <div class="mb-6">
    <v-btn color="primary" @click="count++">
      count is {{ count }}
    </v-btn>
    <p class="mt-4">
      Edit
      <code>src/components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p class="mb-2">
    Check out
    <a href="https://github.com/crxjs/create-crxjs" target="_blank">create-crxjs</a>, the official starter
  </p>

  <p class="text-grey">
    Click on the Vite, Vue and CRXJS logos to learn more
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
