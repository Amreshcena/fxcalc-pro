import { useState, useCallback } from 'react'

const STORAGE_KEY = 'fxcalc_favorites_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  const toggle = useCallback((pair) => {
    setFavorites(prev => {
      const next = prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isFav = useCallback((pair) => favorites.includes(pair), [favorites])

  return { favorites, toggle, isFav }
}
