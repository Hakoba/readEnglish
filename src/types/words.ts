export interface WordEntry {
  id: string
  original: string
  translate: string
  context?: string
  createdAt: number
}

export type TranslationMode = 'llm' | 'yandex'

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface AppSettings {
  parsingMode: 'visible' | 'full'
  translationMode: TranslationMode
  selectionTranslationMode: TranslationMode
  sourceLanguageCode: string
  autoAnalysis: boolean
  containerPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  llmUrl: string
  llmApiKey: string
  llmModel: string
  llmLevel: CefrLevel
  llmTemperature: number
}

export interface StorageSchema {
  dictionary: WordEntry[]
  settings: AppSettings
}

export interface WordWithExplanation {
  original: string
  translate: string
}

export interface AnalysisResult {
  url: string
  words: WordWithExplanation[]
  timestamp: number
}

export interface LocalStorageSchema {
  analysisResults: Record<string, AnalysisResult> // key is URL or unique chapter ID
  lastPopupRoute?: string
}
