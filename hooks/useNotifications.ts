'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

interface NotificationOptions {
  loadItems?: boolean
}

export function useNotifications(userId: string | null, options: NotificationOptions = {}) {
  const supabase = createClient()
  const loadItemsEnabled = options.loadItems ?? false

  const [items, setItems] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0)
      return
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('useNotifications unreadCount error:', error)
      return
    }

    setUnreadCount(count ?? 0)
  }, [supabase, userId])

  const loadItems = useCallback(async () => {
    if (!userId || !loadItemsEnabled) {
      if (!loadItemsEnabled) setItems([])
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
      console.error('useNotifications load items error:', error)
      setLoading(false)
      return
    }

    const safeItems = (data ?? []) as NotificationRow[]
    setItems(safeItems)
    setUnreadCount(safeItems.filter((item) => !item.is_read).length)
    setLoading(false)
  }, [loadItemsEnabled, supabase, userId])

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

    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })))
    setUnreadCount(0)
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

    setItems((prev) => prev.map((item) => item.id === id ? { ...item, is_read: true } : item))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  useEffect(() => {
    void loadUnreadCount()
    if (!userId) return

    const interval = window.setInterval(() => {
      void loadUnreadCount()
    }, 60000)

    return () => window.clearInterval(interval)
  }, [loadUnreadCount, userId])

  useEffect(() => {
    if (!loadItemsEnabled) return
    void loadItems()
  }, [loadItems, loadItemsEnabled])

  return {
    items,
    unreadCount,
    loading,
    reload: loadItems,
    markAllAsRead,
    markAsRead,
  }
}
