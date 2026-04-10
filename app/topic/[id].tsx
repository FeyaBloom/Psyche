import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { fetchSessionsByTopic, fetchTopicById } from '@/lib/content'
import { SessionCard } from '@/components/topic/SessionCard'
import { colors, spacing } from '@/constants/theme'
import { useProgress } from '@/hooks/useProgress'
import i18n from '@/lib/i18n'
import type { Session, Topic, Locale } from '@/types'

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation('common')
  const navigation = useNavigation()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isCompleted } = useProgress()
  const locale = (i18n.language as Locale) ?? 'ru'
  const topicTranslation = topic?.translations[locale] ?? topic?.translations.ru

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [topicData, sessionsData] = await Promise.all([
        fetchTopicById(id),
        fetchSessionsByTopic(id),
      ])
      setTopic(topicData)
      setSessions(sessionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
    setLoading(false)
  }, [id, t])

  useLayoutEffect(() => {
    const title = topic?.translations[locale]?.title ?? topic?.translations.ru?.title ?? 'Раздел'
    navigation.setOptions({
      title: '',
      headerTitle: () => (
        <View style={styles.headerBreadcrumbs}>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(tabs)', params: { section: 'meditations' } })
            }
          >
            <Text style={styles.headerBreadcrumbLink}>Медитации</Text>
          </TouchableOpacity>
          <Text style={styles.headerBreadcrumbSeparator}>/</Text>
          <Text style={styles.headerBreadcrumbCurrent} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ),
    })
  }, [topic, locale, navigation])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('error')}</Text>
        <TouchableOpacity onPress={fetchData}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Image
              source={{
                uri: topic?.cover_url ?? 'https://picsum.photos/seed/topic-header-default/1400/800',
              }}
              style={styles.cover}
              resizeMode="cover"
            />
            <Text style={styles.listTitle}>Треки</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            isCompleted={isCompleted(item.id)}
            locale={locale}
            topicIconUrl={topic?.icon_url ?? topic?.cover_url}
            onPress={() =>
              router.push({
                pathname: '/player/[id]',
                params: { id: item.id, source: 'meditations' },
              })
            }
          />
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
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    marginBottom: spacing.sm,
  },
  headerBreadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  headerBreadcrumbLink: {
    color: colors.accent.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  headerBreadcrumbSeparator: {
    color: colors.text.muted,
    fontSize: 13,
  },
  headerBreadcrumbCurrent: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: 13,
  },
  cover: {
    width: '100%',
    aspectRatio: 1.8,
    borderRadius: 14,
    marginBottom: spacing.md,
    backgroundColor: colors.bg.secondary,
  },
  listTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  retryText: {
    color: colors.accent.primary,
    fontSize: 16,
  },
})
