import { useState } from 'react'
import { PAIR_GROUPS, LOT_SIZES } from '../utils/constants'
import { useJournal } from '../hooks/useJournal'
import { Field, PairSelect, LotTypeSelect, AccountCcySelect, CalcButton } from './shared'
import styles from './tabs.module.css'
import j from './JournalTab.module.css'

const RESULT_OPTS = [
  { value: 'open',  label: '◌ Open',      color: '#4a6a8a' },
  { value: 'win',   label: '▲ Win',       color: '#00ff9d' },
  { value: 'loss',  label: '▼ Loss',      color: '#ff4d6d' },
  { value: 'be',    label: '— Break Even',color: '#f0c040' },
]

function StatCard({ label, value, color }) {
  return (
    <div className={j.statCard}>
      <span className={j.statLabel}>{label}</span>
      <span className={j.statValue} style={{ color }}>{value}</span>
    </div>
  )
}

function AddTradeForm({ onAdd }) {
  const [pair,      setPair     ] = useState('EUR/USD')
  const [direction, setDirection] = useState('buy')
  const [lotType,   setLotType  ] = useState('Standard')
  const [lots,      setLots     ] = useState('1')
  const [acctCcy,   setAcctCcy  ] = useState('USD')
  const [entry,     setEntry    ] = useState('')
  const [sl,        setSl       ] = useState('')
  const [tp,        setTp       ] = useState('')
  const [riskAmt,   setRiskAmt  ] = useState('')
  const [rewardAmt, setRewardAmt] = useState('')
  const [rrRatio,   setRrRatio  ] = useState('')
  const [result,    setResult   ] = useState('open')
  const [pnl,       setPnl      ] = useState('')
  const [notes,     setNotes    ] = useState('')
  const [open,      setOpen     ] = useState(false)

  const handleSubmit = () => {
    if (!pair || !entry) return
    onAdd({
      pair, direction, lotType,
      lots:      parseFloat(lots) || 1,
      acctCcy,
      entry:     parseFloat(entry),
      sl:        parseFloat(sl) || null,
      tp:        parseFloat(tp) || null,
      riskAmt:   parseFloat(riskAmt) || null,
      rewardAmt: parseFloat(rewardAmt) || null,
      rrRatio:   parseFloat(rrRatio) || null,
      result,
      pnl:       parseFloat(pnl) || null,
      notes,
    })
    // reset
    setEntry(''); setSl(''); setTp('')
    setRiskAmt(''); setRewardAmt(''); setRrRatio('')
    setPnl(''); setNotes(''); setResult('open')
    setOpen(false)
  }

  return (
    <div className={j.addSection}>
      <button className={j.addToggleBtn} onClick={() => setOpen(o => !o)}>
        {open ? '✕ Cancel' : '+ Log New Trade'}
      </button>

      {open && (
        <div className={j.formGrid}>
          <Field label="Pair">
            <PairSelect value={pair} onChange={setPair} />
          </Field>
          <Field label="Direction">
            <div className={styles.radioGroup}>
              <button className={`${styles.radioBtn} ${styles.buy} ${direction==='buy'?styles.buyActive:''}`}
                onClick={() => setDirection('buy')}>▲ BUY</button>
              <button className={`${styles.radioBtn} ${styles.sell} ${direction==='sell'?styles.sellActive:''}`}
                onClick={() => setDirection('sell')}>▼ SELL</button>
            </div>
          </Field>
          <Field label="Lot Type">
            <LotTypeSelect value={lotType} onChange={setLotType} />
          </Field>
          <Field label="Lots">
            <input className={styles.input} type="number" min="0.01" step="0.01"
              value={lots} onChange={e => setLots(e.target.value)} />
          </Field>
          <Field label="Account CCY">
            <AccountCcySelect value={acctCcy} onChange={setAcctCcy} />
          </Field>
          <Field label="Entry Price">
            <input className={styles.input} type="number" step="0.00001"
              value={entry} onChange={e => setEntry(e.target.value)} placeholder="required" />
          </Field>
          <Field label="Stop Loss">
            <input className={styles.input} type="number" step="0.00001"
              value={sl} onChange={e => setSl(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Take Profit">
            <input className={styles.input} type="number" step="0.00001"
              value={tp} onChange={e => setTp(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Risk Amount">
            <input className={styles.input} type="number" step="0.01"
              value={riskAmt} onChange={e => setRiskAmt(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Reward Amount">
            <input className={styles.input} type="number" step="0.01"
              value={rewardAmt} onChange={e => setRewardAmt(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="R/R Ratio">
            <input className={styles.input} type="number" step="0.01"
              value={rrRatio} onChange={e => setRrRatio(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Result">
            <select className={styles.input}
              value={result} onChange={e => setResult(e.target.value)}
              style={{ appearance: 'none', cursor: 'pointer' }}>
              {RESULT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          {result !== 'open' && (
            <Field label="P&L">
              <input className={styles.input} type="number" step="0.01"
                value={pnl} onChange={e => setPnl(e.target.value)} placeholder="e.g. 120.50 or -80" />
            </Field>
          )}
          <Field label="Notes" span2>
            <textarea className={j.textarea}
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Setup notes, reasons, lessons learned…" rows={3} />
          </Field>
          <div style={{ gridColumn: 'span 2' }}>
            <CalcButton onClick={handleSubmit}>Save Trade Entry</CalcButton>
          </div>
        </div>
      )}
    </div>
  )
}

function TradeRow({ entry, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const res = RESULT_OPTS.find(o => o.value === entry.result) || RESULT_OPTS[0]
  const dateStr = new Date(entry.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <>
      <tr className={j.trRow} onClick={() => setExpanded(e => !e)}>
        <td className={j.td}><span className={j.mono}>{dateStr}</span></td>
        <td className={j.td}><span className={j.pairBadge}>{entry.pair}</span></td>
        <td className={j.td}>
          <span style={{ color: entry.direction === 'buy' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {entry.direction === 'buy' ? '▲ BUY' : '▼ SELL'}
          </span>
        </td>
        <td className={j.td}><span className={j.mono}>{entry.lots} {entry.lotType}</span></td>
        <td className={j.td}><span className={j.mono}>{entry.entry}</span></td>
        <td className={j.td}>
          <span style={{ color: res.color, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1 }}>
            {res.label}
          </span>
        </td>
        <td className={j.td}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: entry.pnl == null ? 'var(--muted)'
              : entry.pnl >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {entry.pnl != null
              ? `${entry.pnl >= 0 ? '+' : ''}${entry.acctCcy} ${entry.pnl.toFixed(2)}`
              : '—'}
          </span>
        </td>
        <td className={j.td} style={{ textAlign: 'right' }}>
          <button className={j.deleteBtn} onClick={e => { e.stopPropagation(); onDelete(entry.id) }}>✕</button>
        </td>
      </tr>
      {expanded && (
        <tr className={j.expandRow}>
          <td colSpan={8} className={j.expandCell}>
            <div className={j.expandGrid}>
              {entry.sl       && <div><span className={j.expandLabel}>SL</span><span className={j.mono}>{entry.sl}</span></div>}
              {entry.tp       && <div><span className={j.expandLabel}>TP</span><span className={j.mono}>{entry.tp}</span></div>}
              {entry.rrRatio  && <div><span className={j.expandLabel}>R/R</span><span className={j.mono}>1:{entry.rrRatio.toFixed(2)}</span></div>}
              {entry.riskAmt  && <div><span className={j.expandLabel}>Risk</span><span className={j.mono}>{entry.acctCcy} {entry.riskAmt.toFixed(2)}</span></div>}
              {entry.rewardAmt&& <div><span className={j.expandLabel}>Reward</span><span className={j.mono}>{entry.acctCcy} {entry.rewardAmt.toFixed(2)}</span></div>}
            </div>
            {entry.notes && (
              <div className={j.notesBlock}>
                <span className={j.expandLabel}>Notes</span>
                <p className={j.notesText}>{entry.notes}</p>
              </div>
            )}
            {/* Update result */}
            <div className={j.updateRow}>
              <span className={j.expandLabel}>Update Result:</span>
              {RESULT_OPTS.map(o => (
                <button key={o.value}
                  className={`${j.resultBtn} ${entry.result === o.value ? j.resultBtnActive : ''}`}
                  style={{ '--rc': o.color }}
                  onClick={() => onUpdate(entry.id, { result: o.value })}>
                  {o.label}
                </button>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function JournalTab() {
  const { entries, addEntry, updateEntry, deleteEntry, clearAll, stats } = useJournal()
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div>
      {/* Stats Bar */}
      <div className={j.statsRow}>
        <StatCard label="Total Trades"   value={stats.total}                    color="var(--blue)" />
        <StatCard label="Win Rate"       value={`${stats.winRate.toFixed(1)}%`} color={stats.winRate >= 50 ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="Wins / Losses"  value={`${stats.wins} / ${stats.losses}`} color="var(--text)" />
        <StatCard label="Avg R/R"        value={stats.avgRR ? `1:${stats.avgRR.toFixed(2)}` : '—'} color="var(--blue)" />
        <StatCard
          label="Net P&L"
          value={stats.totalPnl !== 0
            ? `${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}`
            : '$0.00'}
          color={stats.totalPnl > 0 ? 'var(--green)' : stats.totalPnl < 0 ? 'var(--red)' : 'var(--muted)'}
        />
      </div>

      {/* Add Trade Form */}
      <AddTradeForm onAdd={addEntry} />

      {/* Trade History */}
      {entries.length === 0 ? (
        <div className={j.emptyState}>
          <span className={j.emptyIcon}>📋</span>
          <p className={j.emptyTitle}>No trades logged yet</p>
          <p className={j.emptySub}>Click "Log New Trade" above to start your journal</p>
        </div>
      ) : (
        <>
          <div className={j.tableWrap}>
            <table className={j.table}>
              <thead>
                <tr>
                  {['Date','Pair','Dir','Size','Entry','Result','P&L',''].map(h => (
                    <th key={h} className={j.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <TradeRow
                    key={entry.id}
                    entry={entry}
                    onDelete={deleteEntry}
                    onUpdate={updateEntry}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className={j.clearRow}>
            {confirmClear ? (
              <>
                <span className={j.clearWarning}>Delete all {entries.length} entries?</span>
                <button className={j.clearConfirmBtn} onClick={() => { clearAll(); setConfirmClear(false) }}>Yes, Delete All</button>
                <button className={j.cancelBtn} onClick={() => setConfirmClear(false)}>Cancel</button>
              </>
            ) : (
              <button className={j.clearBtn} onClick={() => setConfirmClear(true)}>🗑 Clear Journal</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
