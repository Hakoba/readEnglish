/**
 * Utility for highlighting known words in the DOM.
 */

const HIGHLIGHT_CLASS = 'nh-highlighted-word'
const LLM_HIGHLIGHT_CLASS = 'nh-llm-highlighted-word'

/**
 * Highlight words in the specified container.
 */
export function highlightWords(containerSelector: string, dictionaryWords: string[], llmWords: string[] = []): void {
  const container = document.querySelector(containerSelector)
  if (!container) return

  // Clear existing highlights first
  clearHighlights(container)

  if (!dictionaryWords.length && !llmWords.length) return

  // Мы должны обрабатывать оба списка. Приоритет у словаря.
  // Исключаем из llmWords те, что уже есть в словаре
  const dictSet = new Set(dictionaryWords.map(w => w.toLowerCase()))
  const filteredLlmWords = llmWords.filter(w => !dictSet.has(w.toLowerCase()))

  const allWords = [
    ...dictionaryWords.map(w => ({ text: w, className: HIGHLIGHT_CLASS })),
    ...filteredLlmWords.map(w => ({ text: w, className: LLM_HIGHLIGHT_CLASS }))
  ].filter(w => w.text.length > 2)
   .sort((a, b) => b.text.length - a.text.length)

  if (!allWords.length) return

  const regex = new RegExp(`\\b(${allWords.map(w => escapeRegExp(w.text)).join('|')})\\b`, 'gi')
  
  // Создаем карту для быстрого поиска класса по слову
  const classMap = new Map<string, string>()
  allWords.forEach(w => {
    classMap.set(w.text.toLowerCase(), w.className)
  })

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)
  const nodes: Text[] = []
  
  let currentNode = walker.nextNode()
  while (currentNode) {
    nodes.push(currentNode as Text)
    currentNode = walker.nextNode()
  }

  nodes.forEach(node => {
    const parent = node.parentElement
    if (!parent || parent.closest(`.${HIGHLIGHT_CLASS}`) || parent.closest(`.${LLM_HIGHLIGHT_CLASS}`) || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) {
      return
    }

    const text = node.nodeValue || ''
    if (regex.test(text)) {
      const fragment = document.createDocumentFragment()
      let lastIndex = 0
      
      text.replace(regex, (match, p1, offset) => {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)))
        
        const span = document.createElement('span')
        span.className = classMap.get(match.toLowerCase()) || HIGHLIGHT_CLASS
        span.textContent = match
        fragment.appendChild(span)
        
        lastIndex = offset + match.length
        return match
      })
      
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
      parent.replaceChild(fragment, node)
    }
  })
}

/**
 * Remove all highlights from the container.
 */
export function clearHighlights(container: Element): void {
  const highlights = container.querySelectorAll(`.${HIGHLIGHT_CLASS}, .${LLM_HIGHLIGHT_CLASS}`)
  highlights.forEach(el => {
    const parent = el.parentNode
    if (parent) {
      parent.replaceChild(document.createTextNode(el.textContent || ''), el)
      parent.normalize()
    }
  })
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
