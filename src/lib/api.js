import { supabase } from './supabase'
import { getSessionId } from './session'

// ── Bottles ──────────────────────────────────────────

/**
 * Write and seal a new bottle.
 * visible_at is set to now() + deliverInDays.
 */
export async function sealBottle({ content, type, deliverInDays }) {
  const visibleAt = new Date(
    Date.now() + 30 * 1000
  ).toISOString()

  const { data, error } = await supabase
    .from('bottles')
    .insert({
      content,
      type,
      deliver_in: deliverInDays,
      visible_at: visibleAt
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch the feed — only bottles past their visible_at,
 * newest arrivals first, with reaction counts joined.
 */
export async function fetchFeed({ page = 0, pageSize = 10, filter = null } = {}) {
  const from = page * pageSize
  const to   = from + pageSize - 1

  let query = supabase
    .from('bottles')
    .select(`
      id, content, type, deliver_in, created_at, visible_at,
      reactions ( emoji )
    `)
    .lte('visible_at', new Date().toISOString())
    .order('visible_at', { ascending: false })
    .range(from, to)

  if (filter) query = query.eq('type', filter)  // ← add this line

  const { data, error } = await query
  if (error) throw error

  return data.map(bottle => {
    const counts = {}
    for (const { emoji } of bottle.reactions) {
      counts[emoji] = (counts[emoji] || 0) + 1
    }
    return { ...bottle, reactionCounts: counts }
  })
}

// ── Reactions ─────────────────────────────────────────

/**
 * Toggle a reaction — add if not present, remove if already reacted.
 * Returns { added: true } or { removed: true }.
 */
export async function toggleReaction(bottleId, emoji) {
  const sessionId = getSessionId()

  // Check if already reacted
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('bottle_id', bottleId)
    .eq('session_id', sessionId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existing.id)
    if (error) throw error
    return { removed: true }
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({ bottle_id: bottleId, emoji, session_id: sessionId })
    if (error) throw error
    return { added: true }
  }
}

/**
 * Get all emojis this session has reacted to for a list of bottle IDs.
 * Returns a map: { [bottleId]: Set of emojis }
 */
export async function getMyReactions(bottleIds) {
  if (!bottleIds.length) return {}
  const sessionId = getSessionId()

  const { data, error } = await supabase
    .from('reactions')
    .select('bottle_id, emoji')
    .eq('session_id', sessionId)
    .in('bottle_id', bottleIds)

  if (error) throw error

  const map = {}
  for (const { bottle_id, emoji } of data) {
    if (!map[bottle_id]) map[bottle_id] = new Set()
    map[bottle_id].add(emoji)
  }
  return map
}

export async function sealBottleToUser({ content, type, deliverInDays, recipientUsername }) {
  const visibleAt = new Date(
  Date.now() + 30 * 1000
).toISOString()

  const { data, error } = await supabase
    .from('bottles')
    .insert({
      content,
      type,
      deliver_in:         deliverInDays,
      visible_at:         visibleAt,
      recipient_username: recipientUsername,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Fetch bottles received by logged-in user
export async function fetchInbox() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data, error } = await supabase
    .from('bottles')
    .select(`id, content, type, deliver_in, created_at, visible_at, reactions(emoji)`)
    .eq('recipient_username', profile.username)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(b => {
    const counts = {}
    b.reactions.forEach(({ emoji }) => { counts[emoji] = (counts[emoji] || 0) + 1 })
    return { ...b, reactionCounts: counts }
  })
}

export async function searchUsers(query = "") {
  let request = supabase
    .from("profiles")
    .select("username")
    .order("username")
    .limit(10)

  if (query.trim()) {
    request = request.ilike("username", `${query}%`)
  }

  const { data, error } = await request

  if (error) throw error

  return data
}