import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WriteLetter from '../components/WriteLetter'
import BottleCard from '../components/BottleCard'
import MyBottles from '../components/MyBottles'
import { useAuth } from '../hooks/useAuth'

const SAMPLE_BOTTLES = [
  {
    id: 1,
    type: 'future',
    text: "I hope you stopped apologising for taking up space. You always deserved to be in the room.",
    daysAgo: 3,
    sealedDays: 61,
    reactions: { '🌊': 23, '🍊': 8, '🥺': 41, '🕊': 5 }
  },
  {
    id: 2,
    type: 'past',
    text: "Remember when you used to stay up until 3am just because the night felt more honest? I miss that version of you.",
    daysAgo: 1,
    sealedDays: 14,
    reactions: { '🌊': 15, '🍊': 29, '🥺': 7, '✉️': 3 }
  },
]

export default function Home() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Hero />
      <div className="horizon" />
      <WriteLetter />
      <MyBottles /> 
      <div className="horizon" />
      <FeedPreview bottles={SAMPLE_BOTTLES} />
      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #FAE5BC 0%, #F5C47A 45%, #E8956A 78%, #C1604A 100%)',
      padding: '3rem 2rem 2.5rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      const { user, profile, signOut } = useAuth()
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
  <span style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)' }}>🍊 orange</span>
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    {user ? (
      <>
        <a href="/journey" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', textDecoration: 'none', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>
          @{profile?.username}
        </a>
        <button onClick={signOut} style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>
          sign out
        </button>
      </>
    ) : (
      <a href="/login" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', textDecoration: 'none', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>
        sign in →
      </a>
      
    )}
    <a href="/inbox" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', textDecoration: 'none', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>
  📬 inbox
</a>
    <a href="/feed" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', textDecoration: 'none', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>
      read letters →
    </a>
    <a href="/send" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--cream)', background: 'var(--ember)', padding: '6px 16px', borderRadius: '100px', textDecoration: 'none' }}>
  📬 send a bottle
</a>
  </div>
</nav>

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 64, display: 'inline-block', marginBottom: '1rem' }}
      >
        🍶
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        style={{ fontFamily: 'var(--fd)', fontSize: 30, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.25, marginBottom: '0.5rem' }}
      >
        write to who you were.<br />write to who you'll be.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ fontFamily: 'var(--fb)', fontSize: 16, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: 4 }}
      >
        Seal your feelings in a bottle. Set it adrift.
      </motion.p>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.7 }}>
        Someone — past or future — will find it.
      </p>
    </section>
  )
}

function FeedPreview({ bottles }) {
  return (
    <section style={{ background: 'var(--parchment)', padding: '1.5rem 2rem' }}>
      <div className="section-eyebrow" style={{ marginBottom: '1rem' }}>bottles found drifting</div>
      {bottles.map(b => <BottleCard key={b.id} bottle={b} />)}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="/feed" style={{
          fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic',
          color: 'var(--ink-s)', borderBottom: '1px solid rgba(61,43,31,0.2)',
          paddingBottom: 2, textDecoration: 'none'
        }}>
          read more letters drifting in →
        </a>
      </div>
    </section>
  )
}

function Footer() {
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