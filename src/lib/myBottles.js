const KEY = 'orange_my_bottles'

export function saveMyBottle(bottle) {
  const all = getMyBottles()
  all.unshift({
    id:          bottle.id,
    type:        bottle.type,
    deliverInDays: bottle.deliver_in,
    createdAt:   bottle.created_at,
    visibleAt:   bottle.visible_at,
    preview:     bottle.content.slice(0, 60) + (bottle.content.length > 60 ? '…' : ''),
  })
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 20))) // keep last 20
}

export function getMyBottles() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function getMyBottleStatus(bottle) {
  const now       = Date.now()
  const visibleAt = new Date(bottle.visibleAt).getTime()
  const createdAt = new Date(bottle.createdAt).getTime()
  const total     = visibleAt - createdAt
  const elapsed   = now - createdAt
  const msLeft    = visibleAt - now

  if (msLeft <= 0) return { status: 'arrived', msLeft: 0, progress: 100 }

  const days    = Math.floor(msLeft / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60))

  return {
    status: 'drifting',
    msLeft,
    progress: Math.round((elapsed / total) * 100),
    days, hours, minutes,
  }
}