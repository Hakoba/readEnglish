<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref<boolean>(true)

function toggleDrawer(): void {
  drawer.value = !drawer.value
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
      <v-list>
        <v-list-item
          to="/"
          prepend-icon="mdi-home"
          title="Главная"
        />
        <v-list-item
          to="/dictionary"
          prepend-icon="mdi-book-open-variant"
          title="Словарь"
        />
        <v-list-item
          to="/settings"
          prepend-icon="mdi-cog"
          title="Настройки"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      color="primary"
      density="compact"
    >
      <v-app-bar-nav-icon @click="toggleDrawer" />
      <v-app-bar-title>Novel Helper</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
/* Vuetify v-app can have issues with default background in some contexts, ensure it looks good */
.v-application {
  min-width: 400px;
  min-height: 500px;
}
</style>
