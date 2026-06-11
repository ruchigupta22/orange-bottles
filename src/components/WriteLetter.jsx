import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sealBottle } from '../lib/api'
import { saveMyBottle } from '../lib/myBottles'

const DELIVERY_OPTIONS = [
  { id: 1, label: 'soon',    value: '7 days',  days: 7   },
  { id: 2, label: 'a while', value: '1 month', days: 30  },
  { id: 3, label: 'someday', value: '6 months',days: 180 },
  { id: 4, label: 'far away',value: '1 year',  days: 365 },
]

export default function WriteLetter() {
  const [type, setType]         = useState('future')
  const [text, setText]         = useState('')
  const [delivery, setDelivery] = useState(1)
  const [sealed, setSealed]     = useState(false)
  const [loading, setLoading] = useState(false)

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const selectedOption = DELIVERY_OPTIONS.find(o => o.id === delivery)

async function handleSeal() {
  if (wordCount < 3) return
  setLoading(true)
  try {
    const data = await sealBottle({
      content: text,
      type,
      deliverInDays: selectedOption.days,
    })
    saveMyBottle(data)   // ← save to localStorage
    setSealed(true)
    setText('')
    setTimeout(() => setSealed(false), 6000)
  } catch (err) {
    console.error('Failed to seal bottle:', err)
    alert('Something went wrong. Try again.')
  } finally {
    setLoading(false)
  }
}




  return (
    <section style={{ background: 'var(--cream)', padding: '2rem' }}>
      <div className="section-eyebrow">your letter</div>
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 400, color: 'var(--ink)', marginBottom: '1.5rem' }}>
        Who are you writing to?
      </h2>

      {/* Type toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'future', label: '🌊 my future self', activeClass: 'active-future' },
          { key: 'past',   label: '🍂 my past self',   activeClass: 'active-past'   },
        ].map(({ key, label, activeClass }) => (
          <button
            key={key}
            className={`type-btn ${type === key ? activeClass : ''}`}
            onClick={() => setType(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Letter area */}
      <div className="letter-wrap" style={{ marginBottom: '0.5rem' }}>
        <div style={{
          fontFamily: 'var(--fd)', fontSize: 18, fontStyle: 'italic',
          color: 'var(--ink-s)', marginBottom: '0.75rem', opacity: 0.7
        }}>
          {type === 'future' ? 'Dear future me,' : 'Dear past me,'}
        </div>
        <textarea
          className="letter-ta"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={
            type === 'future'
              ? "I hope that by the time you read this, you've found a little more peace..."
              : "I want you to know it's okay that you didn't have it all figured out..."
          }
          rows={6}
          maxLength={3000}
        />
      </div>
      <div className="word-count">{wordCount} / 500 words</div>

      {/* Delivery */}
      <div className="section-eyebrow" style={{ marginTop: '1.25rem' }}>deliver this bottle in</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {DELIVERY_OPTIONS.map(opt => (
          <div
            key={opt.id}
            className={`delivery-chip ${delivery === opt.id ? 'selected' : ''}`}
            onClick={() => setDelivery(opt.id)}
          >
            <span className="delivery-chip-label">{opt.label}</span>
            <span className="delivery-chip-val">{opt.value}</span>
          </div>
        ))}
      </div>

      {/* Seal button */}
      <AnimatePresence mode="wait">
        {!sealed ? (
          <motion.button
  key="btn"
  className="btn btn-primary"
  style={{
    width: '100%',
    fontSize: 17,
    opacity: loading ? 0.6 : 1,
  }}
  onClick={handleSeal}
  disabled={loading}
  whileTap={{ scale: 0.97 }}
>
  {loading
    ? 'sealing...'
    : '🌊  seal & set adrift'}
</motion.button>
        ) : (
          <motion.div
            key="sealed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'var(--cream)',
              border: '1px solid rgba(212,168,83,0.3)',
              borderRadius: 14, padding: '2rem',
              textAlign: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ fontSize: 48, marginBottom: '0.5rem' }}
            >
              🍶
            </motion.div>
            <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, color: 'var(--ink)', margin: '0.5rem 0' }}>
              Your bottle is drifting...
            </h3>
            <p style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '1rem' }}>
              It carries your words across time, anonymous and sealed.
            </p>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--gold)' }}>
              ✦ &nbsp; it will arrive in {selectedOption.value} &nbsp; ✦
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

