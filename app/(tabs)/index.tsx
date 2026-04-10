import React, { useEffect, useState, useCallback, useLayoutEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { fetchTopicsWithSessions } from '@/lib/content'
import { supabase } from '@/lib/supabase'
import { TopicCard } from '@/components/topic/TopicCard'
import { colors, spacing } from '@/constants/theme'
import { useProgress } from '@/hooks/useProgress'
import type { Topic, Session, ContentType } from '@/types'
import type { Locale } from '@/types'

const LOCALES: Locale[] = ['ru', 'en', 'es', 'ca']
type HomeSection = string

type LocalizedText = Record<Locale, { title: string; description: string }>

interface ContentTypeWithTranslations extends ContentType {
  topics: Topic[]
  sectionKey: string
}

const SECTION_TITLES: Record<'meditations' | 'music', Record<Locale, string>> = {
  meditations: {
    ru: 'Медитации',
    en: 'Meditations',
    es: 'Meditaciones',
    ca: 'Meditacions',
  },
  music: {
    ru: 'Фоновая музыка',
    en: 'Background music',
    es: 'Musica de fondo',
    ca: 'Musica de fons',
  },
}

const MUSIC_KEYWORDS = ['music', 'audio', 'sound', 'ambient', 'bg', 'фонов', 'музык']

function humanizeText(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return Boolean(value) && typeof value === 'object'
}

function looksLikeIdentifier(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  const normalized = trimmed.replace(/[\s\-\n]+/g, '-')
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidPattern.test(normalized)) return true
  if (/^[0-9a-f]{24,}$/i.test(normalized)) return true
  if (/^[0-9a-f]{8}\s[0-9a-f]{4}\s[0-9a-f]{4}\s[0-9a-f]{4}\s[0-9a-f]{12}$/i.test(trimmed)) return true
  return false
}

function inferSectionKey(contentType: { slug?: string; id: string; translations?: unknown }): string {
  const slug = (contentType.slug ?? '').toLowerCase()
  const id = (contentType.id ?? '').toLowerCase()
  const bySlug = MUSIC_KEYWORDS.some((keyword) => slug.includes(keyword) || id.includes(keyword))
  if (bySlug) return 'music'

  if (isLocalizedText(contentType.translations)) {
    const titles = Object.values(contentType.translations)
      .map((value) => value?.title?.toLowerCase?.() ?? '')
      .join(' ')
    const byTitle = MUSIC_KEYWORDS.some((keyword) => titles.includes(keyword))
    if (byTitle) return 'music'
  }

  return 'meditations'
}

function getSectionTitle(contentType: ContentTypeWithTranslations, locale: Locale): string {
  const fromTranslations = contentType.translations?.[locale]?.title ?? contentType.translations?.ru?.title
  if (fromTranslations && fromTranslations.trim().length > 0 && !looksLikeIdentifier(fromTranslations)) {
    return fromTranslations
  }

  if (contentType.sectionKey === 'music') {
    return SECTION_TITLES.music[locale]
  }

  return SECTION_TITLES.meditations[locale]
}

function getTrackTitle(session: Session, locale: Locale): string {
  return session.translations[locale]?.title ?? session.translations.ru?.title ?? session.id
}

export default function HomeScreen() {
  const { section } = useLocalSearchParams<{ section?: HomeSection }>()
  const { t } = useTranslation('common')
  const navigation = useNavigation()
  const [topics, setTopics] = useState<Topic[]>([])
  const [contentTypes, setContentTypes] = useState<ContentTypeWithTranslations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>((i18n.language as Locale) ?? 'ru')
  const { isCompleted } = useProgress()
  const scrollRef = useRef<ScrollView>(null)
  const sectionOffsets = useRef<Record<HomeSection, number>>({})

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [topicsData, contentTypesResult] = await Promise.all([
        fetchTopicsWithSessions(),
        supabase.from('content_types').select('*').order('order_index', { ascending: true }),
      ])

      if (contentTypesResult.error) {
        throw new Error(contentTypesResult.error.message)
      }

      const allContentTypes = (contentTypesResult.data ?? []) as Array<
        Omit<ContentType, 'translations'> & { translations?: ContentType['translations'] | null }
      >

      const groupedByTypeMap = new Map<string, ContentTypeWithTranslations>()

      for (const ct of allContentTypes) {
        const safeTranslations = isLocalizedText(ct.translations)
          ? ct.translations
          : {
              ru: { title: '', description: '' },
              en: { title: '', description: '' },
              es: { title: '', description: '' },
              ca: { title: '', description: '' },
            }

        groupedByTypeMap.set(ct.id, {
          ...ct,
          translations: safeTranslations,
          sectionKey: inferSectionKey(ct),
          topics: [],
        })
      }

      for (const topic of topicsData) {
        const existing = groupedByTypeMap.get(topic.content_type_id)
        if (existing) {
          existing.topics.push(topic)
          continue
        }

        const fallbackSlug = topic.content_type_slug ?? topic.content_type_id
        const fallbackTitle = humanizeText(fallbackSlug)
        const fallbackSection = inferSectionKey({
          id: topic.content_type_id,
          slug: fallbackSlug,
          translations: undefined,
        })

        groupedByTypeMap.set(topic.content_type_id, {
          id: topic.content_type_id,
          slug: fallbackSlug,
          order_index: Number.MAX_SAFE_INTEGER,
          cover_url: undefined,
          sectionKey: fallbackSection,
          translations: {
            ru: { title: fallbackTitle, description: '' },
            en: { title: fallbackTitle, description: '' },
            es: { title: fallbackTitle, description: '' },
            ca: { title: fallbackTitle, description: '' },
          },
          topics: [topic],
        })
      }

      const groupedByType = Array.from(groupedByTypeMap.values()).sort(
        (a, b) => a.order_index - b.order_index,
      )

      const normalizedGrouped = groupedByType.filter((ct) => ct.topics.length > 0)
      const hasMusicSection = normalizedGrouped.some((ct) => ct.sectionKey === 'music')

      if (!hasMusicSection && normalizedGrouped.length === 2) {
        normalizedGrouped[0].sectionKey = 'meditations'
        normalizedGrouped[1].sectionKey = 'music'
      }

      setTopics(topicsData)
      setContentTypes(groupedByType)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
    setLoading(false)
  }, [t])

  const cycleLocale = useCallback(() => {
    const idx = LOCALES.indexOf(locale)
    const next = LOCALES[(idx + 1) % LOCALES.length]
    setLocale(next)
    i18n.changeLanguage(next)
  }, [locale])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={cycleLocale} style={styles.langToggle}>
          <Text style={styles.langText}>{locale.toUpperCase()}</Text>
        </TouchableOpacity>
      ),
    })
  }, [locale, cycleLocale, navigation])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  useEffect(() => {
    if (!section) return

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, sectionOffsets.current[section] - spacing.lg),
        animated: true,
      })
    })
  }, [section, topics.length])

  const setSectionOffset = useCallback((key: HomeSection, y: number) => {
    sectionOffsets.current[key] = y
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('error')}</Text>
        <TouchableOpacity onPress={fetchTopics}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/player/demo')} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Открыть демо-аудио</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (topics.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>В базе пока нет данных</Text>
        <TouchableOpacity onPress={() => router.push('/player/demo')} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Проверить плеер на демо-аудио</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchTopics}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Filter out empty content types
  const activeContentTypes = contentTypes.filter((ct) => ct.topics.length > 0)

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        {activeContentTypes.map((contentType) => {
          const sectionId = contentType.id
          const sectionTitle = getSectionTitle(contentType, locale)
          const isMusicSection = contentType.sectionKey === 'music'
          const allTracks = contentType.topics.flatMap((topic) => topic.sessions ?? [])

          return (
            <View key={contentType.id}>
              <Text
                style={styles.sectionTitle}
                onLayout={(event) => {
                  const y = event.nativeEvent.layout.y
                  setSectionOffset(sectionId, y)
                  setSectionOffset(contentType.slug, y)
                  setSectionOffset(contentType.sectionKey, y)
                }}
              >
                {sectionTitle}
              </Text>
              {isMusicSection ? (
                <View style={styles.tracksGrid}>
                  {allTracks.map((track) => {
                    const minutes = Math.max(1, Math.round(track.duration / 60))
                    const topicCover = contentType.topics.find((t) => t.id === track.topic_id)?.cover_url
                    const coverUrl = track.icon_url ?? track.cover_url ?? topicCover ?? 'https://picsum.photos/seed/music-default/300/300'
                    return (
                      <TouchableOpacity
                        key={track.id}
                        style={styles.trackCell}
                        activeOpacity={0.85}
                        onPress={() =>
                          router.push({
                            pathname: '/player/[id]',
                            params: { id: track.id, source: 'music' },
                          })
                        }
                      >
                        <View style={styles.trackCoverWrap}>
                          <Image
                            source={{ uri: coverUrl }}
                            style={styles.trackCoverImage}
                            resizeMode="cover"
                          />
                          <View style={styles.trackMeta}>
                            <Text style={styles.trackTitle} numberOfLines={2}>
                              {getTrackTitle(track, locale)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ) : (
                <View style={styles.topicsGrid}>
                  {contentType.topics.map((item) => {
                    const sessions = item.sessions ?? []
                    const completedCount = sessions.filter((s) => isCompleted(s.id)).length
                    return (
                      <View key={item.id} style={styles.topicCell}>
                        <TopicCard
                          topic={item}
                          completed={completedCount}
                          total={sessions.length}
                          locale={locale}
                          onPress={() =>
                            router.push({
                              pathname: '/topic/[id]',
                              params: { id: item.id, source: contentType.slug },
                            })
                          }
                        />
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  retryText: {
    color: colors.accent.primary,
    fontSize: 16,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  topicCell: {
    width: '48.5%',
    marginBottom: spacing.sm,
  },
  tracksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  trackCell: {
    width: '31%',
  },
  trackCoverWrap: {
    backgroundColor: colors.bg.elevated,
    borderRadius: spacing.xxl,
    margin: 4,
    padding: 8,
    overflow: 'hidden',
  },
  trackCoverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: spacing.xxl,
    backgroundColor: colors.bg.secondary,
  },
  trackMeta: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 24,
  },
  trackTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    padding: spacing.xs,
  },
  demoButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  demoButtonText: {
    color: colors.bg.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  langToggle: {
    marginRight: spacing.md,
    backgroundColor: colors.bg.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  langText: {
    color: colors.accent.primary,
    fontWeight: '700',
    fontSize: 13,
  },
})
