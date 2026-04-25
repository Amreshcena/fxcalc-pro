import { useState, useEffect, useRef, useCallback } from 'react'
import { PAIRS } from '../utils/constants'
import { PairSelect } from './shared'
import { useAuthContext } from '../context/AuthContext'
import a from './AlertsTab.module.css'

const STORAGE_KEY = 'fxcalc_alerts_v1'

function loadAlerts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

// Play a beeping sound for 30 seconds using Web Audio API.
// Works even when the tab is in the background (audio is pre-scheduled).
// Returns a stop() function to cancel it early.
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    let stopped = false
    const endTime = ctx.currentTime + 30  // ring for 30 seconds

    const beep = (startAt) => {
      if (stopped || startAt >= endTime) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, startAt)
      osc.frequency.setValueAtTime(660, startAt + 0.1)
      gain.gain.setValueAtTime(0.4, startAt)
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.4)
      osc.start(startAt)
      osc.stop(startAt + 0.4)
      const delay = (startAt - ctx.currentTime + 1.2) * 1000
      setTimeout(() => beep(ctx.currentTime + 0.05), delay)
    }

    beep(ctx.currentTime)

    return () => {
      stopped = true
      try { ctx.close() } catch (_) { }
    }
  } catch (e) {
    console.warn('Alert sound failed:', e)
    return () => { }
  }
}

let alertIdCounter = Date.now()

export default function AlertsTab({ rates }) {
  const [alerts, setAlerts] = useState(loadAlerts)
  const [pair, setPair] = useState('EUR/USD')
  const [condition, setCondition] = useState('above') // 'above' | 'below'
  const [targetPrice, setTargetPrice] = useState('')
  const [notifPerm, setNotifPerm] = useState(Notification?.permission || 'default')
  const [triggered, setTriggered] = useState([])     // ids of recently triggered
  const [soundPlaying, setSoundPlaying] = useState(false)
  const intervalRef = useRef(null)
  const stopSoundRef = useRef(null)
  const { saveToCloud, cloudData } = useAuthContext()

  // When cloud data arrives after login, update state reactively (no reload)
  useEffect(() => {
    if (cloudData?.alerts) {
      setAlerts(cloudData.alerts)
    }
  }, [cloudData?.alerts])

  // Persist alerts to localStorage + Firestore
  const persistAlerts = useCallback((updated) => {
    saveToCloud('alerts', updated)
  }, [saveToCloud])

  // Request notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
  }

  // Stop alert sound helper
  const stopSound = () => {
    if (stopSoundRef.current) {
      stopSoundRef.current()
      stopSoundRef.current = null
    }
    setSoundPlaying(false)
  }

  // Add alert
  const addAlert = () => {
    const price = parseFloat(targetPrice)
    if (!pair || isNaN(price) || price <= 0) return

    const newAlert = {
      id: ++alertIdCounter,
      pair,
      condition,
      targetPrice: price,
      createdAt: new Date().toISOString(),
      active: true,
      triggered: false,
    }

    setAlerts(prev => {
      const updated = [newAlert, ...prev]
      persistAlerts(updated)
      return updated
    })
    setTargetPrice('')
  }

  // Remove alert
  const removeAlert = (id) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== id)
      persistAlerts(updated)
      return updated
    })
  }

  // Toggle active
  const toggleAlert = (id) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, active: !a.active } : a)
      persistAlerts(updated)
      return updated
    })
  }

  // Check alerts against live rates
  const checkAlerts = useCallback(() => {
    if (!rates || Object.keys(rates).length === 0) return

    setAlerts(prev => {
      let changed = false
      const updated = prev.map(alert => {
        if (!alert.active || alert.triggered) return alert

        const { base, quote } = PAIRS[alert.pair] || {}
        const currentRate = rates[`${base}/${quote}`]
        if (!currentRate) return alert

        const hit = alert.condition === 'above'
          ? currentRate >= alert.targetPrice
          : currentRate <= alert.targetPrice

        if (hit) {
          changed = true

          if (stopSoundRef.current) stopSoundRef.current()
          const stop = playAlertSound()
          stopSoundRef.current = stop
          setSoundPlaying(true)

          setTimeout(() => {
            stopSoundRef.current = null
            setSoundPlaying(false)
          }, 30000)

          if (notifPerm === 'granted') {
            new Notification(`🔔 FXCalc Alert — ${alert.pair}`, {
              body: `Price is ${alert.condition} ${alert.targetPrice} — Current: ${currentRate.toFixed(5)}`,
              icon: '/favicon.svg',
            })
          }

          setTriggered(t => [...t, alert.id])
          setTimeout(() => setTriggered(t => t.filter(x => x !== alert.id)), 3000)

          return { ...alert, triggered: true, triggeredAt: new Date().toISOString(), triggeredRate: currentRate }
        }
        return alert
      })

      if (changed) persistAlerts(updated)
      return changed ? updated : prev
    })
  }, [rates, notifPerm, persistAlerts])

  // Poll every 10 seconds
  useEffect(() => {
    intervalRef.current = setInterval(checkAlerts, 10000)
    return () => clearInterval(intervalRef.current)
  }, [checkAlerts])

  // Cleanup sound on unmount
  useEffect(() => {
    return () => { if (stopSoundRef.current) stopSoundRef.current() }
  }, [])

  const { base, quote } = PAIRS[pair] || {}
  const currentRate = rates[`${base}/${quote}`]
  const isJpy = PAIRS[pair]?.isJpy
  const decimals = isJpy ? 3 : 5

  const activeAlerts = alerts.filter(a => a.active && !a.triggered)
  const triggeredAlerts = alerts.filter(a => a.triggered)

  return (
    <div>
      {/* Notification permission banner */}
      {notifPerm !== 'granted' && (
        <div className={a.permBanner}>
          <span className={a.permIcon}>🔔</span>
          <span>Enable browser notifications to receive alerts — with sound — even when on another tab.</span>
          <button className={a.permBtn} onClick={requestPermission}>
            {notifPerm === 'denied' ? 'Notifications Blocked in Browser' : 'Enable Notifications'}
          </button>
        </div>
      )}
      {notifPerm === 'granted' && (
        <div className={a.permGranted}>
          <span>✅ Browser notifications enabled — alerts will fire with sound in the background</span>
        </div>
      )}

      {/* Add Alert Form */}
      <div className={a.formCard}>
        <div className={a.formTitle}>◈ Set New Price Alert</div>
        <div className={a.formRow}>
          <div className={a.formField}>
            <span className={a.lbl}>Currency Pair</span>
            <PairSelect value={pair} onChange={setPair} />
          </div>
          <div className={a.formField}>
            <span className={a.lbl}>Condition</span>
            <div className={a.condGroup}>
              <button
                className={`${a.condBtn} ${condition === 'above' ? a.condAbove : ''}`}
                onClick={() => setCondition('above')}
              >▲ Price Above</button>
              <button
                className={`${a.condBtn} ${condition === 'below' ? a.condBelow : ''}`}
                onClick={() => setCondition('below')}
              >▼ Price Below</button>
            </div>
          </div>
          <div className={a.formField}>
            <span className={a.lbl}>
              Target Price
              {currentRate && (
                <span className={a.currentRate}>
                  &nbsp;· Current: {currentRate.toFixed(decimals)}
                </span>
              )}
            </span>
            <input
              className={a.input}
              type="number"
              step="0.00001"
              placeholder={isJpy ? '150.500' : '1.08500'}
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAlert()}
            />
          </div>
          <div className={a.formField} style={{ justifyContent: 'flex-end' }}>
            <button className={a.addBtn} onClick={addAlert}>+ Add Alert</button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className={a.statsRow}>
        <div className={a.statChip}>
          <span className={a.statLbl}>Active</span>
          <span className={a.statVal} style={{ color: 'var(--blue)' }}>{activeAlerts.length}</span>
        </div>
        <div className={a.statChip}>
          <span className={a.statLbl}>Triggered</span>
          <span className={a.statVal} style={{ color: 'var(--green)' }}>{triggeredAlerts.length}</span>
        </div>
        <div className={a.statChip}>
          <span className={a.statLbl}>Total</span>
          <span className={a.statVal}>{alerts.length}</span>
        </div>
        <div className={a.statChip}>
          <span className={a.statLbl}>Polling</span>
          <span className={a.statVal} style={{ color: 'var(--green)', fontSize: 12 }}>Every 10s</span>
        </div>
      </div>

      {/* Stop Sound Button */}
      {soundPlaying && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <button
            className={a.clearBtn}
            onClick={stopSound}
            style={{ background: '#e53935', color: '#fff', border: 'none', animation: 'pulse 1s infinite' }}
          >
            🔇 Stop Alert Sound
          </button>
        </div>
      )}

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className={a.empty}>
          <span className={a.emptyIcon}>🔔</span>
          <p className={a.emptyTitle}>No alerts set</p>
          <p className={a.emptySub}>Add a price alert above to get notified when a pair hits your target</p>
        </div>
      ) : (
        <div className={a.alertList}>
          {alerts.map(alert => {
            const isFlashing = triggered.includes(alert.id)
            const { base, quote } = PAIRS[alert.pair] || {}
            const liveRate = rates[`${base}/${quote}`]
            const dp = PAIRS[alert.pair]?.isJpy ? 3 : 5

            return (
              <div
                key={alert.id}
                className={`${a.alertCard} ${alert.triggered ? a.alertDone : ''} ${isFlashing ? a.alertFlash : ''} ${!alert.active && !alert.triggered ? a.alertMuted : ''}`}
              >
                <div className={a.alertLeft}>
                  <span className={a.alertPair}>{alert.pair}</span>
                  <span className={`${a.alertCond} ${alert.condition === 'above' ? a.condAboveText : a.condBelowText}`}>
                    {alert.condition === 'above' ? '▲ Above' : '▼ Below'}
                  </span>
                  <span className={a.alertTarget}>{alert.targetPrice.toFixed(dp)}</span>
                  {liveRate && !alert.triggered && (
                    <span className={a.alertCurrent}>
                      now: {liveRate.toFixed(dp)}
                    </span>
                  )}
                  {alert.triggered && (
                    <span className={a.alertHit}>
                      ✓ Hit at {alert.triggeredRate?.toFixed(dp)} · {new Date(alert.triggeredAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className={a.alertRight}>
                  {!alert.triggered && (
                    <button
                      className={`${a.toggleBtn} ${alert.active ? a.toggleOn : a.toggleOff}`}
                      onClick={() => toggleAlert(alert.id)}
                      title={alert.active ? 'Pause alert' : 'Resume alert'}
                    >
                      {alert.active ? '⏸' : '▶'}
                    </button>
                  )}
                  <button
                    className={a.removeBtn}
                    onClick={() => removeAlert(alert.id)}
                    title="Delete alert"
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <button
          className={a.clearBtn}
          onClick={() => { setAlerts([]); persistAlerts([]) }}
        >
          🗑 Clear All Alerts
        </button>
      )}
    </div>
  )
}
