import type { WordWithExplanation } from '@/types/words'
import { sendBgFetch } from '@/utils/bgFetch'

export const BASE_URL = 'http://192.168.0.11:1234'
export const MODEL = 'gpt-oss'
export const DEFAULT_TEXT = 'Get thrown around until you figure it out.\nA lesson learned through countless times being pinned and twisted on the bed.\nAudin had already subdued Enkrid and, in a deep voice, hummed a tune.\n'
export const CONTRACT_PROMPT_WORDS = 'Return ONLY valid JSON array of objects with fields: original: string, translate: string. "original" — оригинальное английское слово/фраза; "translate" — краткий перевод на русский. No markdown, no code fences, no comments, no extra text.'
const MAX_TOKENS_PER_REQUEST = 1500

// Минимальный контракт LLM-ответа
export type LlmChoice = { message?: { role?: string; content?: string } }
export type LlmResponse = { choices?: LlmChoice[] }

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null
}
function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}
function hasChoices(val: unknown): val is { choices: unknown } {
  return isObject(val) && 'choices' in val
}

/**
 * Разбивает текст на чанки примерно по количеству токенов.
 * Т.к. токенизатор может быть разным, используем примерную оценку (1 токен ~ 4 символа для английского текста).
 * Для надежности берем запас.
 */
function splitIntoChunks(text: string, maxTokens: number): string[] {
  const charsPerToken = 4
  const maxChars = maxTokens * charsPerToken
  const chunks: string[] = []
  let currentPos = 0

  while (currentPos < text.length) {
    let endPos = currentPos + maxChars
    if (endPos < text.length) {
      // Пытаемся найти конец предложения или хотя бы пробел, чтобы не резать посередине слова
      const lastNewline = text.lastIndexOf('\n', endPos)
      const lastPeriod = text.lastIndexOf('. ', endPos)
      const lastSpace = text.lastIndexOf(' ', endPos)

      if (lastNewline > currentPos) {
        endPos = lastNewline + 1
      } else if (lastPeriod > currentPos) {
        endPos = lastPeriod + 1
      } else if (lastSpace > currentPos) {
        endPos = lastSpace + 1
      }
    }
    chunks.push(text.substring(currentPos, endPos))
    currentPos = endPos
  }

  return chunks
}

export async function requestDifficultWords(text: string, signal?: AbortSignal): Promise<WordWithExplanation[]> {
  console.log('requestDifficultWords triggered, text length:', text.length)
  
  const chunks = splitIntoChunks(text, MAX_TOKENS_PER_REQUEST)
  console.log(`Split text into ${chunks.length} chunks`)
  
  const allResults: WordWithExplanation[] = []

  for (const chunk of chunks) {
    const body = {
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for translators.' },
        { role: 'user', content: `Extract hard-to-translate English words and phrases from the text. For each item return fields: original (the original English word/phrase), translate (short Russian translation). ${CONTRACT_PROMPT_WORDS}` },
        { role: 'user', content: chunk },
      ],
    }
      console.log('body',body)
    const res = await sendBgFetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, signal)

    if (!res.ok) {
      console.error(`LLM HTTP Error for chunk: ${res.status}`, res.error)
      continue // Продолжаем со следующим чанком вместо полного падения
    }

    const data: unknown = isObject(res.data) ? res.data : undefined
    if (!isObject(data)) continue
    const choicesUnknown = hasChoices(data) ? data.choices : undefined
    const choices = Array.isArray(choicesUnknown) ? choicesUnknown : []
    const first = choices[0]
    const content = isObject(first) && isObject(first.message) && typeof first.message.content === 'string'
      ? first.message.content
      : ''

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = []
    }
    
    if (isArray(parsed)) {
      const items: WordWithExplanation[] = parsed
        .filter(isObject)
        .map((o) => {
          const originalRaw = o['original']
          const translateRaw = o['translate']
          const original = typeof originalRaw === 'string' ? originalRaw : ''
          const translate = typeof translateRaw === 'string' ? translateRaw : ''
          return original && translate ? { original, translate } : undefined
        })
        .filter((v): v is WordWithExplanation => typeof v !== 'undefined')
      
      allResults.push(...items)
    }
  }

  // Удаляем дубликаты по полю original
  const uniqueResults = Array.from(new Map(allResults.map(item => [item.original.toLowerCase(), item])).values())

  return uniqueResults
}

export async function requestExplanation(target: string, context: string, signal?: AbortSignal): Promise<string> {
  const body = {
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You are a helpful assistant for translators.' },
      { role: 'user', content: 'Given the provided context text, explain briefly in Russian (1–2 sentences) the meaning/usage/nuance of the given English word or phrase. Return ONLY plain Russian text without quotes, markdown, code fences, or extra commentary.' },
      { role: 'user', content: `Word/Phrase: ${target}` },
      { role: 'user', content: `Context:\n${context}` },
    ],
  }

  const res = await sendBgFetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, signal)

  if (!res.ok) {
    throw new Error(`LLM HTTP ${res.status}${res.error ? `: ${res.error}` : ''}`)
  }
  const data: unknown = isObject(res.data) ? res.data : undefined
  if (!isObject(data)) return ''
  const choicesUnknown = hasChoices(data) ? data.choices : undefined
  const choices = Array.isArray(choicesUnknown) ? choicesUnknown : []
  const first = choices[0]
  const content = isObject(first) && isObject(first.message) && typeof first.message.content === 'string'
    ? first.message.content
    : ''

  return typeof content === 'string' ? content.trim() : ''
}
