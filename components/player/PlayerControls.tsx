import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, spacing } from '@/constants/theme'

interface PlayerControlsProps {
  isPlaying: boolean
  isFavorite: boolean
  onPlay: () => void
  onPause: () => void
  onRewindBack: () => void
  onRewindForward: () => void
  onToggleFavorite: () => void
}

export function PlayerControls({
  isPlaying,
  isFavorite,
  onPlay,
  onPause,
  onRewindBack,
  onRewindForward,
  onToggleFavorite,
}: PlayerControlsProps) {
  const { t } = useTranslation('player')

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onRewindBack} style={styles.control}>
        <Text style={styles.controlText}>‹‹ 15</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isPlaying ? onPause : onPlay}
        style={styles.playButton}
        accessibilityLabel={isPlaying ? t('pause') : t('play')}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRewindForward} style={styles.control}>
        <Text style={styles.controlText}>15 ››</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleFavorite}
        style={styles.favoriteButton}
        accessibilityLabel={isFavorite ? t('removeFavorite') : t('addFavorite')}
      >
        <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  control: {
    padding: spacing.sm,
  },
  controlText: {
    color: colors.text.secondary,
    fontSize: 18,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: colors.text.primary,
    fontSize: 28,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  favoriteIcon: {
    color: colors.accent.primary,
    fontSize: 28,
  },
})
