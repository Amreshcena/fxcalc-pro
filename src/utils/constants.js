// ─── PAIR GROUPS (used for grouped <select> dropdowns) ──────────────────────
export const PAIR_GROUPS = {
  '⬡ Majors': [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
    'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/SEK',
    'USD/NOK', 'USD/DKK', 'USD/SGD', 'USD/HKD',
    'USD/MXN', 'USD/ZAR', 'USD/TRY', 'USD/CNH',
    'USD/INR', 'USD/BRL', 'USD/PLN', 'USD/CZK',
    'USD/HUF',
  ],
  '◈ EUR Crosses': [
    'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD',
    'EUR/CAD', 'EUR/NZD', 'EUR/SEK', 'EUR/NOK',
    'EUR/DKK', 'EUR/SGD', 'EUR/TRY', 'EUR/ZAR',
    'EUR/PLN', 'EUR/CZK', 'EUR/HUF',
  ],
  '◉ GBP Crosses': [
    'GBP/JPY', 'GBP/CHF', 'GBP/AUD', 'GBP/CAD',
    'GBP/NZD', 'GBP/SEK', 'GBP/NOK', 'GBP/SGD',
    'GBP/ZAR',
  ],
  '◌ JPY Crosses': [
    'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY',
    'SGD/JPY', 'HKD/JPY', 'MXN/JPY', 'ZAR/JPY',
    'TRY/JPY',
  ],
  '◫ Commodity Crosses': [
    'AUD/CAD', 'AUD/CHF', 'AUD/NZD', 'AUD/SGD',
    'CAD/CHF', 'CAD/SGD', 'NZD/CAD', 'NZD/CHF',
    'NZD/SGD',
  ],
  '⬡ Metals & Commodities': [
    'XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD',
    'XAU/EUR', 'XAU/GBP', 'XAU/JPY',
    'USOIL/USD', 'UKOIL/USD',
  ],
  '⬡ Crypto': [
    'BTC/USD', 'ETH/USD', 'BNB/USD', 'XRP/USD',
    'SOL/USD', 'ADA/USD', 'DOGE/USD', 'LTC/USD',
    'BTC/EUR', 'ETH/EUR',
  ],  
}

// ─── PAIR METADATA ──────────────────────────────────────────────────────────
export const PAIRS = {
  // MAJORS
  'EUR/USD': { base: 'EUR', quote: 'USD', isJpy: false },
  'GBP/USD': { base: 'GBP', quote: 'USD', isJpy: false },
  'USD/JPY': { base: 'USD', quote: 'JPY', isJpy: true  },
  'USD/CHF': { base: 'USD', quote: 'CHF', isJpy: false },
  'AUD/USD': { base: 'AUD', quote: 'USD', isJpy: false },
  'USD/CAD': { base: 'USD', quote: 'CAD', isJpy: false },
  'NZD/USD': { base: 'NZD', quote: 'USD', isJpy: false },
  'USD/SEK': { base: 'USD', quote: 'SEK', isJpy: false },
  'USD/NOK': { base: 'USD', quote: 'NOK', isJpy: false },
  'USD/DKK': { base: 'USD', quote: 'DKK', isJpy: false },
  'USD/SGD': { base: 'USD', quote: 'SGD', isJpy: false },
  'USD/HKD': { base: 'USD', quote: 'HKD', isJpy: false },
  'USD/MXN': { base: 'USD', quote: 'MXN', isJpy: false },
  'USD/ZAR': { base: 'USD', quote: 'ZAR', isJpy: false },
  'USD/TRY': { base: 'USD', quote: 'TRY', isJpy: false },
  'USD/CNH': { base: 'USD', quote: 'CNH', isJpy: false },
  'USD/INR': { base: 'USD', quote: 'INR', isJpy: false },
  'USD/BRL': { base: 'USD', quote: 'BRL', isJpy: false },
  'USD/PLN': { base: 'USD', quote: 'PLN', isJpy: false },
  'USD/CZK': { base: 'USD', quote: 'CZK', isJpy: false },
  'USD/HUF': { base: 'USD', quote: 'HUF', isJpy: false },
  // EUR CROSSES
  'EUR/GBP': { base: 'EUR', quote: 'GBP', isJpy: false },
  'EUR/JPY': { base: 'EUR', quote: 'JPY', isJpy: true  },
  'EUR/CHF': { base: 'EUR', quote: 'CHF', isJpy: false },
  'EUR/AUD': { base: 'EUR', quote: 'AUD', isJpy: false },
  'EUR/CAD': { base: 'EUR', quote: 'CAD', isJpy: false },
  'EUR/NZD': { base: 'EUR', quote: 'NZD', isJpy: false },
  'EUR/SEK': { base: 'EUR', quote: 'SEK', isJpy: false },
  'EUR/NOK': { base: 'EUR', quote: 'NOK', isJpy: false },
  'EUR/DKK': { base: 'EUR', quote: 'DKK', isJpy: false },
  'EUR/SGD': { base: 'EUR', quote: 'SGD', isJpy: false },
  'EUR/TRY': { base: 'EUR', quote: 'TRY', isJpy: false },
  'EUR/ZAR': { base: 'EUR', quote: 'ZAR', isJpy: false },
  'EUR/PLN': { base: 'EUR', quote: 'PLN', isJpy: false },
  'EUR/CZK': { base: 'EUR', quote: 'CZK', isJpy: false },
  'EUR/HUF': { base: 'EUR', quote: 'HUF', isJpy: false },
  // GBP CROSSES
  'GBP/JPY': { base: 'GBP', quote: 'JPY', isJpy: true  },
  'GBP/CHF': { base: 'GBP', quote: 'CHF', isJpy: false },
  'GBP/AUD': { base: 'GBP', quote: 'AUD', isJpy: false },
  'GBP/CAD': { base: 'GBP', quote: 'CAD', isJpy: false },
  'GBP/NZD': { base: 'GBP', quote: 'NZD', isJpy: false },
  'GBP/SEK': { base: 'GBP', quote: 'SEK', isJpy: false },
  'GBP/NOK': { base: 'GBP', quote: 'NOK', isJpy: false },
  'GBP/SGD': { base: 'GBP', quote: 'SGD', isJpy: false },
  'GBP/ZAR': { base: 'GBP', quote: 'ZAR', isJpy: false },
  // JPY CROSSES
  'AUD/JPY': { base: 'AUD', quote: 'JPY', isJpy: true },
  'CAD/JPY': { base: 'CAD', quote: 'JPY', isJpy: true },
  'CHF/JPY': { base: 'CHF', quote: 'JPY', isJpy: true },
  'NZD/JPY': { base: 'NZD', quote: 'JPY', isJpy: true },
  'SGD/JPY': { base: 'SGD', quote: 'JPY', isJpy: true },
  'HKD/JPY': { base: 'HKD', quote: 'JPY', isJpy: true },
  'MXN/JPY': { base: 'MXN', quote: 'JPY', isJpy: true },
  'ZAR/JPY': { base: 'ZAR', quote: 'JPY', isJpy: true },
  'TRY/JPY': { base: 'TRY', quote: 'JPY', isJpy: true },
  // COMMODITY CROSSES
  'AUD/CAD': { base: 'AUD', quote: 'CAD', isJpy: false },
  'AUD/CHF': { base: 'AUD', quote: 'CHF', isJpy: false },
  'AUD/NZD': { base: 'AUD', quote: 'NZD', isJpy: false },
  'AUD/SGD': { base: 'AUD', quote: 'SGD', isJpy: false },
  'CAD/CHF': { base: 'CAD', quote: 'CHF', isJpy: false },
  'CAD/SGD': { base: 'CAD', quote: 'SGD', isJpy: false },
  'NZD/CAD': { base: 'NZD', quote: 'CAD', isJpy: false },
  'NZD/CHF': { base: 'NZD', quote: 'CHF', isJpy: false },
  'NZD/SGD': { base: 'NZD', quote: 'SGD', isJpy: false },
  // METALS & COMMODITIES  (pip = 0.01 for XAU; price entered manually)
  'XAU/USD': { base: 'XAU', quote: 'USD', isJpy: false, isCommodity: true },
  'XAG/USD': { base: 'XAG', quote: 'USD', isJpy: false, isCommodity: true },
  'XPT/USD': { base: 'XPT', quote: 'USD', isJpy: false, isCommodity: true },
  'XPD/USD': { base: 'XPD', quote: 'USD', isJpy: false, isCommodity: true },
  'XAU/EUR': { base: 'XAU', quote: 'EUR', isJpy: false, isCommodity: true },
  'XAU/GBP': { base: 'XAU', quote: 'GBP', isJpy: false, isCommodity: true },
  'XAU/JPY': { base: 'XAU', quote: 'JPY', isJpy: true,  isCommodity: true },
  'USOIL/USD': { base: 'USOIL', quote: 'USD', isJpy: false, isCommodity: true },
  'UKOIL/USD': { base: 'UKOIL', quote: 'USD', isJpy: false, isCommodity: true },
  // CRYPTO  (price entered manually — no live API coverage)
  'BTC/USD':  { base: 'BTC',  quote: 'USD', isJpy: false, isCrypto: true },
  'ETH/USD':  { base: 'ETH',  quote: 'USD', isJpy: false, isCrypto: true },
  'BNB/USD':  { base: 'BNB',  quote: 'USD', isJpy: false, isCrypto: true },
  'XRP/USD':  { base: 'XRP',  quote: 'USD', isJpy: false, isCrypto: true },
  'SOL/USD':  { base: 'SOL',  quote: 'USD', isJpy: false, isCrypto: true },
  'ADA/USD':  { base: 'ADA',  quote: 'USD', isJpy: false, isCrypto: true },
  'DOGE/USD': { base: 'DOGE', quote: 'USD', isJpy: false, isCrypto: true },
  'LTC/USD':  { base: 'LTC',  quote: 'USD', isJpy: false, isCrypto: true },
  'BTC/EUR':  { base: 'BTC',  quote: 'EUR', isJpy: false, isCrypto: true },
  'ETH/EUR':  { base: 'ETH',  quote: 'EUR', isJpy: false, isCrypto: true },   
}

// ─── LOT SIZES ───────────────────────────────────────────────────────────────
export const LOT_SIZES = {
  Standard: 100000,
  Mini:      10000,
  Micro:      1000,
  Nano:        100,
}

// ─── ACCOUNT CURRENCIES ──────────────────────────────────────────────────────
export const ACCOUNT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD']

// ─── TICKER PAIRS shown in the live rates bar ─────────────────────────────
export const TICKER_PAIRS = [
  // Forex majors
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  // Metals (XPT/XPD/USOIL/UKOIL not available from free API)
  'XAU/USD', 'XAG/USD', 'XAU/EUR', 'XAU/GBP',
  // Crypto
  'BTC/USD', 'ETH/USD', 'BNB/USD', 'XRP/USD', 'SOL/USD', 'DOGE/USD', 'BTC/EUR', 'ETH/EUR',
]

// ─── CALCULATOR TABS ─────────────────────────────────────────────────────────
export const TABS = ['Pip Value', 'Pip Diff', 'Position Size', 'Leverage', 'Margin', 'P&L', 'Risk/Reward', 'Swap', 'Break-Even', 'Exposure', 'Converter', 'Journal', 'Growth', 'Chart', 'Alerts']
