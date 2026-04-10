import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { colors, radius, spacing } from '@/constants/theme'
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
  const iconCandidates = [
    topic.icon_url,
    topic.cover_url,
    `https://picsum.photos/seed/topic-icon-${topic.slug}/240/240`,
  ].filter((url): url is string => Boolean(url))
  const [iconIndex, setIconIndex] = React.useState(0)

  React.useEffect(() => {
    setIconIndex(0)
  }, [topic.id, topic.icon_url, topic.cover_url])

  const topicIconUrl = iconCandidates[Math.min(iconIndex, iconCandidates.length - 1)]
  const handleIconError = React.useCallback(() => {
    setIconIndex((prev) => (prev < iconCandidates.length - 1 ? prev + 1 : prev))
  }, [iconCandidates.length])

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.contentRow}>
          <View style={styles.iconWrap}>
            <Image
              source={{ uri: topicIconUrl }}
              style={styles.iconImage}
              resizeMode="cover"
              onError={handleIconError}
            />
          </View>
          <View style={styles.mainBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {translation.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {translation.description}
            </Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{t('progress', { completed, total })}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.xs,
    minHeight: 130,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    flex: 1,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bg.secondary,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  mainBlock: {
    flex: 1,
    minHeight: 120,
    paddingVertical: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  progressRow: {
    gap: spacing.xs,
    marginTop: 'auto',
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
