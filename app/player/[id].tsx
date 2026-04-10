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
import {
  fetchSessionById,
  fetchSessionsByContentTypeSlug,
  fetchSessionsByTopic,
  fetchTopicById,
  getCachedMusicSessions,
} from '@/lib/content'
import { PlayerControls } from '@/components/player/PlayerControls'
import { colors, spacing } from '@/constants/theme'
import { useAudio } from '@/hooks/useAudio'
import { useProgress } from '@/hooks/useProgress'
import { useFavorites } from '@/hooks/useFavorites'
import { getItem, removeItem, setItem } from '@/lib/storage'
import i18n from '@/lib/i18n'
import type { Session, Topic } from '@/types'
import type { Locale } from '@/types'

const REWIND_MS = 15_000
const BACKGROUND_CONTENT_TYPE_SLUG = 'background'
const BACKGROUND_TRACK_STORAGE_KEY = 'player:selectedBackgroundTrackId'
const MUSIC_DURATION_STORAGE_KEY = 'player:musicDurationMinutes'
const DEFAULT_MUSIC_DURATION_MINUTES = 30
const MUSIC_DURATION_OPTIONS = [15, 30, 45, 60]
const BACKGROUND_TRACK_VOLUME = 0.25
const BACKGROUND_FADE_DURATION_MS = 360
const BACKGROUND_FADE_STEP_MS = 40

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
  const isMusicMode = source === 'music'
  const isMeditationMode = !isMusicMode
  const [session, setSession] = useState<Session | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [topicSessions, setTopicSessions] = useState<Session[]>([])
  const [backgroundTracks, setBackgroundTracks] = useState<Session[]>([])
  const [selectedBackgroundTrackId, setSelectedBackgroundTrackId] = useState<string | null>(null)
  const [backgroundVolume, setBackgroundVolume] = useState(0)
  const [isBackgroundMenuOpen, setIsBackgroundMenuOpen] = useState(false)
  const [selectedMusicDurationMinutes, setSelectedMusicDurationMinutes] = useState(
    DEFAULT_MUSIC_DURATION_MINUTES,
  )
  const [isDurationMenuOpen, setIsDurationMenuOpen] = useState(false)
  const [musicRemainingMs, setMusicRemainingMs] = useState(DEFAULT_MUSIC_DURATION_MINUTES * 60_000)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markedComplete, setMarkedComplete] = useState(false)
  const [isLoopEnabled, setIsLoopEnabled] = useState(false)
  const [shouldAutoplay, setShouldAutoplay] = useState(false)
  const endHandledRef = useRef(false)
  const musicEndAtRef = useRef<number | null>(null)
  const backgroundFadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const backgroundVolumeRef = useRef(0)
  const previousBackgroundAudioUrlRef = useRef<string | null>(null)

  const locale = (i18n.language as Locale) ?? 'ru'
  const audioUrl = session?.translations[locale]?.audio_url ?? null
  const currentTranslation = session?.translations[locale] ?? session?.translations.ru
  const coverUrl = topic?.cover_url ?? session?.cover_url ?? 'https://picsum.photos/seed/player-default/900/900'
  const selectedBackgroundTrack = useMemo(
    () => backgroundTracks.find((track) => track.id === selectedBackgroundTrackId) ?? null,
    [backgroundTracks, selectedBackgroundTrackId],
  )
  const backgroundAudioUrl =
    selectedBackgroundTrack?.translations[locale]?.audio_url ??
    selectedBackgroundTrack?.translations.ru?.audio_url ??
    null
  const selectedDurationMs = selectedMusicDurationMinutes * 60_000
  const durationOptions = useMemo(
    () =>
      MUSIC_DURATION_OPTIONS.map((minutes) => ({
        minutes,
        label: `${minutes} ${t('minutes')}`,
      })),
    [t],
  )

  const { isPlaying, position, duration, play, pause, seek } = useAudio(audioUrl, {
    title: currentTranslation?.title,
    artist: 'Psyche',
    artworkUrl: coverUrl,
  })
  const {
    play: playBackground,
    pause: pauseBackground,
  } = useAudio(
    isMeditationMode ? backgroundAudioUrl : null,
    undefined,
    {
      loop: true,
      volume: backgroundVolume,
      lockScreenEnabled: false,
    },
  )
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
  const backgroundTrackOptions = useMemo(
    () =>
      backgroundTracks.map((track) => ({
        id: track.id,
        title: track.translations[locale]?.title ?? track.translations.ru?.title ?? track.id,
        iconUrl: track.icon_url ?? track.cover_url,
      })),
    [backgroundTracks, locale],
  )

  const stopBackgroundFade = useCallback(() => {
    if (backgroundFadeIntervalRef.current) {
      clearInterval(backgroundFadeIntervalRef.current)
      backgroundFadeIntervalRef.current = null
    }
  }, [])

  const fadeBackgroundVolume = useCallback((target: number, onComplete?: () => void) => {
    const clampedTarget = Math.max(0, Math.min(1, target))
    const startVolume = backgroundVolumeRef.current

    stopBackgroundFade()

    if (Math.abs(startVolume - clampedTarget) < 0.01) {
      setBackgroundVolume(clampedTarget)
      backgroundVolumeRef.current = clampedTarget
      onComplete?.()
      return
    }

    const stepCount = Math.max(1, Math.round(BACKGROUND_FADE_DURATION_MS / BACKGROUND_FADE_STEP_MS))
    let currentStep = 0

    backgroundFadeIntervalRef.current = setInterval(() => {
      currentStep += 1
      const progress = Math.min(1, currentStep / stepCount)
      const nextVolume = startVolume + (clampedTarget - startVolume) * progress

      setBackgroundVolume(nextVolume)
      backgroundVolumeRef.current = nextVolume

      if (progress >= 1) {
        stopBackgroundFade()
        onComplete?.()
      }
    }, BACKGROUND_FADE_STEP_MS)
  }, [stopBackgroundFade])

  const handlePlay = useCallback(() => {
    if (isMusicMode) {
      const baseRemaining = musicRemainingMs > 0 ? musicRemainingMs : selectedDurationMs
      setMusicRemainingMs(baseRemaining)
      musicEndAtRef.current = Date.now() + baseRemaining
    }

    play()

    if (isMeditationMode && backgroundAudioUrl) {
      previousBackgroundAudioUrlRef.current = backgroundAudioUrl
      setBackgroundVolume(0)
      backgroundVolumeRef.current = 0
      playBackground()
      fadeBackgroundVolume(BACKGROUND_TRACK_VOLUME)
    }
  }, [
    fadeBackgroundVolume,
    backgroundAudioUrl,
    isMeditationMode,
    isMusicMode,
    musicRemainingMs,
    play,
    playBackground,
    selectedDurationMs,
  ])

  const handlePause = useCallback(() => {
    if (isMusicMode && musicEndAtRef.current) {
      const remaining = Math.max(0, musicEndAtRef.current - Date.now())
      setMusicRemainingMs(remaining)
      musicEndAtRef.current = null
    }

    pause()

    if (isMeditationMode && backgroundAudioUrl) {
      fadeBackgroundVolume(0, () => {
        pauseBackground()
      })
      return
    }

    pauseBackground()
  }, [backgroundAudioUrl, fadeBackgroundVolume, isMeditationMode, isMusicMode, pause, pauseBackground])

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
    backgroundVolumeRef.current = backgroundVolume
  }, [backgroundVolume])

  useEffect(() => {
    return () => {
      stopBackgroundFade()
    }
  }, [stopBackgroundFade])

  useEffect(() => {
    const loadPlayerSettings = async () => {
      const [savedBackgroundTrackId, savedDurationMinutes] = await Promise.all([
        getItem<string>(BACKGROUND_TRACK_STORAGE_KEY),
        getItem<number>(MUSIC_DURATION_STORAGE_KEY),
      ])

      if (savedBackgroundTrackId) {
        setSelectedBackgroundTrackId(savedBackgroundTrackId)
      }

      if (typeof savedDurationMinutes === 'number' && MUSIC_DURATION_OPTIONS.includes(savedDurationMinutes)) {
        setSelectedMusicDurationMinutes(savedDurationMinutes)
        setMusicRemainingMs(savedDurationMinutes * 60_000)
      }
    }

    loadPlayerSettings().catch(() => undefined)
  }, [])

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

        if (isMeditationMode) {
          try {
            const cachedMusicTracks = getCachedMusicSessions()
            const backgroundData =
              cachedMusicTracks.length > 0
                ? cachedMusicTracks
                : await fetchSessionsByContentTypeSlug(BACKGROUND_CONTENT_TYPE_SLUG)
            setBackgroundTracks(backgroundData)
          } catch {
            setBackgroundTracks([])
          }
        } else {
          setBackgroundTracks([])
          setSelectedBackgroundTrackId(null)
        }

        setError(data ? null : t('error'))
      } catch (err) {
        setTopic(null)
        setTopicSessions([])
        setBackgroundTracks([])
        setError(err instanceof Error ? err.message : t('error'))
      }
      setLoading(false)
    }
    fetchSession()
  }, [id, isMeditationMode, t])

  useEffect(() => {
    setIsBackgroundMenuOpen(false)
    setIsDurationMenuOpen(false)
  }, [id, source])

  useEffect(() => {
    if (!isMeditationMode || !backgroundAudioUrl) {
      previousBackgroundAudioUrlRef.current = null
      fadeBackgroundVolume(0, () => {
        pauseBackground()
      })
      return
    }

    const hasChangedTrack = previousBackgroundAudioUrlRef.current !== backgroundAudioUrl
    previousBackgroundAudioUrlRef.current = backgroundAudioUrl

    if (isPlaying) {
      if (hasChangedTrack) {
        setBackgroundVolume(0)
        backgroundVolumeRef.current = 0
      }
      playBackground()
      fadeBackgroundVolume(BACKGROUND_TRACK_VOLUME)
      return
    }

    setBackgroundVolume(0)
    backgroundVolumeRef.current = 0
    pauseBackground()
  }, [
    backgroundAudioUrl,
    fadeBackgroundVolume,
    isMeditationMode,
    isPlaying,
    pauseBackground,
    playBackground,
  ])

  useEffect(() => {
    if (!isMusicMode) {
      musicEndAtRef.current = null
      return
    }

    if (!isPlaying) {
      return
    }

    if (!musicEndAtRef.current) {
      musicEndAtRef.current = Date.now() + (musicRemainingMs > 0 ? musicRemainingMs : selectedDurationMs)
    }

    const intervalId = setInterval(() => {
      if (!musicEndAtRef.current) return

      const remaining = Math.max(0, musicEndAtRef.current - Date.now())
      setMusicRemainingMs(remaining)

      if (remaining <= 0) {
        musicEndAtRef.current = null
        pause()
      }
    }, 500)

    return () => {
      clearInterval(intervalId)
    }
  }, [isMusicMode, isPlaying, musicRemainingMs, pause, selectedDurationMs])

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
    handlePlay()
    setShouldAutoplay(false)
  }, [audioUrl, handlePlay, shouldAutoplay])

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
    const shouldLoop = isMusicMode || isLoopEnabled

    if (shouldLoop) {
      seek(0)
        .then(() => {
          handlePlay()
        })
        .catch(() => undefined)
      return
    }

    if (!isMusicMode && nextTrackId) {
      setShouldAutoplay(true)
      router.replace({ pathname: '/player/[id]', params: { id: nextTrackId, source } })
    }
  }, [duration, handlePlay, isLoopEnabled, isMusicMode, nextTrackId, position, seek, session, source])

  useEffect(() => {
    if (!isMusicMode) return

    setMusicRemainingMs(selectedDurationMs)
    if (isPlaying) {
      musicEndAtRef.current = Date.now() + selectedDurationMs
    }
  }, [isMusicMode, isPlaying, selectedDurationMs])

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

  const handleToggleBackgroundMenu = useCallback(() => {
    setIsBackgroundMenuOpen((current) => !current)
    setIsDurationMenuOpen(false)
  }, [])

  const handleSelectBackgroundTrack = useCallback((trackId: string | null) => {
    setBackgroundVolume(0)
    backgroundVolumeRef.current = 0
    setSelectedBackgroundTrackId(trackId)
    setIsBackgroundMenuOpen(false)

    if (trackId) {
      setItem(BACKGROUND_TRACK_STORAGE_KEY, trackId).catch(() => undefined)
      return
    }

    removeItem(BACKGROUND_TRACK_STORAGE_KEY).catch(() => undefined)
  }, [])

  const handleToggleDurationMenu = useCallback(() => {
    setIsDurationMenuOpen((current) => !current)
    setIsBackgroundMenuOpen(false)
  }, [])

  const handleSelectDuration = useCallback((minutes: number) => {
    setSelectedMusicDurationMinutes(minutes)
    setIsDurationMenuOpen(false)
    setItem(MUSIC_DURATION_STORAGE_KEY, minutes).catch(() => undefined)
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

      {!isMusicMode && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatMs(position)}</Text>
            <Text style={styles.timeText}>{formatMs(duration)}</Text>
          </View>
        </View>
      )}

      {isMusicMode && (
        <Text style={styles.timerText}>{t('remaining')}: {formatMs(musicRemainingMs)}</Text>
      )}

      <PlayerControls
        mode={isMusicMode ? 'music' : 'meditation'}
        isPlaying={isPlaying}
        isFavorite={isFavorite(session.id)}
        isLoopEnabled={isMusicMode ? true : isLoopEnabled}
        hasPreviousTrack={Boolean(previousTrackId)}
        hasNextTrack={Boolean(nextTrackId)}
        selectedBackgroundTrackId={selectedBackgroundTrackId}
        backgroundTrackOptions={backgroundTrackOptions}
        isBackgroundMenuOpen={isBackgroundMenuOpen}
        selectedDurationMinutes={selectedMusicDurationMinutes}
        durationOptions={durationOptions}
        isDurationMenuOpen={isDurationMenuOpen}
        onPlay={handlePlay}
        onPause={handlePause}
        onRewindBack={handleRewindBack}
        onRewindForward={handleRewindForward}
        onPreviousTrack={handlePreviousTrack}
        onNextTrack={handleNextTrack}
        onToggleLoop={handleToggleLoop}
        onToggleFavorite={() => toggle(session.id)}
        onToggleBackgroundMenu={handleToggleBackgroundMenu}
        onSelectBackgroundTrack={handleSelectBackgroundTrack}
        onToggleDurationMenu={handleToggleDurationMenu}
        onSelectDuration={handleSelectDuration}
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
  timerText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
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
