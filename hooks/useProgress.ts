import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getItem, setItem } from '@/lib/storage'
import type { UserProgress } from '@/types'

const STORAGE_KEY = 'completed_sessions'

export function useProgress() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const cached = await getItem<string[]>(STORAGE_KEY)
      if (cached) setCompletedIds(new Set(cached))

      const { data } = await supabase
        .from('user_progress')
        .select('session_id')
      if (data) {
        const ids = (data as Pick<UserProgress, 'session_id'>[]).map((r) => r.session_id)
        setCompletedIds(new Set(ids))
        await setItem(STORAGE_KEY, ids)
      }
    }
    load()
  }, [])

  const markComplete = useCallback(async (sessionId: string) => {
    await supabase
      .from('user_progress')
      .upsert({ session_id: sessionId, completed_at: new Date().toISOString() })

    setCompletedIds((prev) => {
      const next = new Set(prev)
      next.add(sessionId)
      setItem(STORAGE_KEY, Array.from(next))
      return next
    })
  }, [])

  const isCompleted = useCallback(
    (sessionId: string) => completedIds.has(sessionId),
    [completedIds],
  )

  return { isCompleted, markComplete }
}
