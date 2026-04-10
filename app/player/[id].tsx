import React, { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { fetchSessionById, fetchSessionsByTopic, fetchTopicById } from '@/lib/content'
import { PlayerControls } from '@/components/player/PlayerControls'
import { colors, spacing } from '@/constants/theme'
import { useAudio } from '@/hooks/useAudio'
import { useProgress } from '@/hooks/useProgress'
import { useFavorites } from '@/hooks/useFavorites'
import i18n from '@/lib/i18n'
import type { Session, Topic } from '@/types'
import type { Locale } from '@/types'

const REWIND_MS = 15_000

const DEMO_SESSION: Session = {
  id: 'demo',
  topic_id: 'demo-topic',
  order_index: 1,
  duration: 180,
  cover_url: 'https://picsum.photos/seed/demo-player/900/900',
  translations: {
    ru: {
      title: 'Демо-аудио (без базы)',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    en: {
      title: 'Demo audio (without DB)',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    es: {
      title: 'Audio de prueba (sin BD)',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    ca: {
      title: 'Audio de prova (sense BD)',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
  },
}

export default function PlayerScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: 'meditations' | 'music' }>()
  const { t } = useTranslation('common')
  const navigation = useNavigation()
  const [session, setSession] = useState<Session | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [topicSessions, setTopicSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markedComplete, setMarkedComplete] = useState(false)
  const [isLoopEnabled, setIsLoopEnabled] = useState(false)
  const [shouldAutoplay, setShouldAutoplay] = useState(false)
  const endHandledRef = useRef(false)

  const locale = (i18n.language as Locale) ?? 'ru'
  const audioUrl = session?.translations[locale]?.audio_url ?? null
  const currentTranslation = session?.translations[locale] ?? session?.translations.ru
  const coverUrl = topic?.cover_url ?? session?.cover_url ?? 'https://picsum.photos/seed/player-default/900/900'

  const { isPlaying, position, duration, play, pause, seek } = useAudio(audioUrl, {
    title: currentTranslation?.title,
    artist: 'Psyche',
    artworkUrl: coverUrl,
  })
  const { isCompleted, markComplete } = useProgress()
  const { isFavorite, toggle } = useFavorites()
  const currentTrackIndex = useMemo(
    () => topicSessions.findIndex((item) => item.id === session?.id),
    [topicSessions, session?.id],
  )
  const previousTrackId = currentTrackIndex > 0 ? topicSessions[currentTrackIndex - 1]?.id : null
  const nextTrackId =
    currentTrackIndex >= 0 && currentTrackIndex < topicSessions.length - 1
      ? topicSessions[currentTrackIndex + 1]?.id
      : null
  const breadcrumbRootLabel = source === 'music' ? 'Музыка' : 'Медитации'
  const breadcrumbSection = source === 'music' ? 'music' : 'meditations'

  const handleHeaderBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
      return
    }
    router.replace('/(tabs)')
  }, [navigation])

  useLayoutEffect(() => {
    const topicTitle = topic?.translations[locale]?.title ?? topic?.translations.ru?.title ?? 'Тема'
    const sessionTitle = session?.translations[locale]?.title ?? session?.translations.ru?.title ?? 'Сессия'

    navigation.setOptions({
      title: '',
      headerBackVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={handleHeaderBack} style={styles.headerBackButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerBreadcrumbs}>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(tabs)', params: { section: breadcrumbSection } })
            }
          >
            <Text style={styles.headerBreadcrumbLink}>{breadcrumbRootLabel}</Text>
          </TouchableOpacity>
          {source !== 'music' && (
            <>
              <Text style={styles.headerBreadcrumbSeparator}>/</Text>
              {topic?.id ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/topic/[id]',
                      params: { id: topic.id, source: 'meditations' },
                    })
                  }
                >
                  <Text style={styles.headerBreadcrumbLink} numberOfLines={1}>
                    {topicTitle}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.headerBreadcrumbLink} numberOfLines={1}>
                  {topicTitle}
                </Text>
              )}
            </>
          )}
          <Text style={styles.headerBreadcrumbSeparator}>/</Text>
          <Text style={styles.headerBreadcrumbCurrent} numberOfLines={1}>
            {sessionTitle}
          </Text>
        </View>
      ),
    })
  }, [session, topic, locale, navigation, breadcrumbRootLabel, breadcrumbSection, source, handleHeaderBack])

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)
      setError(null)
      if (id === 'demo') {
        setSession(DEMO_SESSION)
        setTopic(null)
        setTopicSessions([DEMO_SESSION])
        setLoading(false)
        return
      }

      try {
        const data = await fetchSessionById(id)
        setSession(data)
        if (data?.topic_id) {
          const [topicData, sessionsData] = await Promise.all([
            fetchTopicById(data.topic_id),
            fetchSessionsByTopic(data.topic_id),
          ])
          setTopic(topicData)
          setTopicSessions(sessionsData)
        } else {
          setTopic(null)
          setTopicSessions([])
        }
        setError(data ? null : t('error'))
      } catch (err) {
        setTopic(null)
        setTopicSessions([])
        setError(err instanceof Error ? err.message : t('error'))
      }
      setLoading(false)
    }
    fetchSession()
  }, [id, t])

  useEffect(() => {
    setMarkedComplete(false)
    endHandledRef.current = false
  }, [session?.id])

  useEffect(() => {
    if (!session || markedComplete) return
    if (duration > 0 && position >= duration - 1000) {
      markComplete(session.id)
      setMarkedComplete(true)
    }
  }, [position, duration, session, markedComplete, markComplete])

  useEffect(() => {
    if (!audioUrl || !shouldAutoplay) return
    play()
    setShouldAutoplay(false)
  }, [audioUrl, shouldAutoplay, play])

  useEffect(() => {
    if (!session || duration <= 0) return

    if (position < duration - 1500) {
      endHandledRef.current = false
      return
    }

    if (position < duration - 500 || endHandledRef.current) {
      return
    }

    endHandledRef.current = true

    if (isLoopEnabled) {
      seek(0)
        .then(() => {
          play()
        })
        .catch(() => undefined)
      return
    }

    if (nextTrackId) {
      setShouldAutoplay(true)
      router.replace({ pathname: '/player/[id]', params: { id: nextTrackId, source } })
    }
  }, [duration, isLoopEnabled, nextTrackId, play, position, seek, session, source])

  const handleRewindBack = useCallback(() => {
    seek(Math.max(0, position - REWIND_MS))
  }, [position, seek])

  const handleRewindForward = useCallback(() => {
    seek(Math.min(duration, position + REWIND_MS))
  }, [duration, position, seek])

  const handlePreviousTrack = useCallback(() => {
    if (!previousTrackId) return
    setShouldAutoplay(true)
    router.replace({ pathname: '/player/[id]', params: { id: previousTrackId, source } })
  }, [previousTrackId, source])

  const handleNextTrack = useCallback(() => {
    if (!nextTrackId) return
    setShouldAutoplay(true)
    router.replace({ pathname: '/player/[id]', params: { id: nextTrackId, source } })
  }, [nextTrackId, source])

  const handleToggleLoop = useCallback(() => {
    setIsLoopEnabled((current) => !current)
  }, [])

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    )
  }

  if (error || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('error')}</Text>
      </View>
    )
  }

  const translation = currentTranslation ?? session.translations.ru
  const completed = isCompleted(session.id)

  return (
    <View style={styles.container}>
      <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="cover" />
      <Text style={styles.title}>{translation.title}</Text>

      {completed && (
        <Text style={styles.completedBadge}>{t('completed')}</Text>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatMs(position)}</Text>
          <Text style={styles.timeText}>{formatMs(duration)}</Text>
        </View>
      </View>

      <PlayerControls
        isPlaying={isPlaying}
        isFavorite={isFavorite(session.id)}
        isLoopEnabled={isLoopEnabled}
        hasPreviousTrack={Boolean(previousTrackId)}
        hasNextTrack={Boolean(nextTrackId)}
        onPlay={play}
        onPause={pause}
        onRewindBack={handleRewindBack}
        onRewindForward={handleRewindForward}
        onPreviousTrack={handlePreviousTrack}
        onNextTrack={handleNextTrack}
        onToggleLoop={handleToggleLoop}
        onToggleFavorite={() => toggle(session.id)}
      />
    </View>
  )
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    padding: spacing.xl,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: spacing.lg,
    backgroundColor: colors.bg.secondary,
  },
  completedBadge: {
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  progressContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.accent.muted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  headerBackButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  headerBreadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  headerBreadcrumbLink: {
    color: colors.accent.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  headerBreadcrumbSeparator: {
    color: colors.text.muted,
    fontSize: 13,
  },
  headerBreadcrumbCurrent: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: 13,
  },
})
