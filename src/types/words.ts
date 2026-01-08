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
