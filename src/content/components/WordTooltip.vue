<script setup lang="ts">
interface Props {
  text: string
  top: number
  left: number
  visible: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="visible"
    class="nh-tooltip"
    :style="{ top: `${top}px`, left: `${left}px` }"
  >
    {{ text }}
  </div>
</template>

<style scoped>
.nh-tooltip {
  position: fixed;
  z-index: 2147483647;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  font-family: sans-serif;
}

.nh-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}
</style>
