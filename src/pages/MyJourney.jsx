import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMyBottles, getMyBottleStatus } from '../lib/myBottles'
import { supabase } from '../lib/supabase'

export default function MyJourney() {
  const [bottles, setBottles] = useState([])
  const [arrivedData, setArrivedData] = useState({})

  useEffect(() => {
    const mine = getMyBottles()
    setBottles(mine)
    fetchArrivedContent(mine)
  }, [])

  async function fetchArrivedContent(mine) {
    const arrivedIds = mine
      .filter(b => getMyBottleStatus(b).status === 'arrived')
      .map(b => b.id)

    if (!arrivedIds.length) return

    const { data } = await supabase
      .from('bottles')
      .select('id, content, type, created_at, visible_at, reactions(emoji)')
      .in('id', arrivedIds)

    if (!data) return

    const map = {}
    data.forEach(b => {
      const counts = {}
      b.reactions.forEach(({ emoji }) => {
        counts[emoji] = (counts[emoji] || 0) + 1
      })
      map[b.id] = { ...b, reactionCounts: counts }
    })
    setArrivedData(map)
  }

  const drifting = bottles.filter(b => getMyBottleStatus(b).status === 'drifting')
  const arrived  = bottles.filter(b => getMyBottleStatus(b).status === 'arrived')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(180deg, #FAE5BC 0%, #F5C47A 60%, #E8956A 100%)',
        padding: '2rem 2rem 1.5rem',
      }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <a href="/" style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', textDecoration: 'none' }}>
            🍊 orange
          </a>
          <a href="/feed" style={{
            fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic',
            color: 'var(--ink-s)', borderBottom: '1px solid rgba(61,43,31,0.25)',
            paddingBottom: 1, textDecoration: 'none'
          }}>
            read letters →
          </a>
        </nav>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>
          your journey
        </h1>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)' }}>
          Bottles you've sealed — drifting and arrived.
        </p>
      </header>

      <div className="horizon" />

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* Arrived bottles */}
        {arrived.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <div className="section-eyebrow" style={{ marginBottom: '1rem' }}>
              ✦ arrived
            </div>
            {arrived.map((b, i) => (
              <ArrivedBottle
                key={b.id}
                bottle={b}
                fullData={arrivedData[b.id]}
                index={i}
              />
            ))}
          </section>
        )}

        {/* Drifting bottles */}
        {drifting.length > 0 && (
          <section>
            <div className="section-eyebrow" style={{ marginBottom: '1rem' }}>
              🌊 still drifting
            </div>
            {drifting.map((b, i) => (
              <DriftingBottle key={b.id} bottle={b} index={i} />
            ))}
          </section>
        )}

        {/* No bottles yet */}
        {bottles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: '1rem', opacity: 0.4 }}>🍶</div>
            <p style={{
              fontFamily: 'var(--fb)', fontSize: 16, fontStyle: 'italic',
              color: 'var(--ink-s)', marginBottom: '1.5rem'
            }}>
              You haven't sealed any bottles yet.
            </p>
            <a href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              write your first letter →
            </a>
          </div>
        )}
      </div>

      <footer style={{
        background: 'var(--ink)', padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '2rem'
      }}>
        <span style={{ fontFamily: 'var(--fd)', fontSize: 16, color: 'var(--sky)' }}>🍊 orange</span>
        <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, fontStyle: 'italic', color: 'rgba(253,246,236,0.45)' }}>
          anonymous · ephemeral · honest
        </span>
      </footer>
    </div>
  )
}

function ArrivedBottle({ bottle, fullData, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: 'var(--cream)',
        border: '1px solid rgba(212,168,83,0.4)',
        borderRadius: 14, padding: '1.25rem 1.5rem',
        marginBottom: 12, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Gold top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3,
        background: 'linear-gradient(90deg, var(--sky), var(--gold))',
      }} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, marginTop: 4 }}>
        <motion.span
          animate={{ rotate: [-3, 3, -3], y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: 22 }}
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
        <span style={{
          fontFamily: 'var(--fb)', fontSize: 11,
          background: 'var(--gold)', color: 'var(--ink)',
          padding: '2px 8px', borderRadius: 100,
        }}>
          ✦ arrived
        </span>
      </div>

      {fullData ? (
        <>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic',
            color: 'var(--ink)', lineHeight: 1.7, marginBottom: 10
          }}>
            "{fullData.content}"
          </p>
          {/* Reaction summary */}
          {Object.keys(fullData.reactionCounts).length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(fullData.reactionCounts).map(([emoji, count]) => (
                <span key={emoji} className="reaction" style={{ cursor: 'default' }}>
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{
          fontFamily: 'var(--fb)', fontSize: 13, fontStyle: 'italic',
          color: 'var(--ink-s)'
        }}>
          "{bottle.preview}"
        </p>
      )}

      <div style={{
        fontFamily: "'EB Garamond', serif", fontSize: 11, fontStyle: 'italic',
        color: 'var(--ink-s)', marginTop: 10
      }}>
        sealed on {new Date(bottle.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        })} · arrived {new Date(bottle.visibleAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      </div>
    </motion.div>
  )
}

function DriftingBottle({ bottle, index }) {
  const s = getMyBottleStatus(bottle)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{
        background: 'var(--parchment)',
        border: '1px solid rgba(61,43,31,0.1)',
        borderRadius: 12, padding: '0.9rem 1.1rem',
        marginBottom: 10, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        height: 2, width: `${s.progress}%`,
        background: 'linear-gradient(90deg, var(--sky), var(--dusk))',
        transition: 'width 1s ease',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
            <span style={{
              fontFamily: 'var(--fb)', fontSize: 11,
              background: bottle.type === 'future' ? 'var(--water)' : 'var(--sage)',
              color: 'var(--ink)', padding: '2px 8px', borderRadius: 100,
            }}>
              {bottle.type} self
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--fb)', fontSize: 13, fontStyle: 'italic',
            color: 'var(--ink-s)', lineHeight: 1.5, margin: 0,
          }}>
            "{bottle.preview}"
          </p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 20, color: 'var(--ink)', lineHeight: 1 }}>
            {s.days > 0 ? `${s.days}d` : s.hours > 0 ? `${s.hours}h` : `${s.minutes}m`}
          </div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 10, fontStyle: 'italic', color: 'var(--ink-s)', marginTop: 2 }}>
            remaining
          </div>
        </div>
      </div>
    </motion.div>
  )
}