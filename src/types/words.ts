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
