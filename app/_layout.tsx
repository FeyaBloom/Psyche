import '../lib/i18n'
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from '@/constants/theme'
import { configureAudio } from '@/lib/audio'

export default function RootLayout() {
  useEffect(() => {
    configureAudio().catch(() => undefined)
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg.primary },
            headerTintColor: colors.text.primary,
            contentStyle: { backgroundColor: colors.bg.primary },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="topic/[id]" options={{ title: '' }} />
          <Stack.Screen name="player/[id]" options={{ title: '' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
