import { setAudioModeAsync } from 'expo-audio'

export async function configureAudio(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  })
}
