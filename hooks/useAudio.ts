import { useEffect, useRef, useCallback } from 'react'
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio'

interface AudioState {
  isPlaying: boolean
  position: number
  duration: number
}

interface UseAudioReturn extends AudioState {
  play: () => void
  pause: () => void
  seek: (ms: number) => Promise<void>
}

export function useAudio(uri: string | null): UseAudioReturn {
  const player = useAudioPlayer(uri ?? undefined)
  const status = useAudioPlayerStatus(player)
  const prevUri = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true })
  }, [])

  useEffect(() => {
    if (prevUri.current === undefined) {
      prevUri.current = uri
      return
    }
    if (uri !== prevUri.current) {
      prevUri.current = uri
      if (uri) {
        player.replace(uri)
      }
    }
  }, [uri, player])

  const play = useCallback(() => {
    player.play()
  }, [player])

  const pause = useCallback(() => {
    player.pause()
  }, [player])

  const seek = useCallback(async (ms: number) => {
    await player.seekTo(ms / 1000)
  }, [player])

  return {
    isPlaying: status.playing,
    position: status.currentTime * 1000,
    duration: status.duration * 1000,
    play,
    pause,
    seek,
  }
}
