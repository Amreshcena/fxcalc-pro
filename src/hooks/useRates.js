import { useState, useEffect, useCallback } from 'react'

const FETCH_INTERVAL_MS = 60_000
const CCYS = 'EUR,GBP,JPY,CHF,AUD,CAD,NZD,SEK,NOK,DKK,SGD,HKD,MXN,ZAR,TRY,CNY,INR,BRL,PLN,CZK,HUF'

// Multiple endpoints tried in order — first success wins
// In dev: use Vite proxy (/api/rates) to avoid CORS
// In prod: use direct URL
const IS_DEV = import.meta.env.DEV
const FRANKFURTER_URL = IS_DEV
  ? `/api/rates?from=USD&to=${CCYS}`
  : `https://api.frankfurter.app/latest?from=USD&to=${CCYS}`
const FALLBACK_URL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`

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

async function fetchFrankfurter() {
  const res = await fetch(FRANKFURTER_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!data.rates) throw new Error('No rates in response')
  return buildRates(
    Object.fromEntries(Object.entries(data.rates).map(([k, v]) => [k.toLowerCase(), v]))
  )
}

async function fetchJsDelivr() {
  const res = await fetch(FALLBACK_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!data.usd) throw new Error('No usd in response')
  // filter to only the currencies we need
  const needed = CCYS.toLowerCase().split(',')
  const filtered = Object.fromEntries(
    Object.entries(data.usd).filter(([k]) => needed.includes(k))
  )
  return buildRates(filtered)
}

export function useRates() {
  const [rates,       setRates      ] = useState({})
  const [loading,     setLoading    ] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error,       setError      ] = useState(null)

  const fetchRates = useCallback(async () => {
    // Try primary endpoint first, fall back to secondary
    let success = false

    try {
      const r = await fetchFrankfurter()
      setRates(r)
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
      success = true
    } catch (e1) {
      console.warn('[useRates] Primary endpoint failed:', e1.message, '— trying fallback...')
      try {
        const r = await fetchJsDelivr()
        setRates(r)
        setLastUpdated(new Date().toLocaleTimeString())
        setError(null)
        success = true
      } catch (e2) {
        console.error('[useRates] Both endpoints failed:', e2.message)
        setError('Rate feed unavailable. Calculations will use manual price inputs.')
      }
    }

    setLoading(false)
    return success
  }, [])

  useEffect(() => {
    fetchRates()
    const timer = setInterval(fetchRates, FETCH_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [fetchRates])

  return { rates, loading, lastUpdated, error, refetch: fetchRates }
}
