import React from 'react'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/constants/theme'

export default function TabsLayout() {
  const { t } = useTranslation('tabs')

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: colors.bg.secondary, borderTopColor: colors.divider },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
        headerStyle: { backgroundColor: colors.bg.primary },
        headerTintColor: colors.text.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('favorites'),
          tabBarLabel: t('favorites'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
