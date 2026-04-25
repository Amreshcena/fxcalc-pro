// Single source of truth for auth + cloud sync.
// Cloud data is stored in context state so hooks react to it — no page reload needed.

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, provider, db } from '../firebase'

const LOCAL_KEYS = {
  favorites: 'fxcalc_favorites_v1',
  journal:   'fxcalc_journal_v1',
  alerts:    'fxcalc_alerts_v1',
  settings:  'fx_settings',
}

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

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [syncing, setSyncing]     = useState(false)
  // cloudData holds the data pulled from Firestore on login.
  // Hooks read from here (if set) instead of initialising from localStorage alone.
  const [cloudData, setCloudData] = useState(null)

  // ── Listen to Firebase auth state ────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (!firebaseUser) setCloudData(null)
    })
    return unsub
  }, [])

  // ── On login → pull cloud data into context state ─────────────────────────
  useEffect(() => {
    if (!user) return

    const sync = async () => {
      setSyncing(true)
      try {
        const ref  = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const data = snap.data()
          // Write to localStorage so data survives a manual refresh
          for (const [key, storageKey] of Object.entries(LOCAL_KEYS)) {
            if (data[key] !== undefined && data[key] !== null) {
              try { localStorage.setItem(storageKey, JSON.stringify(data[key])) } catch {}
            }
          }
          // Publish into context — hooks re-render with cloud data, NO page reload
          setCloudData(data)
          console.log('✅ Cloud data loaded into context')
        } else {
          // First ever login — push local data up to Firestore
          const localData = readAllLocal()
          await setDoc(ref, localData, { merge: true })
          console.log('✅ First login — local data pushed to cloud')
        }
      } catch (err) {
        console.error('Cloud sync failed:', err)
      } finally {
        setSyncing(false)
      }
    }

    sync()
  }, [user?.uid]) // only re-run when a different user logs in

  // ── Save one key to cloud + localStorage ─────────────────────────────────
  const saveToCloud = useCallback(async (key, data) => {
    // 1. Write to localStorage immediately (instant, offline-safe)
    const storageKey = LOCAL_KEYS[key]
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch {}
    }
    // 2. Mirror into cloudData context so sibling hooks stay in sync
    setCloudData(prev => prev ? { ...prev, [key]: data } : { [key]: data })
    // 3. Persist to Firestore if signed in
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { [key]: data }, { merge: true })
      } catch (err) {
        console.error(`Failed to save "${key}" to cloud:`, err)
      }
    }
  }, [user])

  // ── Sign in / out ─────────────────────────────────────────────────────────
  const signIn = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Sign-in failed:', err.code, err.message)
      if (err.code === 'auth/unauthorized-domain') {
        alert(
          'Google sign-in is blocked because this domain is not authorised in Firebase.\n\n' +
          'Fix: Firebase Console → Authentication → Settings → Authorised domains → Add this domain.'
        )
      }
    }
  }

  const logOut = async () => {
    await signOut(auth)
    setUser(null)
    setCloudData(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, syncing, cloudData, signIn, logOut, saveToCloud }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}
