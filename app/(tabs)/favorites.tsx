import React from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '@/hooks/useFavorites'
import { SessionCard } from '@/components/topic/SessionCard'
import { colors, spacing } from '@/constants/theme'
import i18n from '@/lib/i18n'
import type { Session } from '@/types'

export default function FavoritesScreen() {
  const { t } = useTranslation('favorites')
  const { favoriteIds } = useFavorites()

  const sessions: Session[] = []

  if (favoriteIds.size === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t('empty')}</Text>
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
            isCompleted={false}
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
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
})
