import { supabase } from '@/lib/supabase'
import type { Locale, Session, Topic } from '@/types'

const MUSIC_SECTION_KEYWORDS = ['music', 'audio', 'sound', 'ambient', 'background', 'фон', 'музык']
let cachedTopicsWithSessions: Topic[] = []

type TopicRow = {
  id: string
  content_type_id: string
  content_types?: { slug?: string | null } | Array<{ slug?: string | null }> | null
  slug: string
  order_index: number
  icon_url?: string | null
  cover_url?: string | null
  image_url?: string | null
  translations?: Topic['translations']
}

type SessionRow = {
  id: string
  topic_id: string
  order_index: number
  duration: number
  icon_url?: string | null
  cover_url?: string | null
  image_url?: string | null
  audio_url?: string | null
  translations?: Session['translations']
}

type TopicTranslationRow = {
  topic_id: string
  locale: string
  title: string
  description: string
}

type SessionTranslationRow = {
  session_id: string
  locale: string
  title: string
  audio_url: string
  icon_url?: string | null
}

const SUPPORTED_LOCALES: Locale[] = ['ru', 'en', 'es', 'ca']

function emptyTopicTranslations(fallbackTitle: string, fallbackDescription = ''): Topic['translations'] {
  return {
    ru: { title: fallbackTitle, description: fallbackDescription },
    en: { title: fallbackTitle, description: fallbackDescription },
    es: { title: fallbackTitle, description: fallbackDescription },
    ca: { title: fallbackTitle, description: fallbackDescription },
  }
}

function emptySessionTranslations(fallbackTitle: string, fallbackAudioUrl = ''): Session['translations'] {
  return {
    ru: { title: fallbackTitle, audio_url: fallbackAudioUrl },
    en: { title: fallbackTitle, audio_url: fallbackAudioUrl },
    es: { title: fallbackTitle, audio_url: fallbackAudioUrl },
    ca: { title: fallbackTitle, audio_url: fallbackAudioUrl },
  }
}

function toLocale(locale: string): Locale | null {
  return SUPPORTED_LOCALES.includes(locale as Locale) ? (locale as Locale) : null
}

function matchesMusicSection(value?: string): boolean {
  if (!value) return false
  const normalizedValue = value.trim().toLowerCase()
  return MUSIC_SECTION_KEYWORDS.some((keyword) => normalizedValue.includes(keyword))
}

function isMusicTopic(topic: Topic): boolean {
  if (matchesMusicSection(topic.slug) || matchesMusicSection(topic.content_type_slug)) {
    return true
  }

  return Object.values(topic.translations).some(
    (translation) =>
      matchesMusicSection(translation.title) || matchesMusicSection(translation.description),
  )
}

function flattenTopicSessions(topics: Topic[]): Session[] {
  return topics
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .flatMap((topic) => (topic.sessions ?? []).slice().sort((a, b) => a.order_index - b.order_index))
}

function pickMusicTopics(topics: Topic[]): Topic[] {
  const directMatches = topics.filter((topic) => isMusicTopic(topic))
  if (directMatches.length > 0) return directMatches

  const groups = new Map<string, Topic[]>()
  for (const topic of topics) {
    const existing = groups.get(topic.content_type_id) ?? []
    existing.push(topic)
    groups.set(topic.content_type_id, existing)
  }

  if (groups.size === 2) {
    const orderedGroups = Array.from(groups.values())
    return orderedGroups[1] ?? []
  }

  return []
}

export function getCachedMusicSessions(): Session[] {
  return flattenTopicSessions(pickMusicTopics(cachedTopicsWithSessions))
}

function normalizeTopic(
  topic: TopicRow,
  topicTranslations: TopicTranslationRow[],
  sessions: Session[],
): Topic {
  const contentTypeSlug = Array.isArray(topic.content_types)
    ? (topic.content_types[0]?.slug ?? undefined)
    : (topic.content_types?.slug ?? undefined)
  const base = emptyTopicTranslations(topic.slug)

  if (topic.translations) {
    return {
      id: topic.id,
      content_type_id: topic.content_type_id,
      content_type_slug: contentTypeSlug,
      slug: topic.slug,
      order_index: topic.order_index,
      icon_url: topic.icon_url ?? undefined,
      cover_url: topic.cover_url ?? topic.image_url ?? undefined,
      translations: topic.translations,
      sessions,
    }
  }

  for (const tr of topicTranslations) {
    const locale = toLocale(tr.locale)
    if (!locale) continue
    base[locale] = {
      title: tr.title,
      description: tr.description,
    }
  }

  return {
    id: topic.id,
    content_type_id: topic.content_type_id,
    content_type_slug: contentTypeSlug,
    slug: topic.slug,
    order_index: topic.order_index,
    icon_url: topic.icon_url ?? undefined,
    cover_url: topic.cover_url ?? topic.image_url ?? undefined,
    translations: base,
    sessions,
  }
}

function normalizeSession(
  session: SessionRow,
  sessionTranslations: SessionTranslationRow[],
): Session {
  const base = emptySessionTranslations(session.id, session.audio_url ?? '')
  let iconUrlFromTranslation: string | undefined

  if (session.translations) {
    return {
      id: session.id,
      topic_id: session.topic_id,
      order_index: session.order_index,
      duration: session.duration,
      icon_url: session.icon_url ?? undefined,
      cover_url: session.cover_url ?? session.image_url ?? undefined,
      translations: session.translations,
    }
  }

  for (const tr of sessionTranslations) {
    const locale = toLocale(tr.locale)
    if (!locale) continue
    base[locale] = {
      title: tr.title,
      audio_url: tr.audio_url,
    }
    if (tr.icon_url && !iconUrlFromTranslation) {
      iconUrlFromTranslation = tr.icon_url
    }
  }

  return {
    id: session.id,
    topic_id: session.topic_id,
    order_index: session.order_index,
    duration: session.duration,
    icon_url: iconUrlFromTranslation ?? session.icon_url ?? undefined,
    cover_url: session.cover_url ?? session.image_url ?? undefined,
    translations: base,
  }
}

async function fetchTopicTranslations(topicIds: string[]): Promise<TopicTranslationRow[]> {
  if (topicIds.length === 0) return []
  const { data, error } = await supabase
    .from('topic_translations')
    .select('topic_id, locale, title, description')
    .in('topic_id', topicIds)

  if (error) return []
  return (data ?? []) as TopicTranslationRow[]
}

async function fetchSessionTranslations(sessionIds: string[]): Promise<SessionTranslationRow[]> {
  if (sessionIds.length === 0) return []
  const { data, error } = await supabase
    .from('session_translations')
    .select('session_id, locale, title, audio_url, icon_url')
    .in('session_id', sessionIds)

  if (error) return []
  return (data ?? []) as SessionTranslationRow[]
}

export async function fetchTopicsWithSessions(): Promise<Topic[]> {
  const { data: topicsData, error: topicsError } = await supabase
    .from('topics')
    .select('*, content_types(slug)')
    .order('order_index')

  if (topicsError) throw new Error(topicsError.message)

  const topics = (topicsData ?? []) as TopicRow[]
  if (topics.length === 0) return []

  const topicIds = topics.map((t) => t.id)
  const { data: sessionsData, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .in('topic_id', topicIds)
    .order('order_index')

  if (sessionsError) throw new Error(sessionsError.message)

  const sessionsRows = (sessionsData ?? []) as SessionRow[]
  const sessionIds = sessionsRows.map((s) => s.id)

  const [topicTranslations, sessionTranslations] = await Promise.all([
    fetchTopicTranslations(topicIds),
    fetchSessionTranslations(sessionIds),
  ])

  const topicTranslationsByTopicId = new Map<string, TopicTranslationRow[]>()
  for (const tr of topicTranslations) {
    const existing = topicTranslationsByTopicId.get(tr.topic_id) ?? []
    existing.push(tr)
    topicTranslationsByTopicId.set(tr.topic_id, existing)
  }

  const sessionTranslationsBySessionId = new Map<string, SessionTranslationRow[]>()
  for (const tr of sessionTranslations) {
    const existing = sessionTranslationsBySessionId.get(tr.session_id) ?? []
    existing.push(tr)
    sessionTranslationsBySessionId.set(tr.session_id, existing)
  }

  const normalizedSessions = sessionsRows.map((s) =>
    normalizeSession(s, sessionTranslationsBySessionId.get(s.id) ?? []),
  )

  const sessionsByTopicId = new Map<string, Session[]>()
  for (const session of normalizedSessions) {
    const existing = sessionsByTopicId.get(session.topic_id) ?? []
    existing.push(session)
    sessionsByTopicId.set(session.topic_id, existing)
  }

  const normalizedTopics = topics.map((topic) =>
    normalizeTopic(
      topic,
      topicTranslationsByTopicId.get(topic.id) ?? [],
      sessionsByTopicId.get(topic.id) ?? [],
    ),
  )

  cachedTopicsWithSessions = normalizedTopics
  return normalizedTopics
}

export async function fetchSessionsByTopic(topicId: string): Promise<Session[]> {
  const { data: sessionsData, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('topic_id', topicId)
    .order('order_index')

  if (sessionsError) throw new Error(sessionsError.message)

  const sessionsRows = (sessionsData ?? []) as SessionRow[]
  const sessionIds = sessionsRows.map((s) => s.id)
  const sessionTranslations = await fetchSessionTranslations(sessionIds)

  const bySession = new Map<string, SessionTranslationRow[]>()
  for (const tr of sessionTranslations) {
    const existing = bySession.get(tr.session_id) ?? []
    existing.push(tr)
    bySession.set(tr.session_id, existing)
  }

  return sessionsRows.map((session) => normalizeSession(session, bySession.get(session.id) ?? []))
}

export async function fetchSessionById(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const session = data as SessionRow
  const translations = await fetchSessionTranslations([session.id])
  return normalizeSession(session, translations)
}

export async function fetchSessionsByContentTypeSlug(slug: string): Promise<Session[]> {
  const topics = cachedTopicsWithSessions.length > 0 ? cachedTopicsWithSessions : await fetchTopicsWithSessions()
  const normalizedSlug = slug.trim().toLowerCase()
  const backgroundKeywords = [normalizedSlug, 'background', 'фон', 'ambient']

  const matchesBackground = (value?: string) => {
    if (!value) return false
    const normalizedValue = value.trim().toLowerCase()
    return backgroundKeywords.some((keyword) => normalizedValue.includes(keyword))
  }

  const matchedTopics = topics.filter((topic) => {
    if (matchesBackground(topic.slug) || matchesBackground(topic.content_type_slug)) {
      return true
    }

    return Object.values(topic.translations).some(
      (translation) =>
        matchesBackground(translation.title) || matchesBackground(translation.description),
    )
  })

  const fallbackTopics =
    matchedTopics.length > 0
      ? matchedTopics
      : topics.filter((topic) => {
          const normalizedContentTypeSlug = topic.content_type_slug?.trim().toLowerCase() ?? ''
          return normalizedContentTypeSlug.includes('music') || normalizedContentTypeSlug.includes('audio')
        })

  const resolvedTopics =
    fallbackTopics.length > 0
      ? fallbackTopics
      : pickMusicTopics(topics)

  return flattenTopicSessions(resolvedTopics)
}

export async function fetchSessionsByIds(ids: string[]): Promise<Session[]> {
  if (ids.length === 0) return []

  const { data: sessionsData, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .in('id', ids)

  if (sessionsError) throw new Error(sessionsError.message)

  const sessionsRows = (sessionsData ?? []) as SessionRow[]
  const sessionIds = sessionsRows.map((s) => s.id)
  const sessionTranslations = await fetchSessionTranslations(sessionIds)

  const bySession = new Map<string, SessionTranslationRow[]>()
  for (const tr of sessionTranslations) {
    const existing = bySession.get(tr.session_id) ?? []
    existing.push(tr)
    bySession.set(tr.session_id, existing)
  }

  const normalized = sessionsRows.map((session) => normalizeSession(session, bySession.get(session.id) ?? []))

  const idOrder = new Map(ids.map((id, index) => [id, index]))
  normalized.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))

  return normalized
}

export async function fetchTopicById(id: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('*, content_types(slug)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const topic = data as TopicRow
  const translations = await fetchTopicTranslations([topic.id])
  return normalizeTopic(topic, translations, [])
}