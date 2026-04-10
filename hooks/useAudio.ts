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

interface LockScreenMetadata {
  title?: string
  artist?: string
  artworkUrl?: string
}

export function useAudio(uri: string | null, metadata?: LockScreenMetadata): UseAudioReturn {
  const player = useAudioPlayer(uri ?? undefined)
  const status = useAudioPlayerStatus(player)
  const prevUri = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const applyAudioMode = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      })
    }

    applyAudioMode().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!uri) {
      player.setActiveForLockScreen(false)
      return
    }

    player.setActiveForLockScreen(
      true,
      {
        title: metadata?.title,
        artist: metadata?.artist,
        artworkUrl: metadata?.artworkUrl,
      },
      {
        showSeekBackward: true,
        showSeekForward: true,
      },
    )

    return () => {
      player.setActiveForLockScreen(false)
    }
  }, [uri, player, metadata?.title, metadata?.artist, metadata?.artworkUrl])

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
