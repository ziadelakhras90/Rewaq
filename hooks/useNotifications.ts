'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export function useNotifications(userId: string | null) {
  const supabase = createClient()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) {
      setItems([])
      setUnreadCount(0)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('useNotifications load error:', error)
      setLoading(false)
      return
    }

    const safeItems = (data ?? []) as NotificationRow[]
    setItems(safeItems)
    setUnreadCount(safeItems.filter((item) => !item.is_read).length)
    setLoading(false)
  }, [supabase, userId])

  async function markAllAsRead() {
    if (!userId || unreadCount === 0) return

    const { error } = await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('useNotifications markAllAsRead error:', error)
      return
    }

    await load()
  }

  async function markAsRead(id: string) {
    const target = items.find((item) => item.id === id)
    if (!target || target.is_read) return

    const { error } = await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('useNotifications markAsRead error:', error)
      return
    }

    await load()
  }

  useEffect(() => {
    load()
    if (!userId) return

    const interval = window.setInterval(load, 30000)
    return () => window.clearInterval(interval)
  }, [load, userId])

  return {
    items,
    unreadCount,
    loading,
    reload: load,
    markAllAsRead,
    markAsRead,
  }
}
