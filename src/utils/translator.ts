/**
 * Клиент для Yandex Translate API
 */

import { sendBgFetch } from './bgFetch'

const FOLDER_ID = import.meta.env.VITE_YANDEX_FOLDER_ID
const API_KEY = import.meta.env.VITE_YANDEX_API_KEY

function isYandexResponse(data: unknown): data is YandexTranslateResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'translations' in data &&
    Array.isArray((data as YandexTranslateResponse).translations)
  )
}

interface YandexTranslateResponse {
  translations: Array<{
    text: string
    detectedLanguageCode: string
  }>
}

async function yandexFetch(texts: string[], target: string, source?: string): Promise<string[]> {
  try {
    const body: Record<string, unknown> = {
      folderId: FOLDER_ID,
      texts: texts,
      targetLanguageCode: target
    }
    
    if (source) {
      body.sourceLanguageCode = source
    }

    const res = await sendBgFetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${API_KEY}`
      },
      body: JSON.stringify(body)
    }, undefined, 'translate/fetch')

    if (!res.ok) {
      console.error('Yandex Translate error:', res.error || res.status)
      return texts
    }

    const data = res.data
    if (isYandexResponse(data)) {
      return data.translations.map(t => t.text)
    }
    return texts
  } catch (error) {
    console.error('Yandex Translate fetch failed:', error)
    return texts
  }
}

export async function translateText(text: string, target = 'ru', source?: string): Promise<string> {
  if (!text) return ''
  const results = await yandexFetch([text], target, source)
  return results[0] || text
}

/**
 * Пакетный перевод через Yandex Translate API
 */
export async function translateBatch(texts: string[], target = 'ru', source?: string): Promise<string[]> {
  if (!texts.length) return []
  return yandexFetch(texts, target, source)
}
