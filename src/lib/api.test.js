import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Supabase and session before importing api.js ──────────────

vi.mock('./session', () => ({
  getSessionId: () => 'test-session-123'
}))

// A small chainable mock that mimics Supabase's query builder.
// Every method returns the same object so calls can be chained any
// number of times in any order, and the object itself resolves to
// whatever `__result` is currently set to (like the real client does).
function makeQueryMock(result) {
  const mock = {
    __result: result,
    from: vi.fn(() => mock),
    select: vi.fn(() => mock),
    insert: vi.fn(() => mock),
    delete: vi.fn(() => mock),
    update: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    in: vi.fn(() => mock),
    lte: vi.fn(() => mock),
    order: vi.fn(() => mock),
    range: vi.fn(() => mock),
    ilike: vi.fn(() => mock),
    limit: vi.fn(() => mock),
    single: vi.fn(() => Promise.resolve(mock.__result)),
    maybeSingle: vi.fn(() => Promise.resolve(mock.__result)),
    then: (resolve) => resolve(mock.__result),
  }
  return mock
}

let mockSupabase

vi.mock('./supabase', () => ({
  get supabase() {
    return mockSupabase
  }
}))

const { sealBottle, sealBottleToUser, fetchFeed, toggleReaction, getMyReactions } =
  await import('./api.js')

beforeEach(() => {
  vi.useRealTimers()
})

// ── sealBottle: the bug we just fixed ───────────────────────────────

describe('sealBottle', () => {
  it('sets visible_at deliverInDays in the future, not a fixed 30 seconds', async () => {
    const fixedNow = new Date('2026-01-01T00:00:00.000Z').getTime()
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)

    let insertedRow
    mockSupabase = makeQueryMock({ data: { id: 'abc' }, error: null })
    mockSupabase.insert = vi.fn((row) => {
      insertedRow = row
      return mockSupabase
    })

    await sealBottle({ content: 'hello future me', type: 'future', deliverInDays: 7 })

    const expected = new Date(fixedNow + 7 * 24 * 60 * 60 * 1000).toISOString()
    expect(insertedRow.visible_at).toBe(expected)

    vi.useRealTimers()
  })

  it('produces a different visible_at for a different deliverInDays value', async () => {
    const fixedNow = new Date('2026-01-01T00:00:00.000Z').getTime()
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)

    let insertedRow
    mockSupabase = makeQueryMock({ data: { id: 'abc' }, error: null })
    mockSupabase.insert = vi.fn((row) => {
      insertedRow = row
      return mockSupabase
    })

    await sealBottle({ content: 'hi', type: 'past', deliverInDays: 365 })

    const expected = new Date(fixedNow + 365 * 24 * 60 * 60 * 1000).toISOString()
    expect(insertedRow.visible_at).toBe(expected)
    // and it should NOT equal the old buggy "30 seconds later" value
    expect(insertedRow.visible_at).not.toBe(new Date(fixedNow + 30 * 1000).toISOString())

    vi.useRealTimers()
  })

  it('throws if Supabase returns an error', async () => {
    mockSupabase = makeQueryMock({ data: null, error: new Error('insert failed') })
    await expect(
      sealBottle({ content: 'x', type: 'future', deliverInDays: 7 })
    ).rejects.toThrow('insert failed')
  })
})

// ── sealBottleToUser: same fix, plus the recipient field ────────────

describe('sealBottleToUser', () => {
  it('includes the recipient_username and correct visible_at', async () => {
    const fixedNow = new Date('2026-01-01T00:00:00.000Z').getTime()
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)

    let insertedRow
    mockSupabase = makeQueryMock({ data: { id: 'abc' }, error: null })
    mockSupabase.insert = vi.fn((row) => {
      insertedRow = row
      return mockSupabase
    })

    await sealBottleToUser({
      content: 'for you',
      type: 'future',
      deliverInDays: 30,
      recipientUsername: 'naho',
    })

    expect(insertedRow.recipient_username).toBe('naho')
    expect(insertedRow.visible_at).toBe(
      new Date(fixedNow + 30 * 24 * 60 * 60 * 1000).toISOString()
    )

    vi.useRealTimers()
  })
})

// ── fetchFeed: reaction aggregation ─────────────────────────────────

describe('fetchFeed', () => {
  it('aggregates reactions into reactionCounts per bottle', async () => {
    mockSupabase = makeQueryMock({
      data: [
        {
          id: '1',
          content: 'hi',
          reactions: [{ emoji: '🌊' }, { emoji: '🌊' }, { emoji: '🍊' }],
        },
        {
          id: '2',
          content: 'bye',
          reactions: [],
        },
      ],
      error: null,
    })

    const feed = await fetchFeed()

    expect(feed[0].reactionCounts).toEqual({ '🌊': 2, '🍊': 1 })
    expect(feed[1].reactionCounts).toEqual({})
  })

  it('throws if the query returns an error', async () => {
    mockSupabase = makeQueryMock({ data: null, error: new Error('feed failed') })
    await expect(fetchFeed()).rejects.toThrow('feed failed')
  })
})

// ── toggleReaction: add vs remove branch ────────────────────────────

describe('toggleReaction', () => {
  it('adds a reaction when none exists yet', async () => {
    mockSupabase = makeQueryMock({ data: null, error: null })
    mockSupabase.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }))

    const result = await toggleReaction('bottle-1', '🌊')
    expect(result).toEqual({ added: true })
  })

  it('removes a reaction when one already exists', async () => {
    mockSupabase = makeQueryMock({ data: null, error: null })
    mockSupabase.maybeSingle = vi.fn(() =>
      Promise.resolve({ data: { id: 'reaction-1' }, error: null })
    )

    const result = await toggleReaction('bottle-1', '🌊')
    expect(result).toEqual({ removed: true })
  })
})

// ── getMyReactions: building the emoji-set map ──────────────────────

describe('getMyReactions', () => {
  it('returns an empty object for an empty bottle list without querying', async () => {
    mockSupabase = makeQueryMock({ data: [], error: null })
    const result = await getMyReactions([])
    expect(result).toEqual({})
  })

  it('groups emojis by bottle id into Sets', async () => {
    mockSupabase = makeQueryMock({
      data: [
        { bottle_id: '1', emoji: '🌊' },
        { bottle_id: '1', emoji: '🍊' },
        { bottle_id: '2', emoji: '🥺' },
      ],
      error: null,
    })

    const result = await getMyReactions(['1', '2'])
    expect(result['1']).toEqual(new Set(['🌊', '🍊']))
    expect(result['2']).toEqual(new Set(['🥺']))
  })
})