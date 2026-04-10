import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/constants/theme'

interface BackgroundTrackOption {
  id: string
  title: string
  iconUrl?: string
}

interface DurationOption {
  minutes: number
  label: string
}

interface PlayerControlsProps {
  mode: 'meditation' | 'music'
  isPlaying: boolean
  isFavorite: boolean
  isLoopEnabled?: boolean
  hasPreviousTrack: boolean
  hasNextTrack: boolean
  selectedBackgroundTrackId?: string | null
  backgroundTrackOptions?: BackgroundTrackOption[]
  isBackgroundMenuOpen?: boolean
  selectedDurationMinutes?: number
  durationOptions?: DurationOption[]
  isDurationMenuOpen?: boolean
  onPlay: () => void
  onPause: () => void
  onRewindBack: () => void
  onRewindForward: () => void
  onPreviousTrack: () => void
  onNextTrack: () => void
  onToggleLoop?: () => void
  onToggleFavorite: () => void
  onToggleBackgroundMenu?: () => void
  onSelectBackgroundTrack?: (trackId: string | null) => void
  onToggleDurationMenu?: () => void
  onSelectDuration?: (minutes: number) => void
}

export function PlayerControls({
  mode,
  isPlaying,
  isFavorite,
  isLoopEnabled,
  hasPreviousTrack,
  hasNextTrack,
  selectedBackgroundTrackId,
  backgroundTrackOptions = [],
  isBackgroundMenuOpen,
  selectedDurationMinutes,
  durationOptions = [],
  isDurationMenuOpen,
  onPlay,
  onPause,
  onRewindBack,
  onRewindForward,
  onPreviousTrack,
  onNextTrack,
  onToggleLoop,
  onToggleFavorite,
  onToggleBackgroundMenu,
  onSelectBackgroundTrack,
  onToggleDurationMenu,
  onSelectDuration,
}: PlayerControlsProps) {
  const { t } = useTranslation('player')

  const selectedBackground =
    backgroundTrackOptions.find((item) => item.id === selectedBackgroundTrackId) ?? null

  return (
    <View style={styles.container}>
      {mode === 'meditation' ? (
        <>
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
              style={styles.iconButton}
              accessibilityLabel={isLoopEnabled ? t('disableLoop') : t('enableLoop')}
            >
              <Ionicons
                name="repeat"
                size={22}
                color={isLoopEnabled ? colors.accent.primary : colors.text.secondary}
              />
            </TouchableOpacity>

            <View style={styles.dropdownAnchor}>
              <TouchableOpacity
                onPress={onToggleBackgroundMenu}
                style={styles.iconButtonWide}
                accessibilityLabel={t('backgroundSound')}
              >
                <Ionicons
                  name={selectedBackground ? 'musical-notes' : 'musical-note-outline'}
                  size={22}
                  color={selectedBackground ? colors.accent.primary : colors.text.secondary}
                />
                <Ionicons
                  name={isBackgroundMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.text.muted}
                />
              </TouchableOpacity>

              {isBackgroundMenuOpen && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => onSelectBackgroundTrack?.(null)}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={colors.text.secondary} />
                    <Text style={styles.dropdownLabel}>{t('backgroundOff')}</Text>
                  </TouchableOpacity>

                  {backgroundTrackOptions.map((item) => {
                    const isSelected = item.id === selectedBackgroundTrackId
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.dropdownItem}
                        onPress={() => onSelectBackgroundTrack?.(item.id)}
                      >
                        {item.iconUrl ? (
                          <Image source={{ uri: item.iconUrl }} style={styles.dropdownIconImage} />
                        ) : (
                          <Ionicons name="musical-note-outline" size={16} color={colors.text.muted} />
                        )}
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={isSelected ? colors.accent.primary : colors.text.muted}
                        />
                        <Text style={[styles.dropdownLabel, isSelected && styles.secondaryLabelActive]} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={onToggleFavorite}
              style={styles.iconButton}
              accessibilityLabel={isFavorite ? t('removeFavorite') : t('addFavorite')}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={colors.accent.primary}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.primaryRow}>
            <TouchableOpacity
              onPress={isPlaying ? onPause : onPlay}
              style={styles.playButton}
              accessibilityLabel={isPlaying ? t('pause') : t('play')}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryRow}>
            <View style={styles.dropdownAnchor}>
              <TouchableOpacity
                onPress={onToggleDurationMenu}
                style={styles.secondaryButton}
                accessibilityLabel={t('playDuration')}
              >
                <Ionicons name="timer-outline" size={22} color={colors.text.secondary} />
                <Text style={styles.secondaryLabel}>
                  {selectedDurationMinutes ? `${selectedDurationMinutes} ${t('durationMinutesShort')}` : t('playDuration')}
                </Text>
                <Ionicons
                  name={isDurationMenuOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.text.muted}
                />
              </TouchableOpacity>

              {isDurationMenuOpen && (
                <View style={styles.dropdown}>
                  {durationOptions.map((option) => {
                    const isSelected = option.minutes === selectedDurationMinutes
                    return (
                      <TouchableOpacity
                        key={option.minutes}
                        style={styles.dropdownItem}
                        onPress={() => onSelectDuration?.(option.minutes)}
                      >
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={isSelected ? colors.accent.primary : colors.text.muted}
                        />
                        <Text style={[styles.dropdownLabel, isSelected && styles.secondaryLabelActive]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </View>

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
        </>
      )}
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
    gap: spacing.md,
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonWide: {
    minWidth: 56,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  secondaryLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryLabelActive: {
    color: colors.accent.primary,
  },
  dropdownAnchor: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: spacing.xs,
    left: '50%',
    transform: [{ translateX: -90 }],
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    paddingVertical: spacing.xs,
    minWidth: 180,
    zIndex: 20,
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 140,
  },
  dropdownIconImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bg.primary,
  },
})
