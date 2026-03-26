import '../lib/i18n'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { colors } from '@/constants/theme'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.primary },
          headerTintColor: colors.text.primary,
          contentStyle: { backgroundColor: colors.bg.primary },
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="topic/[id]" options={{ title: '' }} />
        <Stack.Screen name="player/[id]" options={{ title: '' }} />
      </Stack>
    </>
  )
}
