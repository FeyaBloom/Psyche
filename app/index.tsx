import { useEffect } from 'react'
import { router } from 'expo-router'
import { getItem } from '@/lib/storage'

export default function IndexScreen() {
  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await getItem<boolean>('onboarding_seen')
      if (seen) {
        router.replace('/(tabs)')
      } else {
        router.replace('/onboarding')
      }
    }
    checkOnboarding()
  }, [])

  return null
}
