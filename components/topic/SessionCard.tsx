import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { colors, spacing } from '@/constants/theme'
import type { Session } from '@/types'

interface SessionCardProps {
  session: Session
  isCompleted: boolean
  onPress: () => void
  locale: string
}

export function SessionCard({ session, isCompleted, onPress, locale }: SessionCardProps) {
  const { t } = useTranslation('common')
  const translation = session.translations[locale as keyof typeof session.translations] ?? session.translations.ru
  const minutes = Math.round(session.duration / 60)

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.title}>{translation.title}</Text>
            <Text style={styles.duration}>{minutes} {t('minutes')}</Text>
          </View>
          {isCompleted && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  duration: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.bg.primary,
    fontWeight: '700',
    fontSize: 14,
  },
})
