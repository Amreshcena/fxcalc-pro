import { useState, useCallback } from 'react'

const STORAGE_KEY = 'fxcalc_journal_v1'

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    console.error('[useJournal] Failed to save to localStorage')
  }
}

/**
 * useJournal — persists trade journal entries in localStorage.
 *
 * Each entry shape:
 * {
 *   id:        string (timestamp-based)
 *   date:      string (ISO)
 *   pair:      string
 *   direction: 'buy' | 'sell'
 *   entry:     number
 *   sl:        number
 *   tp:        number
 *   lots:      number
 *   lotType:   string
 *   riskAmt:   number
 *   rewardAmt: number
 *   rrRatio:   number
 *   result:    'win' | 'loss' | 'be' | 'open'
 *   pnl:       number | null
 *   notes:     string
 * }
 */
export function useJournal() {
  const [entries, setEntries] = useState(loadEntries)

  const addEntry = useCallback((entry) => {
    const newEntry = {
      ...entry,
      id:   `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    }
    setEntries(prev => {
      const updated = [newEntry, ...prev]
      saveEntries(updated)
      return updated
    })
    return newEntry.id
  }, [])

  const updateEntry = useCallback((id, patch) => {
    setEntries(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...patch } : e)
      saveEntries(updated)
      return updated
    })
  }, [])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveEntries(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Summary stats
  const stats = (() => {
    const closed = entries.filter(e => e.result !== 'open')
    const wins   = closed.filter(e => e.result === 'win')
    const losses = closed.filter(e => e.result === 'loss')
    const totalPnl = closed.reduce((sum, e) => sum + (e.pnl || 0), 0)
    const winRate  = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
    const avgRR    = closed.length > 0
      ? closed.reduce((s, e) => s + (e.rrRatio || 0), 0) / closed.length
      : 0
    return { total: entries.length, closed: closed.length, wins: wins.length, losses: losses.length, totalPnl, winRate, avgRR }
  })()

  return { entries, addEntry, updateEntry, deleteEntry, clearAll, stats }
}
