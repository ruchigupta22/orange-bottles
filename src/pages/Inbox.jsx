import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchInbox } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import BottleCard from '../components/BottleCard'

export default function Inbox() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate  = useNavigate()
  const [bottles, setBottles]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [opening, setOpening]   = useState(null) // bottle being revealed
  const [revealed, setRevealed] = useState({})   // bottleId → true

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    try {
      const data = await fetchInbox()
      setBottles(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const arrived  = bottles.filter(b => new Date(b.visible_at) <= new Date())
  const drifting = bottles.filter(b => new Date(b.visible_at) >  new Date())

  if (authLoading || loading) return <LoadingScreen />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>

      <InboxHeader username={profile?.username} />
      <div className="horizon" />

      <div style={{ padding: '1.5rem' }}>

        {/* Stats row */}
        {bottles.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: '1.75rem' }}>
            {[
              { label: 'arrived',  value: arrived.length,  color: 'var(--gold)'  },
              { label: 'drifting', value: drifting.length, color: 'var(--water)' },
              { label: 'total',    value: bottles.length,  color: 'var(--sage)'  },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: 'var(--cream)',
                border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: 14, padding: '1rem', textAlign: 'center'
              }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, fontStyle: 'italic', color: 'var(--ink-s)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Arrived bottles */}
        {arrived.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--fb)', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-s)', marginBottom: '1rem' }}>
              ✦ bottles that found you
            </div>
            <AnimatePresence>
              {arrived.map((bottle, i) => (
                <motion.div
                  key={bottle.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  {revealed[bottle.id] ? (
                    <BottleCard
                      bottle={bottle}
                      myReactions={new Set()}
                      onReact={() => {}}
                    />
                  ) : (
                    <SealedInboxCard
                      bottle={bottle}
                      onOpen={() => setOpening(bottle)}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        )}

        {/* Drifting bottles */}
        {drifting.length > 0 && (
          <section>
            <div style={{ fontFamily: 'var(--fb)', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink-s)', marginBottom: '1rem' }}>
              🌊 still drifting toward you
            </div>
            {drifting.map((b, i) => (
              <DriftingInboxCard key={b.id} bottle={b} index={i} />
            ))}
          </section>
        )}

        {/* Empty state */}
        {bottles.length === 0 && <EmptyInbox username={profile?.username} />}
      </div>

      {/* Reveal overlay */}
      <AnimatePresence>
        {opening && (
          <BottleReveal
            bottle={opening}
            onClose={() => {
              setRevealed(prev => ({ ...prev, [opening.id]: true }))
              setOpening(null)
            }}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

// ── Sealed card (before opening) ─────────────────────

function SealedInboxCard({ bottle, onOpen }) {
  const daysAgo = Math.floor((Date.now() - new Date(bottle.visible_at)) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--cream)',
        border: '1.5px solid rgba(212,168,83,0.35)',
        borderRadius: 16, padding: '1.25rem 1.5rem',
        marginBottom: 12, cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
      }}
      onClick={onOpen}
    >
      {/* Gold shimmer top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--sky), var(--gold), var(--dusk))' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
            <motion.span
              animate={{ rotate: [-4, 4, -4], y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: 24 }}
            >
              🍶
            </motion.span>
            <span style={{
              fontFamily: 'var(--fb)', fontSize: 11,
              background: bottle.type === 'future' ? 'var(--water)' : 'var(--sage)',
              color: 'var(--ink)', padding: '2px 10px', borderRadius: 100,
            }}>
              {bottle.type} self
            </span>
            <span style={{
              fontFamily: 'var(--fb)', fontSize: 11,
              background: 'rgba(212,168,83,0.2)', color: 'var(--ink-s)',
              padding: '2px 10px', borderRadius: 100,
            }}>
              ✦ arrived {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', margin: 0 }}>
            Someone sent you a sealed bottle. Tap to open it.
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: 28, marginLeft: 16, flexShrink: 0 }}
        >
          💛
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Bottle reveal overlay ─────────────────────────────

function BottleReveal({ bottle, onClose }) {
  const [step, setStep] = useState(0)
  // step 0: bottle floating, step 1: uncorking, step 2: letter revealed

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1200)
    const t2 = setTimeout(() => setStep(2), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(160deg, #FAE5BC 0%, #F5C47A 40%, #E8956A 75%, #C1604A 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', zIndex: 100,
      }}
    >
      {/* Step 0 & 1: Bottle animation */}
      {step < 2 && (
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={step === 0
              ? { y: [0, -16, 0], rotate: [-5, 5, -5] }
              : { y: -40, scale: 1.3, rotate: 0 }
            }
            transition={step === 0
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.6, ease: 'easeOut' }
            }
            style={{ fontSize: 72, display: 'inline-block', marginBottom: '1.5rem' }}
          >
            🍶
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>a bottle found you</h2>
                <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)' }}>someone sent you something...</p>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>opening the seal...</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Step 2: Letter revealed */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            background: 'var(--cream)',
            border: '1px solid rgba(212,168,83,0.4)',
            borderRadius: 20, padding: '2rem',
            maxWidth: 500, width: '100%',
            maxHeight: '80vh', overflowY: 'auto',
          }}
        >
          {/* Top bar */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, var(--sky), var(--gold))', borderRadius: 2, marginBottom: '1.25rem' }} />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>🍶</span>
            <span style={{
              fontFamily: 'var(--fb)', fontSize: 11,
              background: bottle.type === 'future' ? 'var(--water)' : 'var(--sage)',
              color: 'var(--ink)', padding: '2px 10px', borderRadius: 100,
            }}>
              {bottle.type} self
            </span>
            <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, fontStyle: 'italic', color: 'var(--ink-s)', marginLeft: 'auto' }}>
              anonymous · sealed {bottle.deliver_in} days
            </span>
          </div>

          <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '0.75rem', opacity: 0.7 }}>
            {bottle.type === 'future' ? 'Dear future you,' : 'Dear past you,'}
          </div>

          <p style={{ fontFamily: 'var(--fb)', fontSize: 16, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            "{bottle.content}"
          </p>

          <div style={{ borderTop: '1px solid rgba(212,168,83,0.2)', paddingTop: '1rem', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" style={{ fontSize: 14 }} onClick={onClose}>
              close letter
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Drifting inbox card ───────────────────────────────

function DriftingInboxCard({ bottle, index }) {
  const visibleAt = new Date(bottle.visible_at)
  const msLeft    = visibleAt - Date.now()
  const days      = Math.floor(msLeft / (1000 * 60 * 60 * 24))
  const hours     = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: 'var(--parchment)',
        border: '1px solid rgba(61,43,31,0.1)',
        borderRadius: 12, padding: '1rem 1.25rem',
        marginBottom: 10, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, height: 2,
        width: `${Math.round(((bottle.deliver_in * 86400000 - msLeft) / (bottle.deliver_in * 86400000)) * 100)}%`,
        background: 'linear-gradient(90deg, var(--sky), var(--dusk))',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <motion.span
              animate={{ x: [0, 4, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: 18 }}
            >
              🍶
            </motion.span>
            <span style={{
              fontFamily: 'var(--fb)', fontSize: 11,
              background: bottle.type === 'future' ? 'var(--water)' : 'var(--sage)',
              color: 'var(--ink)', padding: '2px 8px', borderRadius: 100,
            }}>
              {bottle.type} self
            </span>
          </div>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-s)' }}>
            A sealed bottle is making its way to you...
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 20, color: 'var(--ink)', lineHeight: 1 }}>
            {days > 0 ? `${days}d` : `${hours}h`}
          </div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 10, fontStyle: 'italic', color: 'var(--ink-s)', marginTop: 2 }}>
            remaining
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────

function EmptyInbox({ username }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ fontSize: 56, marginBottom: '1rem', display: 'inline-block', opacity: 0.5 }}
      >
        🌊
      </motion.div>
      <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>no bottles yet</h3>
      <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '1.5rem', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 1.5rem' }}>
        Share your link and let the bottles find you.
      </p>
      <div style={{
        background: 'var(--cream)', border: '1px solid rgba(212,168,83,0.3)',
        borderRadius: 12, padding: '1rem', marginBottom: '1.5rem',
        fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink)',
      }}>
        🍊 orange-bottles.vercel.app/u/{username}
      </div>
      <a href="/" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: 15 }}>
        write a bottle instead →
      </a>
    </motion.div>
  )
}

// ── Loading screen ────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--parchment)', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            style={{ fontSize: 28 }}
          >
            🍶
          </motion.span>
        ))}
      </div>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--ink-s)' }}>
        checking your bottles...
      </p>
    </div>
  )
}

// ── Header ────────────────────────────────────────────

function InboxHeader({ username }) {
  return (
    <header style={{
      background: 'linear-gradient(180deg, #FAE5BC 0%, #F5C47A 60%, #E8956A 100%)',
      padding: '2rem 2rem 1.5rem',
    }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <a href="/" style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', textDecoration: 'none' }}>🍊 orange</a>
        <a href="/" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', textDecoration: 'none', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>← back home</a>
      </nav>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: 32, marginBottom: 8 }}>📬</motion.div>
      <h1 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
        {username ? `@${username}'s inbox` : 'your inbox'}
      </h1>
      <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)' }}>
        Bottles sent to you — sealed, anonymous, across time.
      </p>
    </header>
  )
}