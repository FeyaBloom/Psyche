import React from 'react'
import { View, StyleSheet, type ViewProps } from 'react-native'
import { colors, radius, spacing } from '@/constants/theme'

interface CardProps extends ViewProps {
  children: React.ReactNode
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
})
