import { ref, onMounted, onUnmounted } from 'vue'

export function useSelection() {
  const selectionVisible = ref(false)
  const selectionPos = ref({ top: 0, left: 0 })
  const selectedText = ref('')

  function handleSelection(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (target.closest('#crxjs-app')) {
      return
    }

    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()

      if (rect) {
        selectionPos.value = {
          top: rect.top,
          left: rect.left + rect.width / 2,
        }
        selectedText.value = text
        selectionVisible.value = true
      }
    } else {
      selectionVisible.value = false
    }
  }

  function clearSelection() {
    selectionVisible.value = false
    window.getSelection()?.removeAllRanges()
  }

  onMounted(() => {
    document.addEventListener('mouseup', handleSelection, { capture: true })
  })

  onUnmounted(() => {
    document.removeEventListener('mouseup', handleSelection, { capture: true })
  })

  return {
    selectionVisible,
    selectionPos,
    selectedText,
    clearSelection
  }
}
