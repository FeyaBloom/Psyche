import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
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
        <Ionicons name="play-back" size={24} color={colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isPlaying ? onPause : onPlay}
        style={styles.playButton}
        accessibilityLabel={isPlaying ? t('pause') : t('play')}
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={colors.text.primary} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRewindForward} style={styles.control}>
        <Ionicons name="play-forward" size={24} color={colors.text.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleFavorite}
        style={styles.favoriteButton}
        accessibilityLabel={isFavorite ? t('removeFavorite') : t('addFavorite')}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={28}
          color={colors.accent.primary}
        />
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
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    padding: spacing.sm,
  },
})
