import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  // ✅ Lazy init — check if user already signed in
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firebase auto-restores session — no re-login needed on refresh
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Sign in failed:', err.message)
    }
  }

  const logOut = async () => {
    await signOut(auth)
    setUser(null)
  }

  return { user, loading, signIn, logOut }
}