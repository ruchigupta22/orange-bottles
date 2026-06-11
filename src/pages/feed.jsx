import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchFeed, getMyReactions } from '../lib/api'
import BottleCard from '../components/BottleCard'

const FILTERS = [
  { key: 'all',    label: '🍶 all bottles' },
  { key: 'future', label: '🌊 future self' },
  { key: 'past',   label: '🍂 past self'   },
]

export default function Feed() {
  const [bottles, setBottles]       = useState([])
  const [myReactions, setMyReactions] = useState({})
  const [filter, setFilter]         = useState('all')
  const [page, setPage]             = useState(0)
  const [loading, setLoading]       = useState(false)
  const [hasMore, setHasMore]       = useState(true)
  const [empty, setEmpty]           = useState(false)
  const loaderRef                   = useRef(null)
  const PAGE_SIZE                   = 10

  // Load a page of bottles
  const loadMore = useCallback(async (reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const currentPage = reset ? 0 : page
      const data = await fetchFeed({
        page: currentPage,
        pageSize: PAGE_SIZE,
        filter: filter === 'all' ? null : filter,
      })

      if (reset) {
        setBottles(data)
        setPage(1)
        setEmpty(data.length === 0)
      } else {
        setBottles(prev => [...prev, ...data])
        setPage(prev => prev + 1)
      }

      setHasMore(data.length === PAGE_SIZE)

      // Fetch which bottles this session has reacted to
      const ids = data.map(b => b.id)
      if (ids.length) {
        const mine = await getMyReactions(ids)
        setMyReactions(prev => ({ ...prev, ...mine }))
      }
    } catch (err) {
      console.error('Failed to load feed:', err)
    } finally {
      setLoading(false)
    }
  }, [filter, page, loading])

  // Reset when filter changes
  useEffect(() => {
    setPage(0)
    setHasMore(true)
    setBottles([])
    loadMore(true)
  }, [filter])

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  // Update a single bottle's reactions in state (passed down to card)
  function updateBottleReactions(bottleId, emoji, delta, myReact) {
    setBottles(prev => prev.map(b => {
      if (b.id !== bottleId) return b
      const counts = { ...b.reactionCounts }
      counts[emoji] = Math.max(0, (counts[emoji] || 0) + delta)
      return { ...b, reactionCounts: counts }
    }))
    setMyReactions(prev => {
      const s = new Set(prev[bottleId] || [])
      myReact ? s.add(emoji) : s.delete(emoji)
      return { ...prev, [bottleId]: s }
    })
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>
      <FeedHeader />
      <div className="horizon" />

      {/* Filter bar */}
      <div style={{ padding: '1.25rem 2rem 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`type-btn ${filter === f.key ? (f.key === 'future' ? 'active-future' : f.key === 'past' ? 'active-past' : 'active-future') : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ padding: '1.25rem 2rem' }}>
        <AnimatePresence mode="popLayout">
          {bottles.map((bottle, i) => (
            <motion.div
              key={bottle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i < 10 ? i * 0.06 : 0, duration: 0.4 }}
            >
              <BottleCard
                bottle={bottle}
                myReactions={myReactions[bottle.id] || new Set()}
                onReact={updateBottleReactions}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {empty && !loading && (
          <EmptyState filter={filter} />
        )}

        {/* Loader / sentinel */}
        <div ref={loaderRef} style={{ padding: '2rem 0', textAlign: 'center' }}>
          {loading && <LoadingBottles />}
          {!hasMore && bottles.length > 0 && <EndOfFeed />}
        </div>
      </div>

      <FeedFooter />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────

function FeedHeader() {
  return (
    <header style={{
      background: 'linear-gradient(180deg, #FAE5BC 0%, #F5C47A 60%, #E8956A 100%)',
      padding: '2rem 2rem 1.5rem',
    }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <a href="/" style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', textDecoration: 'none' }}>
          🍊 orange
        </a>
        <a href="/" style={{
          fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic',
          color: 'var(--ink-s)', borderBottom: '1px solid rgba(61,43,31,0.25)',
          paddingBottom: 1, textDecoration: 'none'
        }}>
          ← write a letter
        </a>
      </nav>
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 36, marginBottom: '0.75rem' }}
      >
        🌊
      </motion.div>
      <h1 style={{
        fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 400,
        color: 'var(--ink)', lineHeight: 1.25, marginBottom: 6
      }}>
        bottles washed ashore
      </h1>
      <p style={{
        fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic',
        color: 'var(--ink-s)'
      }}>
        Anonymous letters from across time. Read, feel, react — but never reply.
      </p>
    </header>
  )
}

function EmptyState({ filter }) {
  const msgs = {
    all:    'No bottles have washed ashore yet. Be the first to set one adrift.',
    future: 'No letters to a future self have arrived yet.',
    past:   'No letters to a past self have arrived yet.',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '3rem 1rem' }}
    >
      <div style={{ fontSize: 48, marginBottom: '1rem', opacity: 0.5 }}>🍶</div>
      <p style={{
        fontFamily: 'var(--fb)', fontSize: 16, fontStyle: 'italic',
        color: 'var(--ink-s)', maxWidth: 320, margin: '0 auto 1.5rem'
      }}>
        {msgs[filter]}
      </p>
      <a href="/" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: 15 }}>
        write the first letter →
      </a>
    </motion.div>
  )
}

function LoadingBottles() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          style={{ fontSize: 22, display: 'inline-block' }}
        >
          🍶
        </motion.span>
      ))}
    </div>
  )
}

function EndOfFeed() {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        fontFamily: "'EB Garamond', serif", fontSize: 13,
        fontStyle: 'italic', color: 'var(--ink-s)'
      }}>
        <span style={{ display: 'inline-block', width: 40, height: 1, background: 'rgba(61,43,31,0.2)' }} />
        you've read every bottle that washed ashore
        <span style={{ display: 'inline-block', width: 40, height: 1, background: 'rgba(61,43,31,0.2)' }} />
      </div>
    </div>
  )
}

function FeedFooter() {
  return (
    <footer style={{
      background: 'var(--ink)', padding: '1rem 2rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <span style={{ fontFamily: 'var(--fd)', fontSize: 16, color: 'var(--sky)' }}>🍊 orange</span>
      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 11, fontStyle: 'italic', color: 'rgba(253,246,236,0.45)' }}>
        anonymous · ephemeral · honest
      </span>
    </footer>
  )
}