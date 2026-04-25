// src/components/AuthButton.jsx
// Responsive: compact icon-only on mobile, full card on desktop
import { useAuthContext } from '../context/AuthContext'

const G_LOGO = (
  <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0, display: 'block' }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
)

const SIGNOUT_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function AuthButton() {
  const { user, loading, syncing, signIn, logOut } = useAuthContext()

  if (loading) return <div className="auth-btn-wrap"><span className="auth-hint">⬡</span></div>

  if (syncing) return (
    <div className="auth-btn-wrap">
      <div className="auth-sync">
        <span className="auth-sync-dot" />
        <span className="auth-sync-text">syncing…</span>
      </div>
    </div>
  )

  if (!user) return (
    <div className="auth-btn-wrap">
      {/* Mobile: round G logo button */}
      <button onClick={signIn} className="auth-signin-icon" title="Sign in with Google" aria-label="Sign in with Google">
        {G_LOGO}
      </button>
      {/* Desktop: full text button */}
      <button onClick={signIn} className="auth-signin-full" title="Sign in to sync your data">
        {G_LOGO}
        <span>Sign in with Google</span>
      </button>
    </div>
  )

  return (
    <div className="auth-btn-wrap">
      <div className="auth-user-card">
        {/* Avatar */}
        <div className="auth-avatar-wrap">
          {user.photoURL
            ? <img src={user.photoURL} width={30} height={30} className="auth-avatar" alt={user.displayName} />
            : <div className="auth-avatar-fallback">{user.displayName?.[0]?.toUpperCase() || 'U'}</div>
          }
          <span className="auth-online-dot" />
        </div>
        {/* Name + badge — hidden on mobile */}
        <div className="auth-user-info">
          <span className="auth-username">{user.displayName?.split(' ')[0]}</span>
          <span className="auth-cloud-badge">☁ synced</span>
        </div>
        {/* Sign out */}
        <button onClick={logOut} className="auth-signout-btn" title="Sign out" aria-label="Sign out">
          {SIGNOUT_ICON}
        </button>
      </div>
    </div>
  )
}
