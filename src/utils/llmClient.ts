import type { WordWithExplanation } from '@/types/words'
import { sendBgFetch } from '@/utils/bgFetch'
import { getSettings } from '@/utils/storage'

export const DEFAULT_TEXT = 'Get thrown around until you figure it out.\nA lesson learned through countless times being pinned and twisted on the bed.\nAudin had already subdued Enkrid and, in a deep voice, hummed a tune.\n'
export const CONTRACT_PROMPT_WORDS = 'Return ONLY valid JSON array of objects with fields: original: string, translate: string. "original" — оригинальное английское слово/фраза; "translate" — краткий перевод на русский. No markdown, no code fences, no comments, no extra text.'
export const CONTRACT_PROMPT_ONLY_ORIGINAL = 'Return ONLY valid JSON array of strings. Each string is a hard-to-translate English word or phrase from the text. No markdown, no code fences, no comments, no extra text.'
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
  
  const settings = await getSettings()
  const chunks = splitIntoChunks(text, MAX_TOKENS_PER_REQUEST)
  console.log(`Split text into ${chunks.length} chunks`)
  
  const allResults: WordWithExplanation[] = []

  for (const chunk of chunks) {
    const body = {
      model: settings.llmModel,
      temperature: settings.llmTemperature,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for translators specializing in literary English texts.' },
        { role: 'user', content: `Extract English words and phrases from the text that may be challenging for a ${settings.llmLevel} level learner. For each item, return only two fields: original (the original English word/phrase), translate (short natural Russian translation that fits the narrative context, slightly artistic and engaging rather than literal). Make sure translations are context-aware and suitable for novel readers. Avoid literal word-for-word translations. ${CONTRACT_PROMPT_WORDS}` },
        { role: 'user', content: chunk },
      ],
    }
      console.log('body',body)
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (settings.llmApiKey) {
      headers['Authorization'] = `Bearer ${settings.llmApiKey}`
    }

    const res = await sendBgFetch(`${settings.llmUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
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

export async function extractDifficultWords(text: string, signal?: AbortSignal): Promise<string[]> {
  console.log('extractDifficultWords triggered, text length:', text.length)
  
  const settings = await getSettings()
  const chunks = splitIntoChunks(text, MAX_TOKENS_PER_REQUEST)
  
  const allResults: string[] = []

  for (const chunk of chunks) {
    const body = {
      model: settings.llmModel,
      temperature: settings.llmTemperature,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for translators specializing in literary English texts.' },
        { role: 'user', content: `Extract English words and phrases from the text that may be challenging for a ${settings.llmLevel} level learner. ${CONTRACT_PROMPT_ONLY_ORIGINAL}` },
        { role: 'user', content: chunk },
      ],
    }
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (settings.llmApiKey) {
      headers['Authorization'] = `Bearer ${settings.llmApiKey}`
    }

    const res = await sendBgFetch(`${settings.llmUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }, signal)

    if (!res.ok) {
      console.error(`LLM HTTP Error for chunk: ${res.status}`, res.error)
      continue
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
      const items = parsed.filter((v): v is string => typeof v === 'string')
      allResults.push(...items)
    }
  }

  return Array.from(new Set(allResults.map(s => s.trim()).filter(Boolean)))
}

export async function requestTranslation(target: string, context: string, signal?: AbortSignal): Promise<string> {
  const settings = await getSettings()
  const body = {
    model: settings.llmModel,
    temperature: settings.llmTemperature,
    messages: [
      { role: 'system', content: 'You are a helpful assistant for translators specializing in literary English texts.' },
      { role: 'user', content: 'Given the provided context text, provide a short, natural Russian translation of the given English word or phrase that fits the context. Return ONLY the translation as plain text, no explanations, no quotes, no markdown.' },
      { role: 'user', content: `Word/Phrase: ${target}` },
      { role: 'user', content: `Context:\n${context}` },
    ],
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (settings.llmApiKey) {
    headers['Authorization'] = `Bearer ${settings.llmApiKey}`
  }

  const res = await sendBgFetch(`${settings.llmUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
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
