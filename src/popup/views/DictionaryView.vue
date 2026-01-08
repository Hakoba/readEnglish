<script setup lang="ts">
import { ref } from 'vue'
import { useWordActions } from '@/composables/useWordActions'
import WordListItem from '@/components/WordListItem.vue'

const { dictionary, toggleWord } = useWordActions()
const search = ref<string>('')

const filteredDictionary = () => {
  if (!search.value) return dictionary.value
  const s = search.value.toLowerCase()
  return dictionary.value.filter(item => 
    item.original.toLowerCase().includes(s) || 
    item.translate.toLowerCase().includes(s)
  )
}
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-2">
      <h1 class="text-h5 mb-0">
        Словарь
      </h1>
      <v-spacer />
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Поиск"
        single-line
        hide-details
        density="compact"
        class="max-width-200"
      />
    </div>

    <v-card v-if="dictionary.length === 0" class="pa-4 text-center">
      <p class="text-body-1 text-grey">Ваш словарь пока пуст.</p>
    </v-card>

    <v-list v-else density="compact" class="pa-0">
      <WordListItem
        v-for="word in filteredDictionary()"
        :key="word.id"
        :word="word"
        :is-saved="true"
        class="mb-1 border rounded pa-2"
        @toggle="toggleWord(word)"
      />
    </v-list>
  </v-container>
</template>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
.border {
  border: 1px solid rgba(0,0,0,0.12);
}
</style>

<style scoped>
</style>
