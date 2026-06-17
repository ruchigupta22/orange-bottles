import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSend() {
    if (!email.includes('@')) { setError('enter a valid email'); return }
    setLoading(true)
    setError('')
    try {
      await signInWithEmail(email)
      setSent(true)
    } catch (err) {
      setError('something went wrong. try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>
      <HeroStrip emoji={sent ? '✉️' : '🍶'} tagline={sent ? 'check your inbox' : 'a time capsule for your feelings'} />
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="login"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="card"
            >
              <h1 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 400, color: 'var(--ink)', marginBottom: 8 }}>
                welcome back
              </h1>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Enter your email and we'll send you a magic link — no password needed.
              </p>

              <label style={{ fontFamily: 'var(--fb)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-s)', marginBottom: 8, display: 'block' }}>
                your email
              </label>
              <input
                className="letter-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{ marginBottom: '1.25rem', fontStyle: 'normal', fontSize: 15 }}
              />

              {error && (
                <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--ember)', fontStyle: 'italic', marginBottom: '1rem' }}>
                  {error}
                </p>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', fontSize: 16, opacity: loading ? 0.6 : 1 }}
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? 'sending...' : '🌊  send me the magic link'}
              </button>

              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.6, textAlign: 'center', marginTop: '1rem', lineHeight: 1.6 }}>
                No account yet? Just enter your email — we'll create one automatically.
              </p>
            </motion.div>
          ) : (
            <motion.div key="sent"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--dusk))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: 32 }}
              >
                🌊
              </motion.div>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>magic link sent!</h2>
              <p style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '1rem' }}>
                We've sent a sign-in link to:
              </p>
              <div style={{ background: 'var(--parchment)', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 12, padding: '12px 16px', fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink)', marginBottom: '1.5rem' }}>
                {email}
              </div>

              {[
                'Open your email inbox',
                'Click "open my bottles" in the email from orange',
                'You\'ll be signed in — no password needed'
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, textAlign: 'left' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--dusk)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fd)', fontSize: 14, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <p style={{ fontFamily: 'var(--fb)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-s)', lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}

              <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setSent(false)}>
                try a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function HeroStrip({ emoji, tagline }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #FAE5BC, #F5C47A 50%, #E8956A)',
      padding: '2rem 2rem 1.5rem', textAlign: 'center',
      borderRadius: '0 0 24px 24px', marginBottom: '2rem'
    }}>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 26, color: 'var(--ink)', marginBottom: 8 }}>🍊 orange</div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 42, margin: '0.75rem 0', display: 'inline-block' }}
      >
        {emoji}
      </motion.div>
      <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.75 }}>
        {tagline}
      </div>
    </div>
  )
}