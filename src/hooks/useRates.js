import { useState, useEffect, useCallback } from 'react'

const FETCH_INTERVAL_MS = 60_000

// ── fawazahmed0 Exchange API (via jsDelivr CDN — no key, free, reliable) ─────
// usd.json  → all currencies priced relative to USD (forex + metals XAU/XAG + all crypto)
// xau.json  → all currencies priced relative to XAU (gives XAU/EUR, XAU/GBP, XAU/JPY etc.)
const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies'
const USD_URL  = `${CDN_BASE}/usd.min.json`
const XAU_URL  = `${CDN_BASE}/xau.min.json`

// Frankfurter used as primary for standard forex (fast, small payload)
const IS_DEV = import.meta.env.DEV
const FOREX_CCYS = 'EUR,GBP,JPY,CHF,AUD,CAD,NZD,SEK,NOK,DKK,SGD,HKD,MXN,ZAR,TRY,CNY,INR,BRL,PLN,CZK,HUF'
const FRANKFURTER_URL = IS_DEV
  ? `/api/rates?from=USD&to=${FOREX_CCYS}`
  : `https://api.frankfurter.app/latest?from=USD&to=${FOREX_CCYS}`

// Symbols to extract from usd.json (metals + crypto)
const EXTRA_SYMS = ['xau', 'xag', 'btc', 'eth', 'bnb', 'xrp', 'sol', 'ada', 'doge', 'ltc', 'eur', 'gbp']

// ── Build bidirectional cross rates from a { sym: unitsPerUSD } map ──────────
function buildRates(usdRates) {
  const r = {}
  const list = Object.keys(usdRates)
  list.forEach(ccy => {
    r[`USD/${ccy.toUpperCase()}`] = usdRates[ccy]
    r[`${ccy.toUpperCase()}/USD`] = 1 / usdRates[ccy]
  })
  list.forEach(a => {
    list.forEach(b => {
      if (a !== b) {
        r[`${a.toUpperCase()}/${b.toUpperCase()}`] = usdRates[b] / usdRates[a]
      }
    })
  })
  return r
}

// ── Forex via Frankfurter (fast, small payload) ───────────────────────────────
async function fetchFrankfurter() {
  const res = await fetch(FRANKFURTER_URL)
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`)
  const data = await res.json()
  if (!data.rates) throw new Error('No rates')
  return buildRates(
    Object.fromEntries(Object.entries(data.rates).map(([k, v]) => [k.toLowerCase(), v]))
  )
}

// ── usd.json: forex fallback + metals (XAU, XAG) + crypto ────────────────────
// data.usd[sym] = how many sym per 1 USD
//   e.g. data.usd.xau = 0.000217  →  XAU/USD = 1 / 0.000217 = ~4591
//   e.g. data.usd.eur = 0.854     →  EUR/USD = 1 / 0.854     = ~1.17
async function fetchUsdJson(forForex = false) {
  const res = await fetch(USD_URL)
  if (!res.ok) throw new Error(`usd.json HTTP ${res.status}`)
  const data = await res.json()
  if (!data.usd) throw new Error('No usd key in response')

  const wanted = forForex
    ? [...FOREX_CCYS.toLowerCase().split(','), ...EXTRA_SYMS]
    : EXTRA_SYMS

  const usdRates = {}
  for (const sym of wanted) {
    const raw = data.usd[sym]
    if (raw && raw > 0) usdRates[sym] = raw
  }
  return buildRates(usdRates)
}

// ── xau.json: XAU cross pairs directly ───────────────────────────────────────
// data.xau[sym] = how many sym per 1 XAU (i.e. XAU/sym value)
//   e.g. data.xau.usd = 4591  →  XAU/USD = 4591  ✓
//   e.g. data.xau.eur = 3921  →  XAU/EUR = 3921  ✓
async function fetchXauCrosses() {
  const res = await fetch(XAU_URL)
  if (!res.ok) throw new Error(`xau.json HTTP ${res.status}`)
  const data = await res.json()
  if (!data.xau) throw new Error('No xau key in response')

  const crosses = {}
  const wantedQuotes = ['usd', 'eur', 'gbp', 'jpy', 'chf', 'aud', 'cad']
  for (const q of wantedQuotes) {
    const val = data.xau[q]
    if (val && val > 0) {
      crosses[`XAU/${q.toUpperCase()}`] = val
      crosses[`${q.toUpperCase()}/XAU`] = 1 / val
    }
  }
  return crosses
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useRates() {
  const [rates,       setRates      ] = useState({})
  const [loading,     setLoading    ] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error,       setError      ] = useState(null)

  const fetchRates = useCallback(async () => {
    let forexRates = {}
    let forexOk    = false

    // ── Step 1: Forex ──────────────────────────────────────────────────────
    try {
      forexRates = await fetchFrankfurter()
      forexOk = true
    } catch (e1) {
      console.warn('[useRates] Frankfurter failed:', e1.message)
      try {
        // usd.json covers both forex + extras in one shot
        const all = await fetchUsdJson(true)
        const xauCrosses = await fetchXauCrosses().catch(() => ({}))
        setRates({ ...all, ...xauCrosses })
        setLastUpdated(new Date().toLocaleTimeString())
        setError(null)
        setLoading(false)
        return true
      } catch (e2) {
        console.error('[useRates] All endpoints failed:', e2.message)
        setError('Rate feed unavailable. Calculations will use manual price inputs.')
        setLoading(false)
        return false
      }
    }

    // ── Step 2: Metals + Crypto + XAU crosses (parallel) ──────────────────
    const [extrasResult, xauResult] = await Promise.allSettled([
      fetchUsdJson(false),   // only EXTRA_SYMS
      fetchXauCrosses(),
    ])

    let extrasRates = {}
    let xauCrosses  = {}

    if (extrasResult.status === 'fulfilled') {
      extrasRates = extrasResult.value
    } else {
      console.warn('[useRates] Extras (metals/crypto) failed:', extrasResult.reason?.message)
    }

    if (xauResult.status === 'fulfilled') {
      xauCrosses = xauResult.value
    } else {
      console.warn('[useRates] XAU crosses failed:', xauResult.reason?.message)
    }

    setRates({ ...forexRates, ...extrasRates, ...xauCrosses })
    setLastUpdated(new Date().toLocaleTimeString())
    setError(null)
    setLoading(false)
    return true
  }, [])

  useEffect(() => {
    fetchRates()
    const timer = setInterval(fetchRates, FETCH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [fetchRates])

  return { rates, loading, lastUpdated, error, refetch: fetchRates }
}
