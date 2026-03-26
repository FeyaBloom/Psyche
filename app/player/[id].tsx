import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { PlayerControls } from '@/components/player/PlayerControls'
import { colors, spacing } from '@/constants/theme'
import { useAudio } from '@/hooks/useAudio'
import { useProgress } from '@/hooks/useProgress'
import { useFavorites } from '@/hooks/useFavorites'
import i18n from '@/lib/i18n'
import type { Session } from '@/types'
import type { Locale } from '@/types'

const REWIND_MS = 15_000

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation('common')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markedComplete, setMarkedComplete] = useState(false)

  const locale = (i18n.language as Locale) ?? 'ru'
  const audioUrl = session?.translations[locale]?.audio_url ?? null

  const { isPlaying, position, duration, play, pause, seek } = useAudio(audioUrl)
  const { isCompleted, markComplete } = useProgress()
  const { isFavorite, toggle } = useFavorites()

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error: err } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single()
      if (err) {
        setError(err.message)
      } else {
        setSession(data as Session)
      }
      setLoading(false)
    }
    fetchSession()
  }, [id])

  useEffect(() => {
    if (!session || markedComplete) return
    if (duration > 0 && position >= duration - 1000) {
      markComplete(session.id)
      setMarkedComplete(true)
    }
  }, [position, duration, session, markedComplete, markComplete])

  const handleRewindBack = useCallback(() => {
    seek(Math.max(0, position - REWIND_MS))
  }, [position, seek])

  const handleRewindForward = useCallback(() => {
    seek(Math.min(duration, position + REWIND_MS))
  }, [position, duration, seek])

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

  const translation = session.translations[locale] ?? session.translations.ru
  const completed = isCompleted(session.id)

  return (
    <View style={styles.container}>
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
        onPlay={play}
        onPause={pause}
        onRewindBack={handleRewindBack}
        onRewindForward={handleRewindForward}
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
})
