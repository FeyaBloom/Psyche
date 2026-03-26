import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native'
import { colors, spacing, radius } from '@/constants/theme'

interface ButtonProps extends TouchableOpacityProps {
  label: string
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

export function Button({ label, loading = false, variant = 'primary', style, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.ghost, style]}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.primary} />
      ) : (
        <Text style={[styles.label, !isPrimary && styles.labelGhost]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  labelGhost: {
    color: colors.accent.primary,
  },
})
