import { PAIRS, LOT_SIZES } from './constants'

/**
 * Returns pip size for a given pair.
 * JPY pairs: 0.01 | all others: 0.0001
 */
export function getPipSize(pair) {
  const meta = PAIRS[pair]
  if (!meta) return 0.0001
  if (meta.isCommodity || meta.isCrypto) {
    // Gold/Silver/XAU pairs: pip = 0.01 (quoted to 2 dp)
    // Oil: pip = 0.01
    // Crypto: pip = 0.01 (most platforms use 2dp for BTC/ETH price)
    return meta.isJpy ? 1 : 0.01
  }
  return meta.isJpy ? 0.01 : 0.0001
}

/**
 * Calculate pip value in quote currency and account currency.
 * @param {string}  pair         e.g. "EUR/USD"
 * @param {string}  lotType      "Standard" | "Mini" | "Micro" | "Nano"
 * @param {number}  lotCount     number of lots
 * @param {string}  accountCcy   account currency e.g. "USD"
 * @param {object}  rates        full cross-rate map { "EUR/USD": 1.085, ... }
 */
export function calcPipValue(pair, lotType, lotCount, accountCcy, rates) {
  const units       = LOT_SIZES[lotType] * lotCount
  const pipSize     = getPipSize(pair)
  const { quote }   = PAIRS[pair]

  // Pip value in quote currency
  const pipValueInQuote = pipSize * units

  // Convert to account currency
  let pipValueInAccount = pipValueInQuote
  if (quote !== accountCcy) {
    const crossKey = `${quote}/${accountCcy}`
    const rate = rates[crossKey]
    if (rate) {
      pipValueInAccount = pipValueInQuote * rate
    }
  }

  return {
    pipValueInQuote,
    pipValueInAccount,
    units,
    pipSize,
  }
}

/**
 * Calculate number of pips between two prices.
 */
export function calcPipDiff(pair, entry, exit) {
  const pipSize = getPipSize(pair)
  const diff    = Math.abs(exit - entry)
  return {
    pips: parseFloat((diff / pipSize).toFixed(1)),
    priceDiff: Math.abs(exit - entry),
    pipSize,
  }
}

/**
 * Calculate recommended position size based on account risk.
 * @param {number} accountBalance  account balance in account currency
 * @param {number} riskPct         risk percentage e.g. 2
 * @param {number} slPips          stop loss in pips
 * @param {number} pipValuePerLot  pip value per 1 lot in account currency
 */
export function calcPositionSize(accountBalance, riskPct, slPips, pipValuePerLot) {
  const riskAmount = accountBalance * (riskPct / 100)
  const lots       = slPips > 0 && pipValuePerLot > 0
    ? riskAmount / (slPips * pipValuePerLot)
    : 0
  return {
    lots:       Math.max(0, lots),
    riskAmount,
  }
}

/**
 * Calculate leverage ratio.
 */
export function calcLeverage(lotType, lotCount, price, accountBalance) {
  const units         = LOT_SIZES[lotType] * lotCount
  const positionValue = units * price
  const leverage      = accountBalance > 0 ? positionValue / accountBalance : 0
  return { positionValue, leverage, units }
}

/**
 * Calculate required margin.
 */
export function calcMargin(lotType, lotCount, price, leverage) {
  const units         = LOT_SIZES[lotType] * lotCount
  const positionValue = units * price
  const margin        = leverage > 0 ? positionValue / leverage : 0
  return { positionValue, margin, units }
}

/**
 * Calculate profit and loss.
 * @param {string} direction  "buy" | "sell"
 */
export function calcPnL(pair, lotType, lotCount, entry, exit, direction, accountCcy, rates) {
  const pipSize = getPipSize(pair)
  const pips    = direction === 'buy'
    ? (exit - entry) / pipSize
    : (entry - exit) / pipSize

  const { pipValueInAccount } = calcPipValue(pair, lotType, lotCount, accountCcy, rates)
  const pnl = pips * (pipValueInAccount / lotCount)

  return {
    pips:  parseFloat(pips.toFixed(1)),
    pnl,
    units: LOT_SIZES[lotType] * lotCount,
  }
}
