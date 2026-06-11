import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMyBottles, getMyBottleStatus } from '../lib/myBottles'

export default function MyBottles() {
  const [bottles, setBottles] = useState([])

  useEffect(() => {
    setBottles(getMyBottles())
  }, [])

  // Refresh countdowns every minute
  useEffect(() => {
    const id = setInterval(() => setBottles([...getMyBottles()]), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (!bottles.length) return null

  return (
    <section style={{ background: 'var(--cream)', padding: '1.5rem 2rem' }}>
      <div className="section-eyebrow" style={{ marginBottom: '1rem' }}>your bottles</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bottles.map((b, i) => (
          <BottleTracker key={b.id} bottle={b} index={i} />
        ))}
      </div>
    </section>
  )
}

function BottleTracker({ bottle, index }) {
  const s = getMyBottleStatus(bottle)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: 'var(--parchment)',
        border: `1px solid ${s.status === 'arrived' ? 'rgba(212,168,83,0.5)' : 'rgba(61,43,31,0.1)'}`,
        borderRadius: 12,
        padding: '0.9rem 1.1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        height: 2,
        width: `${s.progress}%`,
        background: s.status === 'arrived'
          ? 'linear-gradient(90deg, var(--sky), var(--gold))'
          : 'linear-gradient(90deg, var(--sky), var(--dusk))',
        transition: 'width 0.5s ease',
        borderRadius: '2px 0 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
            <span style={{
              fontFamily: 'var(--fb)', fontSize: 11,
              background: bottle.type === 'future' ? 'var(--water)' : 'var(--sage)',
              color: 'var(--ink)', padding: '2px 8px', borderRadius: 100,
            }}>
              {bottle.type} self
            </span>
            {s.status === 'arrived' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  fontFamily: 'var(--fb)', fontSize: 11,
                  background: 'var(--gold)', color: 'var(--ink)',
                  padding: '2px 8px', borderRadius: 100,
                }}
              >
                ✦ arrived
              </motion.span>
            )}
          </div>

          <p style={{
            fontFamily: 'var(--fb)', fontSize: 13, fontStyle: 'italic',
            color: 'var(--ink-s)', lineHeight: 1.5, margin: 0,
          }}>
            "{bottle.preview}"
          </p>
        </div>

        {/* Countdown or arrived */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {s.status === 'arrived' ? (
            <motion.div
              animate={{ rotate: [-4, 4, -4], y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 28 }}
            >
              🍶
            </motion.div>
          ) : (
            <div>
              {s.days > 0 && (
                <div style={{ fontFamily: 'var(--fd)', fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>
                  {s.days}<span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--ink-s)', marginLeft: 2 }}>d</span>
                </div>
              )}
              {s.days === 0 && s.hours > 0 && (
                <div style={{ fontFamily: 'var(--fd)', fontSize: 18, color: 'var(--dusk)', lineHeight: 1 }}>
                  {s.hours}<span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--ink-s)', marginLeft: 2 }}>h</span>
                </div>
              )}
              {s.days === 0 && s.hours === 0 && (
                <div style={{ fontFamily: 'var(--fd)', fontSize: 18, color: 'var(--ember)', lineHeight: 1 }}>
                  {s.minutes}<span style={{ fontFamily: 'var(--fb)', fontSize: 11, color: 'var(--ink-s)', marginLeft: 2 }}>m</span>
                </div>
              )}
              <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 10, fontStyle: 'italic', color: 'var(--ink-s)', marginTop: 2 }}>
                drifting
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}