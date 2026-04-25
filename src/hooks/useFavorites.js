import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../context/AuthContext'

const STORAGE_KEY = 'fxcalc_favorites_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)
  const { saveToCloud, cloudData } = useAuthContext()

  // When cloud data arrives after login, update state reactively (no reload)
  useEffect(() => {
    if (cloudData?.favorites) {
      setFavorites(cloudData.favorites)
    }
  }, [cloudData?.favorites])

  const toggle = useCallback((pair) => {
    setFavorites(prev => {
      const next = prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]
      saveToCloud('favorites', next)
      return next
    })
  }, [saveToCloud])

  const isFav = useCallback((pair) => favorites.includes(pair), [favorites])

  return { favorites, toggle, isFav }
}
