import { useState, useEffect, useRef } from 'react'
import t from './TradingViewTab.module.css'

const THEMES = [
  { label: '☾ Dark',  value: 'dark'  },
  { label: '☀ Light', value: 'light' },
]

const STUDIES_MAP = {
  RSI:    'STD;RSI',
  MACD:   'STD;MACD',
  Volume: 'STD;Volume',
  BB:     'STD;Bollinger_Bands',
}
   
let widgetInstance = null  // module-level ref to destroy old widget properly

export default function TradingViewTab() {
  const [theme,   setTheme  ] = useState('dark')
  const [studies, setStudies] = useState(['RSI', 'MACD'])
  const containerRef = useRef(null)

  const toggleStudy = (s) => {
    setStudies(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  useEffect(() => {
    // Destroy previous widget instance completely before creating a new one
    if (widgetInstance) {
      try { widgetInstance.remove() } catch (_) {}
      widgetInstance = null
    }

    // Clear container HTML
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    const containerId = 'tv_chart_container'

    const initWidget = () => {
      if (!window.TradingView || !containerRef.current) return

      widgetInstance = new window.TradingView.widget({
        // Sizing — let CSS control width, fix height explicitly
        width:    '100%',
        height:   580,
        autosize: false,

        symbol:   'FX:EURUSD',
        interval: '60',
        timezone: 'Etc/UTC',
        theme:    theme,
        style:    '1',
        locale:   'en',

        toolbar_bg:        theme === 'dark' ? '#1a1d2e' : '#f1f3fb',
        enable_publishing: false,
        allow_symbol_change: true,   // symbol search in top bar
        hide_top_toolbar:  false,
        hide_legend:       false,
        hide_side_toolbar: false,    // keeps drawing tools visible
        save_image:        true,
        withdateranges:    true,

        // Use proper study IDs — short names like "RSI" cause 404 errors
        studies: studies.map(s => STUDIES_MAP[s]).filter(Boolean),

        container_id: containerId,
      })
    }

    // If tv.js is already loaded just init, else load it first
    if (window.TradingView) {
      initWidget()
    } else {
      // Remove any stale tv.js script tags
      document.querySelectorAll('script[src="https://s3.tradingview.com/tv.js"]')
        .forEach(s => s.remove())

      const script = document.createElement('script')
      script.src   = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = initWidget
      document.head.appendChild(script)
    }

    return () => {
      if (widgetInstance) {
        try { widgetInstance.remove() } catch (_) {}
        widgetInstance = null
      }
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [theme, studies])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Controls */}
      <div className={t.controls}>

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
            {Object.keys(STUDIES_MAP).map(s => (
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

      {/* Chart wrapper — fills remaining space */}
      <div
        className={t.chartWrap}
        style={{ flex: 1, minHeight: 580, position: 'relative', width: '100%' }}
      >
        <div
          id="tv_chart_container"
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,          // top:0 right:0 bottom:0 left:0
            width:  '100%',
            height: '100%',
          }}
        />
      </div>

      <p className={t.credit}>
        Charts powered by{' '}
        <a href="https://www.tradingview.com" target="_blank" rel="noreferrer">
          TradingView   
        </a>
      </p>
    </div>
  )
}
