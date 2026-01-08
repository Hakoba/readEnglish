<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  msg?: string
}

withDefaults(defineProps<Props>(), {
  msg: '',
})

const count = ref<number>(0)

function increment(): void {
  count.value++
}
</script>

<template>
  <h1 class="text-h4 mb-4">
    {{ msg }}
  </h1>

  <section class="mb-6">
    <v-btn
      color="primary"
      @click="increment"
    >
      count is {{ count }}
    </v-btn>
    <p class="mt-4">
      Edit
      <code>src/components/HelloWorld.vue</code> to test HMR
    </p>
  </section>

  <p class="mb-2">
    Check out
    <a
      href="https://github.com/crxjs/create-crxjs"
      target="_blank"
      rel="noopener noreferrer"
    >
      create-crxjs
    </a>, the official starter
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
