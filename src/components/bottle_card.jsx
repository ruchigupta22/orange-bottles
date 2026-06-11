import { useState } from 'react'

const REACTION_EMOJIS = ['🌊', '🍊', '🥺', '🕊', '✉️']

export default function BottleCard({ bottle }) {
  const [reactions, setReactions] = useState(bottle.reactions)
  const [myReaction, setMyReaction] = useState(null)

  function handleReact(emoji) {
    setReactions(prev => {
      const updated = { ...prev }
      if (myReaction === emoji) {
        updated[emoji] = (updated[emoji] || 1) - 1
        setMyReaction(null)
      } else {
        if (myReaction) updated[myReaction] = (updated[myReaction] || 1) - 1
        updated[emoji] = (updated[emoji] || 0) + 1
        setMyReaction(emoji)
      }
      return updated
    })
  }

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{
        fontFamily: "'EB Garamond', serif", fontSize: 11,
        fontStyle: 'italic', color: 'var(--ink-s)', marginBottom: 8, letterSpacing: 0.3
      }}>
        🍶 {bottle.type} self · found {bottle.daysAgo}d ago · sealed {bottle.sealedDays} days
      </div>
      <p style={{
        fontFamily: 'var(--fb)', fontSize: 15, fontStyle: 'italic',
        color: 'var(--ink)', lineHeight: 1.65, marginBottom: 12
      }}>
        "{bottle.text}"
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {REACTION_EMOJIS.filter(e => reactions[e] !== undefined).map(emoji => (
          <button
            key={emoji}
            className={`reaction ${myReaction === emoji ? 'reacted' : ''}`}
            onClick={() => handleReact(emoji)}
          >
            {emoji} {reactions[emoji]}
          </button>
        ))}
      </div>
    </div>
  )
}