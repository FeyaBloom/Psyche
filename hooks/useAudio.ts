import { useEffect, useRef, useState, useCallback } from 'react'
import { Audio } from 'expo-av'
import { createSound } from '@/lib/audio'

interface AudioState {
  isPlaying: boolean
  position: number
  duration: number
}

interface UseAudioReturn extends AudioState {
  play: () => Promise<void>
  pause: () => Promise<void>
  seek: (ms: number) => Promise<void>
}

export function useAudio(uri: string | null): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null)
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    position: 0,
    duration: 0,
  })

  useEffect(() => {
    if (!uri) return
    let mounted = true

    const load = async () => {
      const sound = await createSound(uri)
      soundRef.current = sound

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!mounted) return
        if (!status.isLoaded) return
        setState({
          isPlaying: status.isPlaying,
          position: status.positionMillis,
          duration: status.durationMillis ?? 0,
        })
      })
    }

    load()

    return () => {
      mounted = false
      soundRef.current?.unloadAsync()
      soundRef.current = null
    }
  }, [uri])

  const play = useCallback(async () => {
    await soundRef.current?.playAsync()
  }, [])

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync()
  }, [])

  const seek = useCallback(async (ms: number) => {
    await soundRef.current?.setPositionAsync(ms)
  }, [])

  return { ...state, play, pause, seek }
}
