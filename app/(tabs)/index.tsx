import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { TopicCard } from '@/components/topic/TopicCard'
import { colors, spacing } from '@/constants/theme'
import { useProgress } from '@/hooks/useProgress'
import type { Topic } from '@/types'
import type { Locale } from '@/types'

const LOCALES: Locale[] = ['ru', 'en', 'es', 'ca']

export default function HomeScreen() {
  const { t } = useTranslation('common')
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>((i18n.language as Locale) ?? 'ru')
  const { isCompleted } = useProgress()

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('topics')
      .select('*, sessions(*)')
      .order('order_index')
    if (err) {
      setError(err.message)
    } else {
      setTopics((data ?? []) as Topic[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const cycleLocale = () => {
    const idx = LOCALES.indexOf(locale)
    const next = LOCALES[(idx + 1) % LOCALES.length]
    setLocale(next)
    i18n.changeLanguage(next)
  }

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
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={cycleLocale} style={styles.langToggle}>
        <Text style={styles.langText}>{locale.toUpperCase()}</Text>
      </TouchableOpacity>
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
  langToggle: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
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
