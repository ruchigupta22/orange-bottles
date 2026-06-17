import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function SetupUsername() {
  const { createProfile } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = /^[a-z0-9_]{3,20}$/.test(username)

  async function checkAvailability(val) {
    if (!val || val.length < 3) { setAvailable(null); return }
    setChecking(true)
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', val.toLowerCase())
      .maybeSingle()
    setAvailable(!data)
    setChecking(false)
  }

  function handleChange(e) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(val)
    clearTimeout(window._unTimer)
    window._unTimer = setTimeout(() => checkAvailability(val), 500)
  }

  async function handleClaim() {
    if (!isValid || !available) return
    setLoading(true)
    setError('')
    try {
      await createProfile(username)
      navigate('/')
    } catch (err) {
      setError(err.message?.includes('duplicate') ? 'username taken' : 'something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>
      <div style={{
        background: 'linear-gradient(160deg, #FAE5BC, #F5C47A 50%, #E8956A)',
        padding: '2rem 2rem 1.5rem', textAlign: 'center',
        borderRadius: '0 0 24px 24px', marginBottom: '2rem'
      }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 26, color: 'var(--ink)', marginBottom: 8 }}>🍊 orange</div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: 42, margin: '0.75rem 0', display: 'inline-block' }}
        >
          🍶
        </motion.div>
        <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.75 }}>
          one last thing...
        </div>
      </div>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div className="card">
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 400, color: 'var(--ink)', marginBottom: 8 }}>
            pick your username
          </h1>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            This is how people will send you bottles anonymously.
          </p>

          <label style={{ fontFamily: 'var(--fb)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-s)', marginBottom: 8, display: 'block' }}>
            username
          </label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.6, pointerEvents: 'none' }}>@</span>
            <input
              className="letter-input"
              type="text"
              placeholder="naho"
              value={username}
              onChange={handleChange}
              style={{ paddingLeft: 36, fontStyle: 'normal', fontSize: 15 }}
            />
          </div>

          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, fontStyle: 'italic', marginBottom: '1.25rem', paddingLeft: 4,
            color: !username ? 'var(--ink-s)' : !isValid ? 'var(--ember)' : checking ? 'var(--ink-s)' : available ? '#6B9A68' : 'var(--ember)'
          }}>
            {!username ? 'letters, numbers, underscore only' :
             !isValid ? '✗  3-20 characters, no spaces' :
             checking ? '...' :
             available ? '✓  available!' : '✗  taken — try another'}
          </p>

          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.6, marginBottom: '1.5rem', lineHeight: 1.6 }}>
            People can send bottles to <em style={{ color: 'var(--ink)', opacity: 1 }}>orange-bottles.vercel.app/u/{username || 'naho'}</em>
          </p>

          {error && <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--ember)', fontStyle: 'italic', marginBottom: '1rem' }}>{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 16, opacity: (!isValid || !available || loading) ? 0.5 : 1 }}
            onClick={handleClaim}
            disabled={!isValid || !available || loading}
          >
            {loading ? 'claiming...' : '🍶  claim my username'}
          </button>
        </div>
      </div>
    </div>
  )
}