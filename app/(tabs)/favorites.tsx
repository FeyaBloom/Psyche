import React, { useEffect, useState } from 'react'
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '@/hooks/useFavorites'
import { SessionCard } from '@/components/topic/SessionCard'
import { colors, spacing } from '@/constants/theme'
import { fetchSessionsByIds, fetchTopicsWithSessions } from '@/lib/content'
import i18n from '@/lib/i18n'
import type { Session, Topic, Locale } from '@/types'

interface SessionSection {
  title: string
  topicIconUrl?: string
  data: Session[]
}

export default function FavoritesScreen() {
  const { t } = useTranslation('favorites')
  const { favoriteIds } = useFavorites()
  const [sections, setSections] = useState<SessionSection[]>([])
  const [loading, setLoading] = useState(false)
  const locale = (i18n.language as Locale) ?? 'ru'

  useEffect(() => {
    if (favoriteIds.size === 0) {
      setSections([])
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const ids = Array.from(favoriteIds)
        const [sessions, topics] = await Promise.all([
          fetchSessionsByIds(ids),
          fetchTopicsWithSessions(),
        ])

        const topicMap = new Map<string, Topic>()
        for (const topic of topics) {
          topicMap.set(topic.id, topic)
        }

        const grouped = new Map<string, { topic: Topic; sessions: Session[] }>()
        for (const session of sessions) {
          const topic = topicMap.get(session.topic_id)
          if (!topic) continue

          if (!grouped.has(session.topic_id)) {
            grouped.set(session.topic_id, { topic, sessions: [] })
          }
          grouped.get(session.topic_id)!.sessions.push(session)
        }

        const result: SessionSection[] = Array.from(grouped.values())
          .map(({ topic, sessions: subs }) => ({
            title: topic.translations[locale]?.title ?? topic.translations.ru?.title ?? topic.slug ?? topic.id,
            topicIconUrl: topic.icon_url ?? topic.cover_url,
            data: subs,
          }))
          .sort((a, b) => a.title.localeCompare(b.title, 'ru'))

        setSections(result)
      } catch (err) {
        setSections([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [favoriteIds, locale])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    )
  }

  if (favoriteIds.size === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t('empty')}</Text>
      </View>
    )
  }

  if (sections.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t('empty')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, section }) => (
          <SessionCard
            session={item}
            isCompleted={false}
            locale={i18n.language}
            topicIconUrl={section.topicIconUrl}
            onPress={() => router.push(`/player/${item.id}`)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: spacing.md,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  sectionHeader: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingTop: spacing.md,
    borderTopColor: colors.divider,
    borderTopWidth: 1,
  },
})
