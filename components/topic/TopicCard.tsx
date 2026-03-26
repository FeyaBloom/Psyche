import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { colors, spacing } from '@/constants/theme'
import type { Topic } from '@/types'

interface TopicCardProps {
  topic: Topic
  completed: number
  total: number
  onPress: () => void
  locale: string
}

export function TopicCard({ topic, completed, total, onPress, locale }: TopicCardProps) {
  const { t } = useTranslation('topic')
  const translation = topic.translations[locale as keyof typeof topic.translations] ?? topic.translations.ru
  const progress = total > 0 ? completed / total : 0

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Text style={styles.title}>{translation.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {translation.description}
        </Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {t('progress', { completed, total })}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  progressRow: {
    gap: spacing.xs,
  },
  progressText: {
    color: colors.text.muted,
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.accent.muted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
})
