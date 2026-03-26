import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  type ListRenderItem,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { colors, spacing } from '@/constants/theme'
import { setItem } from '@/lib/storage'

const { width } = Dimensions.get('window')
const ONBOARDING_KEY = 'onboarding_seen'

interface Slide {
  key: string
  titleKey: string
  descKey: string
}

const SLIDES: Slide[] = [
  { key: '1', titleKey: 'slide1_title', descKey: 'slide1_desc' },
  { key: '2', titleKey: 'slide2_title', descKey: 'slide2_desc' },
  { key: '3', titleKey: 'slide3_title', descKey: 'slide3_desc' },
]

export default function OnboardingScreen() {
  const { t } = useTranslation('onboarding')
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList<Slide>>(null)

  const handleStart = async () => {
    await setItem(ONBOARDING_KEY, true)
    router.replace('/(tabs)')
  }

  const renderItem: ListRenderItem<Slide> = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.desc}>{t(item.descKey)}</Text>
    </View>
  )

  const isLast = activeIndex === SLIDES.length - 1

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setActiveIndex(index)
        }}
      />
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
      {isLast && (
        <View style={styles.buttonContainer}>
          <Button label={t('start')} onPress={handleStart} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  desc: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.muted,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
})
