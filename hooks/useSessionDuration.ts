import { useEffect, useState } from 'react'
import { createAudioPlayer } from 'expo-audio'

const durationCache = new Map<string, number>()

function getCachedDurationMs(uri: string): number | null {
  const cachedSeconds = durationCache.get(uri)
  if (!cachedSeconds || cachedSeconds <= 0) return null
  return cachedSeconds * 1000
}

export function useSessionDuration(uri: string | null): number {
  const [durationMs, setDurationMs] = useState(() => (uri ? getCachedDurationMs(uri) ?? 0 : 0))

  useEffect(() => {
    if (!uri) {
      setDurationMs(0)
      return
    }

    const cachedMs = getCachedDurationMs(uri)
    if (cachedMs !== null) {
      setDurationMs(cachedMs)
      return
    }

    setDurationMs(0)

    let isCancelled = false
    const player = createAudioPlayer(uri, { updateInterval: 250 })
    let attempts = 0
    const maxAttempts = 40

    const intervalId = setInterval(() => {
      if (isCancelled) return

      const realDurationSeconds = player.duration
      if (Number.isFinite(realDurationSeconds) && realDurationSeconds > 0) {
        durationCache.set(uri, realDurationSeconds)
        setDurationMs(realDurationSeconds * 1000)
        clearInterval(intervalId)
        player.remove()
        return
      }

      attempts += 1
      if (attempts >= maxAttempts) {
        clearInterval(intervalId)
        player.remove()
      }
    }, 250)

    return () => {
      isCancelled = true
      clearInterval(intervalId)
      player.remove()
    }
  }, [uri])

  return durationMs
}
