import { useState, useEffect, useRef } from 'react'
import { PAIRS } from '../utils/constants'
import t from './TradingViewTab.module.css'

const CHART_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP',
  'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'EUR/AUD',
  'USD/SGD', 'USD/MXN', 'USD/ZAR', 'USD/TRY',
]

const INTERVALS = [
  { label: '1m',  value: '1'   },
  { label: '5m',  value: '5'   },
  { label: '15m', value: '15'  },
  { label: '30m', value: '30'  },
  { label: '1H',  value: '60'  },
  { label: '4H',  value: '240' },
  { label: '1D',  value: 'D'   },
  { label: '1W',  value: 'W'   },
]

const THEMES = [
  { label: '☾ Dark',  value: 'dark'  },
  { label: '☀ Light', value: 'light' },
]

export default function TradingViewTab() {
  const [pair,     setPair    ] = useState('EUR/USD')
  const [interval, setInterval] = useState('60')
  const [theme,    setTheme   ] = useState('dark')
  const [studies,  setStudies ] = useState(['RSI', 'MACD'])
  const containerRef = useRef(null)
  const widgetRef    = useRef(null)

  // Convert "EUR/USD" → "FX:EURUSD"
  const toSymbol = (p) => `FX:${p.replace('/', '')}`

  const toggleStudy = (s) => {
    setStudies(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Remove old widget
    if (widgetRef.current) {
      containerRef.current.innerHTML = ''
    }

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize:          true,
      symbol:            toSymbol(pair),
      interval:          interval,
      timezone:          'Etc/UTC',
      theme:             theme,
      style:             '1',
      locale:            'en',
      enable_publishing: false,
      hide_top_toolbar:  false,
      hide_legend:       false,
      save_image:        true,
      calendar:          false,
      studies:           studies,
      container_id:      'tv_chart_container',
    })

    containerRef.current.appendChild(script)
    widgetRef.current = script

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [pair, interval, theme, studies])

  return (
    <div>
      {/* Controls */}
      <div className={t.controls}>
        {/* Pair selector */}
        <div className={t.controlGroup}>
          <span className={t.ctrlLabel}>PAIR</span>
          <select
            className={t.select}
            value={pair}
            onChange={e => setPair(e.target.value)}
          >
            {CHART_PAIRS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Interval buttons */}
        <div className={t.controlGroup}>
          <span className={t.ctrlLabel}>TIMEFRAME</span>
          <div className={t.btnGroup}>
            {INTERVALS.map(iv => (
              <button
                key={iv.value}
                className={`${t.ivBtn} ${interval === iv.value ? t.ivActive : ''}`}
                onClick={() => setInterval(iv.value)}
              >
                {iv.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <div className={t.controlGroup}>
          <span className={t.ctrlLabel}>THEME</span>
          <div className={t.btnGroup}>
            {THEMES.map(th => (
              <button
                key={th.value}
                className={`${t.ivBtn} ${theme === th.value ? t.ivActive : ''}`}
                onClick={() => setTheme(th.value)}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className={t.controlGroup}>
          <span className={t.ctrlLabel}>INDICATORS</span>
          <div className={t.btnGroup}>
            {['RSI', 'MACD', 'Volume', 'BB'].map(s => (
              <button
                key={s}
                className={`${t.ivBtn} ${studies.includes(s) ? t.ivActive : ''}`}
                onClick={() => toggleStudy(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className={t.chartWrap}>
        <div
          id="tv_chart_container"
          ref={containerRef}
          className={t.chart}
        />
      </div>

      <p className={t.credit}>
        Charts powered by <a href="https://www.tradingview.com" target="_blank" rel="noreferrer">TradingView</a>
      </p>
    </div>
  )
}
