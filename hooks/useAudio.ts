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
  const player = useAudioPlayer()
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
      try { player.setActiveForLockScreen(false) } catch { /* player may be released */ }
      return
    }

    try {
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
    } catch { /* player may be released */ }

    return () => {
      try { player.setActiveForLockScreen(false) } catch { /* player may be released */ }
    }
  }, [uri, player, metadata?.title, metadata?.artist, metadata?.artworkUrl])

  useEffect(() => {
    if (uri === prevUri.current) {
      return
    }

    prevUri.current = uri

    if (uri) {
      player.replace(uri)
      return
    }

    player.pause()
    player.seekTo(0).catch(() => undefined)
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
    isPlaying: Boolean(status?.playing),
    position: (status?.currentTime ?? 0) * 1000,
    duration: (status?.duration ?? 0) * 1000,
    play,
    pause,
    seek,
  }
}
