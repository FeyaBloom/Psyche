import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/constants/theme'

interface PlayerControlsProps {
  isPlaying: boolean
  isFavorite: boolean
  isLoopEnabled: boolean
  hasPreviousTrack: boolean
  hasNextTrack: boolean
  onPlay: () => void
  onPause: () => void
  onRewindBack: () => void
  onRewindForward: () => void
  onPreviousTrack: () => void
  onNextTrack: () => void
  onToggleLoop: () => void
  onToggleFavorite: () => void
}

export function PlayerControls({
  isPlaying,
  isFavorite,
  isLoopEnabled,
  hasPreviousTrack,
  hasNextTrack,
  onPlay,
  onPause,
  onRewindBack,
  onRewindForward,
  onPreviousTrack,
  onNextTrack,
  onToggleLoop,
  onToggleFavorite,
}: PlayerControlsProps) {
  const { t } = useTranslation('player')

  return (
    <View style={styles.container}>
      <View style={styles.primaryRow}>
        <TouchableOpacity
          onPress={onPreviousTrack}
          style={[styles.control, !hasPreviousTrack && styles.controlDisabled]}
          accessibilityLabel={t('previousTrack')}
          disabled={!hasPreviousTrack}
        >
          <Ionicons
            name="play-skip-back"
            size={28}
            color={hasPreviousTrack ? colors.text.secondary : colors.text.muted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRewindBack}
          style={styles.control}
          accessibilityLabel={t('rewindBack')}
        >
          <Ionicons name="play-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={styles.playButton}
          accessibilityLabel={isPlaying ? t('pause') : t('play')}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRewindForward}
          style={styles.control}
          accessibilityLabel={t('rewindForward')}
        >
          <Ionicons name="play-forward" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextTrack}
          style={[styles.control, !hasNextTrack && styles.controlDisabled]}
          accessibilityLabel={t('nextTrack')}
          disabled={!hasNextTrack}
        >
          <Ionicons
            name="play-skip-forward"
            size={28}
            color={hasNextTrack ? colors.text.secondary : colors.text.muted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryRow}>
        <TouchableOpacity
          onPress={onToggleLoop}
          style={styles.secondaryButton}
          accessibilityLabel={isLoopEnabled ? t('disableLoop') : t('enableLoop')}
        >
          <Ionicons
            name="repeat"
            size={22}
            color={isLoopEnabled ? colors.accent.primary : colors.text.secondary}
          />
          <Text style={[styles.secondaryLabel, isLoopEnabled && styles.secondaryLabelActive]}>
            {t('loop')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleFavorite}
          style={styles.secondaryButton}
          accessibilityLabel={isFavorite ? t('removeFavorite') : t('addFavorite')}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={colors.accent.primary}
          />
          <Text style={styles.secondaryLabel}>{t('favorite')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  control: {
    padding: spacing.sm,
  },
  controlDisabled: {
    opacity: 0.45,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.bg.secondary,
  },
  secondaryLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryLabelActive: {
    color: colors.accent.primary,
  },
})
