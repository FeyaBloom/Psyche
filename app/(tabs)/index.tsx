import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { fetchTopicsWithSessions } from '@/lib/content'
import { TopicCard } from '@/components/topic/TopicCard'
import { colors, spacing } from '@/constants/theme'
import { useProgress } from '@/hooks/useProgress'
import type { Topic } from '@/types'
import type { Locale } from '@/types'

const LOCALES: Locale[] = ['ru', 'en', 'es', 'ca']

export default function HomeScreen() {
  const { t } = useTranslation('common')
  const navigation = useNavigation()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>((i18n.language as Locale) ?? 'ru')
  const { isCompleted } = useProgress()

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTopicsWithSessions()
      setTopics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'))
    }
    setLoading(false)
  }, [t])

  const cycleLocale = useCallback(() => {
    const idx = LOCALES.indexOf(locale)
    const next = LOCALES[(idx + 1) % LOCALES.length]
    setLocale(next)
    i18n.changeLanguage(next)
  }, [locale])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={cycleLocale} style={styles.langToggle}>
          <Text style={styles.langText}>{locale.toUpperCase()}</Text>
        </TouchableOpacity>
      ),
    })
  }, [locale, cycleLocale, navigation])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

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
        <TouchableOpacity onPress={fetchTopics}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/player/demo')} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Открыть демо-аудио</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (topics.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>В базе пока нет данных</Text>
        <TouchableOpacity onPress={() => router.push('/player/demo')} style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Проверить плеер на демо-аудио</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchTopics}>
          <Text style={styles.retryText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const sessions = item.sessions ?? []
          const completedCount = sessions.filter((s) => isCompleted(s.id)).length
          return (
            <TopicCard
              topic={item}
              completed={completedCount}
              total={sessions.length}
              locale={locale}
              onPress={() => router.push(`/topic/${item.id}`)}
            />
          )
        }}
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
    paddingTop: spacing.lg,
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
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  demoButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  demoButtonText: {
    color: colors.bg.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  langToggle: {
    marginRight: spacing.md,
    backgroundColor: colors.bg.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  langText: {
    color: colors.accent.primary,
    fontWeight: '700',
    fontSize: 13,
  },
})
