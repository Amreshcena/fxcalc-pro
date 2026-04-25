import { useAuthContext } from '../context/AuthContext'

export default function AuthButton() {
  const { user, loading, syncing, signIn, logOut } = useAuthContext()

  if (loading) return (
    <div style={styles.wrap}>
      <span style={styles.hint}>⬡ connecting…</span>
    </div>
  )

  if (syncing) return (
    <div style={styles.wrap}>
      <div style={styles.syncBadge}>
        <span style={styles.syncDot} />
        <span style={styles.syncText}>syncing cloud</span>
      </div>
    </div>
  )

  if (!user) return (
    <div style={styles.wrap}>
      <button onClick={signIn} style={styles.signInBtn} title="Sign in to sync alerts, journal & favorites">
        <svg width="16" height="16" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        <span style={styles.signInText}>Sign in with Google</span>
      </button>
    </div>
  )

  return (
    <div style={styles.wrap}>
      <div style={styles.userCard}>
        <div style={styles.avatarWrap}>
          {user.photoURL
            ? <img src={user.photoURL} width={32} height={32} style={styles.avatar} alt={user.displayName} />
            : <div style={styles.avatarFallback}>{user.displayName?.[0] || '?'}</div>
          }
          <span style={styles.onlineDot} />
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user.displayName?.split(' ')[0]}</span>
          <span style={styles.cloudBadge}>☁ synced</span>
        </div>
        <button onClick={logOut} style={styles.signOutBtn} title="Sign out">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
  },
  signInBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 14px 7px 10px',
    borderRadius: 8,
    border: '1px solid rgba(0,200,255,0.25)',
    cursor: 'pointer',
    background: 'rgba(10,30,50,0.85)',
    backdropFilter: 'blur(8px)',
    color: '#a0c4d8',
    fontSize: 12,
    fontFamily: 'inherit',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    boxShadow: '0 0 12px rgba(0,200,255,0.08)',
  },
  signInText: { fontWeight: 500 },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '5px 10px 5px 6px',
    borderRadius: 10,
    border: '1px solid rgba(0,200,255,0.2)',
    background: 'rgba(10,30,50,0.85)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 0 16px rgba(0,200,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: {
    borderRadius: '50%', display: 'block',
    border: '2px solid rgba(0,200,255,0.4)',
    boxShadow: '0 0 8px rgba(0,200,255,0.3)',
  },
  avatarFallback: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #0a4060, #0d3050)',
    border: '2px solid rgba(0,200,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#00c8ff', fontSize: 14, fontWeight: 700,
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 8, height: 8, borderRadius: '50%',
    background: '#00ff9d',
    border: '1.5px solid #0a1e30',
    boxShadow: '0 0 6px #00ff9d',
  },
  userInfo: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  userName: {
    fontSize: 13, fontWeight: 600, color: '#e0f0ff',
    letterSpacing: '0.3px', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: 90, lineHeight: 1.2,
  },
  cloudBadge: {
    fontSize: 10, color: '#00c8ff', opacity: 0.7,
    letterSpacing: '0.5px', fontFamily: 'monospace', lineHeight: 1,
  },
  signOutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,100,100,0.2)',
    borderRadius: 6,
    color: 'rgba(255,120,120,0.6)',
    cursor: 'pointer',
    padding: '4px 5px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  syncBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8,
    border: '1px solid rgba(0,200,255,0.2)',
    background: 'rgba(10,30,50,0.8)',
  },
  syncDot: {
    display: 'inline-block', width: 7, height: 7,
    borderRadius: '50%', background: '#00c8ff',
    boxShadow: '0 0 8px #00c8ff',
  },
  syncText: {
    fontSize: 11, color: '#00c8ff',
    fontFamily: 'monospace', letterSpacing: '0.5px', opacity: 0.8,
  },
  hint: {
    fontSize: 11, color: 'rgba(0,200,255,0.4)',
    fontFamily: 'monospace', letterSpacing: '1px',
  },
}
