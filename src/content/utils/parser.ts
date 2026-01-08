/**
 * Utility for parsing novelbin.com content.
 */

/**
 * Get the main content of the chapter.
 * @returns {string} Cleaned text content.
 */
export function getChapterText(): string {
  const contentSelector = '#chr-content, .chr-c'
  const container = document.querySelector(contentSelector)
  
  if (!container) {
    return ''
  }

  // Clone to avoid modifying the original DOM
  const clone = container.cloneNode(true) as HTMLElement
  
  // Remove ads, scripts, and other unwanted elements if they exist
  const elementsToRemove = clone.querySelectorAll('script, style, .ads, .ads-holder, .ads-container')
  elementsToRemove.forEach(el => el.remove())

  return clone.innerText || clone.textContent || ''
}

/**
 * Get only the visible part of the chapter text.
 * Simple implementation using getSelection or range.
 * @returns {string}
 */
export function getVisibleChapterText(): string {
  // For MVP, if we want "visible" part, we might just use the same as getChapterText 
  // or implement more complex logic with IntersectionObserver if needed.
  // Starting with full text as fallback.
  return getChapterText()
}
