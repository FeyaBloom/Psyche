import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { SessionCard } from '@/components/topic/SessionCard'
import { colors, spacing } from '@/constants/theme'
import { useProgress } from '@/hooks/useProgress'
import i18n from '@/lib/i18n'
import type { Session } from '@/types'

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation('common')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isCompleted } = useProgress()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .eq('topic_id', id)
      .order('order_index')
    if (err) {
      setError(err.message)
    } else {
      setSessions((data ?? []) as Session[])
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

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
        <TouchableOpacity onPress={fetchSessions}>
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
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            isCompleted={isCompleted(item.id)}
            locale={i18n.language}
            onPress={() => router.push(`/player/${item.id}`)}
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
