import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function UserProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [exists, setExists] = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('username').eq('username', username).maybeSingle()
      .then(({ data }) => setExists(!!data))
  }, [username])

  if (exists === null) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--parchment)' }}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 36 }}>🍶</motion.div>
    </div>
  )

  if (!exists) return (
    <div style={{ maxWidth: 440, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: '1rem' }}>🌊</div>
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>no one here</h2>
      <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)' }}>@{username} hasn't joined orange yet.</p>
      <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem' }} className="btn btn-primary">go home</a>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>
      <header style={{
        background: 'linear-gradient(180deg, #FAE5BC 0%, #F5C47A 55%, #E8956A 100%)',
        padding: '2rem 2rem 1.5rem', textAlign: 'center'
      }}>
        <a href="/" style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}>🍊 orange</a>

        {/* Avatar */}
        <motion.div
          animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gold), var(--dusk))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: 28, fontFamily: 'var(--fd)', color: 'var(--cream)'
          }}
        >
          {username[0].toUpperCase()}
        </motion.div>

        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>@{username}</h1>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)' }}>
          send them a bottle — anonymously
        </p>
      </header>

      <div className="horizon" />

      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: 'var(--cream)', border: '1px solid rgba(212,168,83,0.25)', borderRadius: 16, padding: '2rem', marginBottom: '1rem' }}>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            @{username} will receive your letter — they'll never know who sent it. No name, no trace. Just your words.
          </p>
          <motion.button
            className="btn btn-primary"
            style={{ fontSize: 16 }}
            onClick={() => navigate(`/send?to=${username}`)}
            whileTap={{ scale: 0.97 }}
          >
            📬 &nbsp; write a bottle for @{username}
          </motion.button>
        </div>

        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.6 }}>
          anonymous · they can react but never reply
        </p>
      </div>
    </div>
  )
}