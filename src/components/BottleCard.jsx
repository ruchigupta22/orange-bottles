import { useState } from 'react'
import { motion } from 'framer-motion'
import { toggleReaction } from '../lib/api'

const REACTION_EMOJIS = ['🌊', '🥺', '🕊️', '✨']
const REACTION_LABELS = {
  "🌊": "I felt this",
  "🥹": "You touched my heart",
  "🕊️": "Sending you peace",
  "✨": "Holding onto this",
}

export default function BottleCard({ bottle, myReactions = new Set(), onReact }) {
  const [toggling, setToggling] = useState(null)

  const daysSealed = Math.floor(
    (new Date(bottle.visible_at) - new Date(bottle.created_at)) / (1000 * 60 * 60 * 24)
  )
  
  const diff = Date.now() - new Date(bottle.visible_at)

let arrivedAgo

if (diff < 60000) {
  arrivedAgo = "just washed ashore"
} else if (diff < 3600000) {
  arrivedAgo = `${Math.floor(diff / 60000)}m ago`
} else if (diff < 86400000) {
  arrivedAgo = `${Math.floor(diff / 3600000)}h ago`
} else {
  arrivedAgo = `${Math.floor(diff / 86400000)}d ago`
}



if (diff < 60000)
  arrivedAgo = "just arrived"
else if (diff < 3600000)
  arrivedAgo = `${Math.floor(diff/60000)}m ago`
else if (diff < 86400000)
  arrivedAgo = `${Math.floor(diff/3600000)}h ago`
else
  arrivedAgo = `${Math.floor(diff/86400000)}d ago`

  async function handleReact(emoji) {
    if (toggling) return
    setToggling(emoji)
    try {
      const result = await toggleReaction(bottle.id, emoji)
      const added  = !!result.added
      onReact?.(bottle.id, emoji, added ? 1 : -1, added)
    } catch (err) {
      console.error('Reaction failed:', err)
    } finally {
      setToggling(null)
    }
  }

  // Only show emojis that already have reactions OR all 5
  const displayEmojis = REACTION_EMOJIS

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      {/* Meta */}
      <div style={{
        fontFamily: "'EB Garamond', serif", fontSize: 11,
        fontStyle: 'italic', color: 'var(--ink-s)',
        marginBottom: 8, letterSpacing: 0.3,
        display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <span>🍶</span>
        <span
          style={{
            background: bottle.type === 'future' ? 'var(--water)' : 'var(--sage)',
            color: 'var(--ink)', fontSize: 10, padding: '2px 8px',
            borderRadius: 100, fontStyle: 'normal', fontFamily: 'var(--fb)'
          }}
        >
          {bottle.type} self
        </span>
        {arrivedAgo === 0
          ? <span>arrived today</span>
          : <span>found {arrivedAgo}</span>
        }
        <span>·</span>
        <span>sealed {daysSealed} days</span>
      </div>

      {/* Letter text */}
      <p style={{
        fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic',
        color: 'var(--ink)', lineHeight: 1.7, marginBottom: 14
      }}>
        "{bottle.content}"
      </p>

      {/* Reactions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {displayEmojis.map(emoji => {
          const count   = bottle.reactionCounts?.[emoji] || 0
          const reacted = myReactions.has(emoji)
          const busy    = toggling === emoji

          return (
            <motion.button
              key={emoji}
              className={`reaction ${reacted ? 'reacted' : ''}`}
              onClick={() => handleReact(emoji)}
              title={REACTION_LABELS[emoji]}
              disabled={busy}
              whileTap={{ scale: 0.88 }}
              animate={busy ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.2 }}
              style={{ opacity: busy ? 0.6 : 1 }}
            >
              {emoji}
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  style={{ marginLeft: 3 }}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}