import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sealBottleToUser, searchUsers } from '../lib/api'
import { saveMyBottle } from '../lib/myBottles'


const DELIVERY_OPTIONS = [
  { id: 1, label: 'soon',     value: '7 days',   days: 7   },
  { id: 2, label: 'a while',  value: '1 month',  days: 30  },
  { id: 3, label: 'someday',  value: '6 months', days: 180 },
  { id: 4, label: 'far away', value: '1 year',   days: 365 },
]

export default function SendBottle() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Pre-fill recipient if coming from /u/:username
  const [mode, setMode] = useState("user")
  const [recipient, setRecipient]   = useState(searchParams.get('to') || '')
  const [users, setUsers] = useState([])
  const [recipientOk, setRecipientOk] = useState(!!searchParams.get('to'))
  const [checking, setChecking]     = useState(false)
  const [text, setText]             = useState('')
  const [type, setType]             = useState('future')
  const [delivery, setDelivery]     = useState(1)
  const [loading, setLoading]       = useState(false)
  const [sealed, setSealed]         = useState(false)
  const [error, setError]           = useState('')
  const [suggestions, setSuggestions] = useState([])

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const selectedOption = DELIVERY_OPTIONS.find(o => o.id === delivery)
  useEffect(() => {
  loadUsers()
}, [])

async function loadUsers() {
  const data = await searchUsers("")
  setUsers(data || [])
}
  

  // Check if username exists
  async function checkRecipient(val) {
    if (!val || val.length < 3) { setRecipientOk(false); return }
    setChecking(true)
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', val.toLowerCase())
      .maybeSingle()
    setRecipientOk(!!data)
    setChecking(false)
  }

    async function handleRecipientChange(e) {
  const val = e.target.value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")

  setRecipient(val)

  const users = await searchUsers(val)
  setSuggestions(users)

  clearTimeout(window._rcTimer)
  window._rcTimer =
    setTimeout(() => checkRecipient(val), 500)
}

  async function handleSeal() {
    if (wordCount < 3 || !recipientOk) return
    setLoading(true)
    setError('')
    try {
      const data = await sealBottleToUser({
        content:       text,
        type,
        deliverInDays: selectedOption.days,
        recipientUsername: recipient,
      })
      saveMyBottle(data)
      setSealed(true)
      setText('')
    } catch (err) {
      console.error(err)
      setError('something went wrong. try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sealed) return <SealedScreen recipient={recipient} option={selectedOption} onAgain={() => { setSealed(false); setRecipient(''); setRecipientOk(false) }} onHome={() => navigate('/')} />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)' }}>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(180deg, #FAE5BC 0%, #F5C47A 55%, #E8956A 100%)',
        padding: '2rem 2rem 1.5rem',
      }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <a href="/" style={{ fontFamily: 'var(--fd)', fontSize: 22, color: 'var(--ink)', textDecoration: 'none' }}>🍊 orange</a>
          <a href="/" style={{ fontFamily: 'var(--fb)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-s)', textDecoration: 'none', borderBottom: '1px solid rgba(61,43,31,0.25)', paddingBottom: 1 }}>← back</a>
        </nav>
        <motion.div animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: 36, marginBottom: 8 }}>📬</motion.div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', marginBottom: 6 }}>send a bottle</h1>
        <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)' }}>
          Anonymous. They'll never know it was you.
        </p>
      </header>

      <div className="horizon" />

      <div style={{ padding: '2rem 1.5rem' }}>
        {/* Send mode */}
<div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: "1.5rem",
  }}
>
  <button
    className={`type-btn ${mode === "user" ? "active-future" : ""}`}
    onClick={() => setMode("user")}
  >
    👤 send to a traveler
  </button>

  <button
    className={`type-btn ${mode === "ocean" ? "active-future" : ""}`}
    onClick={() => setMode("ocean")}
  >
    🌊 drift into the ocean
  </button>
</div>



        {mode === "user" && (
  <div style={{
    background: 'var(--cream)',
    border: '1px solid rgba(212,168,83,0.25)',
    borderRadius: 16,
    padding: '1.5rem',
    marginBottom: 16
  }}>
          <div style={{ fontFamily: 'var(--fb)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-s)', marginBottom: 8 }}>
            send to
          </div>
        
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)', opacity: 0.6, pointerEvents: 'none' }}>@</span>
            <input
              className="letter-input"
              type="text"
              placeholder="their username"
              value={recipient}
              onChange={handleRecipientChange}
              style={{ paddingLeft: 36, fontStyle: 'normal', fontSize: 15 }}
            />
            {users.length > 0 && (
  <div
    style={{
      marginTop: 12,
      background: "var(--parchment)",
      borderRadius: 12,
      padding: 8,
      maxHeight: 180,
      overflowY: "auto",
    }}
  >
    {users
      .filter(u => u.username !== recipient)
      .map(user => (
        <div
          key={user.username}
          onClick={() => {
            setRecipient(user.username)
            setRecipientOk(true)
          }}
          style={{
            padding: 10,
            cursor: "pointer",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            fontFamily: "var(--fb)",
            fontStyle: "italic",
          }}
        >
          @{user.username}
        </div>
      ))}
  </div>
)}

            {suggestions.length > 0 && (
  <div
    style={{
      marginTop: 12,
      background: "var(--parchment)",
      borderRadius: 12,
      padding: 8,
    }}
  >
    {suggestions.map(user => (
      <div
        key={user.username}
        onClick={() => {
          setRecipient(user.username)
          setRecipientOk(true)
          setSuggestions([])
        }}
        style={{
          padding: 10,
          cursor: "pointer",
          fontFamily: "var(--fb)",
          fontStyle: "italic",
        }}
      >
        @{user.username}
      </div>
    ))}
  </div>
)}

          </div>
          <p style={{
            fontFamily: "'EB Garamond', serif", fontSize: 12, fontStyle: 'italic', paddingLeft: 4,
            color: !recipient ? 'var(--ink-s)' : checking ? 'var(--ink-s)' : recipientOk ? '#6B9A68' : 'var(--ember)'
          }}>
            {!recipient ? 'enter their orange username' :
             checking   ? 'checking...' :
             recipientOk ? `✓  @${recipient} exists — they'll receive this anonymously` :
             '✗  username not found'}
          </p>
        </div>
        )}

        {/* Letter area — only show once recipient confirmed */}
        <AnimatePresence>
          {recipientOk && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Type toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'future', label: '🌊 to their future self', cls: 'active-future' },
                  { key: 'past',   label: '🍂 to their past self',   cls: 'active-past'   },
                ].map(({ key, label, cls }) => (
                  <button key={key} className={`type-btn ${type === key ? cls : ''}`} onClick={() => setType(key)}>
                    {label}
                  </button>
                ))}
              </div>
            

              {/* Paper */}
              <div className="letter-wrap" style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: '0.75rem', opacity: 0.7 }}>
                  {type === 'future' ? `Dear @${recipient}'s future self,` : `Dear @${recipient}'s past self,`}
                </div>
                <textarea
                  className="letter-ta"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="I just wanted you to know..."
                  rows={6}
                  maxLength={3000}
                />
              </div>
              <div className="word-count">{wordCount} / 500 words</div>

              {/* Delivery */}
              <div style={{ fontFamily: 'var(--fb)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-s)', margin: '1.25rem 0 1rem' }}>
                they'll receive it in
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {DELIVERY_OPTIONS.map(opt => (
                  <div key={opt.id} className={`delivery-chip ${delivery === opt.id ? 'selected' : ''}`} onClick={() => setDelivery(opt.id)}>
                    <span className="delivery-chip-label">{opt.label}</span>
                    <span className="delivery-chip-val">{opt.value}</span>
                  </div>
                ))}
              </div>
              

              {error && <p style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--ember)', fontStyle: 'italic', marginBottom: '1rem' }}>{error}</p>}

              <motion.button
                className="btn btn-primary"
                style={{ width: '100%', fontSize: 17, opacity: (wordCount < 3 || loading) ? 0.5 : 1 }}
                onClick={handleSeal}
                disabled={wordCount < 3 || loading}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? 'sealing...' : `📬  send to @${recipient} anonymously`}
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SealedScreen({ recipient, option, onAgain, onHome }) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', background: 'var(--parchment)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--dusk))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: '1.5rem' }}
      >
        🍶
      </motion.div>

      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', textAlign: 'center', marginBottom: 8 }}>
        bottle sent!
      </h2>
      <p style={{ fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic', color: 'var(--ink-s)', textAlign: 'center', marginBottom: 8, lineHeight: 1.7 }}>
        @{recipient} will receive it in {option.value}.
      </p>
      <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--gold)', textAlign: 'center', marginBottom: '2rem' }}>
        ✦ &nbsp; they'll never know it was you &nbsp; ✦
      </p>

      {/* Floating bottles */}
      <div style={{ display: 'flex', gap: 16, marginBottom: '2rem' }}>
        {[0, 1, 2].map(i => (
          <motion.span key={i} animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }} style={{ fontSize: 28 }}>🍶</motion.span>
        ))}
      </div>

      <button className="btn btn-primary" style={{ fontSize: 15, marginBottom: 12 }} onClick={onAgain}>
        send another bottle
      </button>
      <button className="btn btn-ghost" style={{ fontSize: 15 }} onClick={onHome}>
        back to home
      </button>
    </div>
  )
}