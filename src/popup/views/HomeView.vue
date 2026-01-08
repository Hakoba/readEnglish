<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue'
import ViteLogo from '@/assets/vite.svg'
import VueLogo from '@/assets/vue.svg'
import CrxLogo from '@/assets/crx.svg'
</script>

<template>
  <v-container class="text-center">
    <span>kekekeke</span>
    <v-row
      justify="center"
      align="center"
      class="mt-4"
    >
      <v-col cols="auto">
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-img
            :src="ViteLogo"
            width="100"
            height="100"
            class="logo"
            alt="Vite logo"
          />
        </a>
      </v-col>
      <v-col cols="auto">
        <a
          href="https://vuejs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-img
            :src="VueLogo"
            width="100"
            height="100"
            class="logo vue"
            alt="Vue logo"
          />
        </a>
      </v-col>
      <v-col cols="auto">
        <a
          href="https://crxjs.dev/vite-plugin"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-img
            :src="CrxLogo"
            width="100"
            height="100"
            class="logo crx"
            alt="crx logo"
          />
        </a>
      </v-col>
    </v-row>

    <v-card
      class="mt-6 pa-4"
      elevation="2"
    >
      <HelloWorld msg="Vite + Vue + CRXJS + Vuetify" />
    </v-card>
  </v-container>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.crx:hover {
  filter: drop-shadow(0 0 2em #f2bae4aa);
}
</style>
