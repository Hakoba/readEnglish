/**
 * Utility for highlighting known words in the DOM.
 */

const HIGHLIGHT_CLASS = 'nh-highlighted-word'

/**
 * Highlight words in the specified container.
 */
export function highlightWords(containerSelector: string, words: string[]): void {
  const container = document.querySelector(containerSelector)
  if (!container || !words.length) return

  // Clear existing highlights first
  clearHighlights(container)

  // Sort words by length descending to handle overlapping phrases (longest first)
  const sortedWords = [...new Set(words)]
    .filter(w => w.length > 2)
    .sort((a, b) => b.length - a.length)

  if (!sortedWords.length) return

  const regex = new RegExp(`\\b(${sortedWords.map(escapeRegExp).join('|')})\\b`, 'gi')
  
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)
  const nodes: Text[] = []
  
  let currentNode = walker.nextNode()
  while (currentNode) {
    nodes.push(currentNode as Text)
    currentNode = walker.nextNode()
  }

  nodes.forEach(node => {
    const parent = node.parentElement
    if (!parent || parent.closest(`.${HIGHLIGHT_CLASS}`) || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) {
      return
    }

    const text = node.nodeValue || ''
    if (regex.test(text)) {
      const fragment = document.createDocumentFragment()
      let lastIndex = 0
      
      text.replace(regex, (match, p1, offset) => {
        // Add text before match
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)))
        
        // Add highlighted span
        const span = document.createElement('span')
        span.className = HIGHLIGHT_CLASS
        span.textContent = match
        fragment.appendChild(span)
        
        lastIndex = offset + match.length
        return match
      })
      
      // Add remaining text
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
      parent.replaceChild(fragment, node)
    }
  })
}

/**
 * Remove all highlights from the container.
 */
export function clearHighlights(container: Element): void {
  const highlights = container.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
  highlights.forEach(el => {
    const parent = el.parentNode
    if (parent) {
      parent.replaceChild(document.createTextNode(el.textContent || ''), el)
      parent.normalize() // Merge adjacent text nodes
    }
  })
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
