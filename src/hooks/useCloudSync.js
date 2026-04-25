import { useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Keys that are saved in localStorage
const LOCAL_KEYS = {
  favorites: 'fx_favorites',
  journal:   'fx_journal',
  alerts:    'fx_alerts',
  settings:  'fx_settings',
}

// Read all local data
function readAllLocal() {
  const data = {}
  for (const [key, storageKey] of Object.entries(LOCAL_KEYS)) {
    try {
      const raw = localStorage.getItem(storageKey)
      data[key] = raw ? JSON.parse(raw) : null
    } catch {
      data[key] = null
    }
  }
  return data
}

// Write all cloud data to local
function writeAllLocal(cloudData) {
  for (const [key, storageKey] of Object.entries(LOCAL_KEYS)) {
    if (cloudData[key] !== undefined && cloudData[key] !== null) {
      localStorage.setItem(storageKey, JSON.stringify(cloudData[key]))
    }
  }
}

export function useCloudSync(user) {

  // ── On login → pull cloud data down ──────────────────────
  useEffect(() => {
    if (!user) return

    const syncFromCloud = async () => {
      try {
        const ref  = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          // Cloud data exists → overwrite local with cloud
          const cloudData = snap.data()
          writeAllLocal(cloudData)
          console.log('✅ Synced from cloud')
        } else {
          // First ever login → push local data up to cloud
          const localData = readAllLocal()
          await setDoc(ref, localData, { merge: true })
          console.log('✅ First login — pushed local data to cloud')
        }
      } catch (err) {
        console.error('Cloud sync failed:', err)
      }
    }

    syncFromCloud()
  }, [user])

  // ── Call this whenever any data changes ──────────────────
  const saveToCloud = useCallback(async (key, data) => {
    // Always save to localStorage first (instant)
    const storageKey = LOCAL_KEYS[key]
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(data))
    }

    // Then sync to Firestore if logged in
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          { [key]: data },
          { merge: true }  // only update this field, keep others
        )
      } catch (err) {
        console.error(`Failed to save ${key} to cloud:`, err)
        // Data is still safe in localStorage
      }
    }
  }, [user])

  return { saveToCloud }
}