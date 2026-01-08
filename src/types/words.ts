export interface WordEntry {
  id: string
  original: string
  translate: string
  explanation?: string
  context?: string
  createdAt: number
}

export interface AppSettings {
  parsingMode: 'visible' | 'full'
  autoAnalysis: boolean
  containerPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  llmUrl: string
  llmApiKey: string
  llmModel: string
}

export interface StorageSchema {
  dictionary: WordEntry[]
  settings: AppSettings
}

export interface WordWithExplanation {
  original: string
  translate: string
  explanation?: string
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
