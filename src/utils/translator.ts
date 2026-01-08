/**
 * Клиент для LibreTranslate
 */

export async function translateText(text: string, target = 'ru'): Promise<string> {
  if (!text) return ''
  
  try {
    const res = await fetch("https://ru.libretranslate.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: target,
        format: "text",
        alternatives: 0,
        api_key: ""
      }),
      headers: { "Content-Type": "application/json" }
    })

    if (!res.ok) {
      console.error('LibreTranslate error:', res.statusText)
      return text
    }

    const data = await res.json()
    return data.translatedText || text
  } catch (error) {
    console.error('LibreTranslate fetch failed:', error)
    return text
  }
}

/**
 * Пакетный перевод (если потребуется для оптимизации)
 * Пока реализуем через Promise.all для простоты, так как API q может принимать только строку.
 */
export async function translateBatch(texts: string[], target = 'ru'): Promise<string[]> {
  return Promise.all(texts.map(text => translateText(text, target)))
}
