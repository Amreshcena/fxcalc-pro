import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../context/AuthContext'

const STORAGE_KEY = 'fxcalc_journal_v1'

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useJournal() {
  const [entries, setEntries] = useState(loadEntries)
  const { saveToCloud, cloudData } = useAuthContext()

  // When cloud data arrives after login, update state reactively (no reload)
  useEffect(() => {
    if (cloudData?.journal) {
      setEntries(cloudData.journal)
    }
  }, [cloudData?.journal])

  const persist = useCallback((updated) => {
    saveToCloud('journal', updated)
  }, [saveToCloud])

  const addEntry = useCallback((entry) => {
    const newEntry = {
      ...entry,
      id:   `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    }
    setEntries(prev => {
      const updated = [newEntry, ...prev]
      persist(updated)
      return updated
    })
    return newEntry.id
  }, [persist])

  const updateEntry = useCallback((id, patch) => {
    setEntries(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...patch } : e)
      persist(updated)
      return updated
    })
  }, [persist])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      persist(updated)
      return updated
    })
  }, [persist])

  const clearAll = useCallback(() => {
    setEntries([])
    persist([])
  }, [persist])

  const stats = (() => {
    const closed   = entries.filter(e => e.result !== 'open')
    const wins     = closed.filter(e => e.result === 'win')
    const losses   = closed.filter(e => e.result === 'loss')
    const totalPnl = closed.reduce((sum, e) => sum + (e.pnl || 0), 0)
    const winRate  = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
    const avgRR    = closed.length > 0
      ? closed.reduce((s, e) => s + (e.rrRatio || 0), 0) / closed.length
      : 0
    return {
      total: entries.length, closed: closed.length,
      wins: wins.length, losses: losses.length,
      totalPnl, winRate, avgRR,
    }
  })()

  return { entries, addEntry, updateEntry, deleteEntry, clearAll, stats }
}
