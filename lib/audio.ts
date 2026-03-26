import { Audio } from 'expo-av'

export async function createSound(uri: string): Promise<Audio.Sound> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
  const { sound } = await Audio.Sound.createAsync({ uri })
  return sound
}
