import { useState, useEffect } from 'react'
import { TABS } from '../utils/constants'
import { useRates }     from '../hooks/useRates'
import { useTheme }     from '../hooks/useTheme'
import RatesBar         from './RatesBar'
import PipValueTab      from './PipValueTab'
import PipDiffTab       from './PipDiffTab'
import PositionSizeTab  from './PositionSizeTab'
import LeverageTab      from './LeverageTab'
import MarginTab        from './MarginTab'
import PnLTab           from './PnLTab'
import RiskRewardTab    from './RiskRewardTab'
import JournalTab       from './JournalTab'
import CompoundTab      from './CompoundTab'
import SwapTab          from './SwapTab'
import BreakEvenTab     from './BreakEvenTab'
import ExposureTab      from './ExposureTab'
import ConverterTab     from './ConverterTab'
import TradingViewTab from './TradingViewTab'
import AlertsTab      from './AlertsTab'  
import styles from './ForexCalculator.module.css'

export default function ForexCalculator() {
  const [activeTab, setActiveTab] = useState(0)
  const { rates, loading, lastUpdated, error } = useRates()
  const { theme, toggle: toggleTheme } = useTheme()

  // Keyboard shortcuts: 1-9 to switch tabs, left/right arrows
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1
        if (idx < TABS.length) setActiveTab(idx)
      }
      if (e.key === 'ArrowRight') setActiveTab(t => Math.min(t + 1, TABS.length - 1))
      if (e.key === 'ArrowLeft')  setActiveTab(t => Math.max(t - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const tabPanels = [
    <PipValueTab     rates={rates} />,
    <PipDiffTab />,
    <PositionSizeTab rates={rates} />,
    <LeverageTab />,
    <MarginTab />,
    <PnLTab          rates={rates} />,
    <RiskRewardTab   rates={rates} />,
    <SwapTab />,
    <BreakEvenTab    rates={rates} />,
    <ExposureTab     rates={rates} />,
    <ConverterTab    rates={rates} />,
    <JournalTab />,
    <CompoundTab />,
    <TradingViewTab />,       
  <AlertsTab rates={rates} />,  
  ]

  return (
    <div className={styles.app}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.logo}>⬡ Forex Terminal</p>
          <h1 className={styles.title}>FX<span>WOLFIX</span> PRO</h1>
        </div>
        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </header>

      {/* ── Live Rates Bar ── */}
      <RatesBar rates={rates} loading={loading} />

      {/* ── Tab Navigation ── */}
      <nav className={styles.tabs} role="tablist">
        {TABS.map((label, i) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === i}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── Calculator Card ── */}
      <main className={styles.card}>
        <div className={styles.statusBar}>
          <span className={styles.liveDot} />
          <span className={styles.statusText}>
            {lastUpdated
              ? `RATES LIVE · UPDATED ${lastUpdated}`
              : 'CONNECTING TO RATE FEED…'}
          </span>
          {error && <span className={styles.errorBadge}>{error}</span>}
        </div>

        <p className={styles.cardTitle}>◈ {TABS[activeTab]}</p>

        <div role="tabpanel">
          {tabPanels[activeTab]}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        RATES VIA FRANKFURTER.APP &nbsp;·&nbsp; FOR EDUCATIONAL USE ONLY &nbsp;·&nbsp; KEYS 1–9 / ← → TO SWITCH TABS
      </footer>
    </div>
  )
}
