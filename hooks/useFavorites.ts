import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getItem, setItem } from '@/lib/storage'
import type { UserFavorite } from '@/types'

const STORAGE_KEY = 'favorite_sessions'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const cached = await getItem<string[]>(STORAGE_KEY)
      if (cached) setFavoriteIds(new Set(cached))

      const { data } = await supabase
        .from('user_favorites')
        .select('session_id')
      if (data && data.length > 0) {
        const ids = (data as Pick<UserFavorite, 'session_id'>[]).map((r) => r.session_id)
        setFavoriteIds(new Set(ids))
        await setItem(STORAGE_KEY, ids)
      }
    }
    load()
  }, [])

  const toggle = useCallback(async (sessionId: string) => {
    const isFav = favoriteIds.has(sessionId)
    if (isFav) {
      await supabase.from('user_favorites').delete().eq('session_id', sessionId)
    } else {
      await supabase
        .from('user_favorites')
        .upsert({ session_id: sessionId, added_at: new Date().toISOString() })
    }
    const next = new Set(favoriteIds)
    isFav ? next.delete(sessionId) : next.add(sessionId)
    setFavoriteIds(next)
    await setItem(STORAGE_KEY, Array.from(next))
  }, [favoriteIds])

  const isFavorite = useCallback(
    (sessionId: string) => favoriteIds.has(sessionId),
    [favoriteIds],
  )

  return { isFavorite, toggle, favoriteIds }
}
