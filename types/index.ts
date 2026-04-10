export type Locale = 'ru' | 'en' | 'es' | 'ca'

export interface ContentType {
  id: string
  slug: string
  order_index: number
  cover_url?: string
  translations: Record<Locale, { title: string; description: string }>
}

export interface Topic {
  id: string
  content_type_id: string
  content_type_slug?: string
  slug: string
  order_index: number
  icon_url?: string
  cover_url?: string
  translations: Record<Locale, { title: string; description: string }>
  sessions?: Session[]
}

export interface Session {
  id: string
  topic_id: string
  order_index: number
  duration: number
  icon_url?: string
  cover_url?: string
  translations: Record<Locale, { title: string; audio_url: string }>
}

export interface UserProgress {
  session_id: string
  completed_at: string
}

export interface UserFavorite {
  session_id: string
  added_at: string
}
