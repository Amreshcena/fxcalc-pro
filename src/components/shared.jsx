import { useState } from 'react'
import { PAIR_GROUPS, LOT_SIZES, ACCOUNT_CURRENCIES } from '../utils/constants'
import { useFavorites } from '../hooks/useFavorites'
import styles from './shared.module.css'

export function Field({ label, children, span2 }) {
  return (
    <div className={`${styles.field} ${span2 ? styles.span2 : ''}`}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  )
}

export function ResultRow({ label, value, color = 'green' }) {
  const [copied, setCopied] = useState(false)
  const colorClass = color === 'red' ? styles.red : color === 'blue' ? styles.blue : styles.green

  const handleCopy = () => {
    navigator.clipboard?.writeText(String(value)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={styles.resultRow} onClick={handleCopy} title="Click to copy">
      <span className={styles.resultLabel}>{label}</span>
      <div className={styles.resultRight}>
        <span className={`${styles.resultValue} ${colorClass}`}>{value}</span>
        <span className={styles.copyHint}>{copied ? '✓' : '⎘'}</span>
      </div>
    </div>
  )
}

export function PairSelect({ value, onChange }) {
  const { favorites, toggle, isFav } = useFavorites()
  return (
    <div className={styles.pairRow}>
      <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
        {favorites.length > 0 && (
          <optgroup label="★ Favorites">
            {favorites.map(p => <option key={p} value={p}>{p}</option>)}
          </optgroup>
        )}
        {Object.entries(PAIR_GROUPS).map(([group, pairs]) => (
          <optgroup key={group} label={group}>
            {pairs.map(p => <option key={p} value={p}>{p}</option>)}
          </optgroup>
        ))}
      </select>
      <button
        className={`${styles.favBtn} ${isFav(value) ? styles.favActive : ''}`}
        onClick={() => toggle(value)}
        title={isFav(value) ? 'Remove from favorites' : 'Add to favorites'}
        type="button"
      >★</button>
    </div>
  )
}

export function LotTypeSelect({ value, onChange }) {
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      {Object.entries(LOT_SIZES).map(([name, size]) => (
        <option key={name} value={name}>{name} ({size.toLocaleString()} units)</option>
      ))}
    </select>
  )
}

export function AccountCcySelect({ value, onChange }) {
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      {ACCOUNT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  )
}

export function CalcButton({ onClick, children }) {
  return (
    <button className={styles.btn} onClick={onClick}>
      {children}
    </button>
  )
}

export function ResultsBlock({ children }) {
  return <div className={styles.results}>{children}</div>
}
