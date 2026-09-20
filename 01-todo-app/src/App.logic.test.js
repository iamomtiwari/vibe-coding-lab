import { describe, expect, it } from 'vitest'
import { computeLevelInfo, resetDueRecurring } from './App'

describe('computeLevelInfo', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(computeLevelInfo(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 20,
    })
  })

  it('stays level 1 until the level-1 threshold (20 xp) is reached', () => {
    expect(computeLevelInfo(19)).toEqual({
      level: 1,
      xpIntoLevel: 19,
      xpForNextLevel: 20,
    })
  })

  it('advances to level 2 at exactly 20 xp', () => {
    expect(computeLevelInfo(20)).toEqual({
      level: 2,
      xpIntoLevel: 0,
      xpForNextLevel: 40,
    })
  })

  it('accounts for increasing thresholds across multiple level-ups', () => {
    // 20 (lvl1->2) + 40 (lvl2->3) = 60 to reach level 3
    expect(computeLevelInfo(60)).toEqual({
      level: 3,
      xpIntoLevel: 0,
      xpForNextLevel: 60,
    })
  })

  it('carries partial progress into the current level', () => {
    // 60 to reach level 3, +10 more into level 3
    expect(computeLevelInfo(70)).toEqual({
      level: 3,
      xpIntoLevel: 10,
      xpForNextLevel: 60,
    })
  })
})

describe('resetDueRecurring', () => {
  const HOUR = 60 * 60 * 1000

  it('leaves one-time todos untouched regardless of done state', () => {
    const todos = [{ id: '1', done: true, repeat: 'none', lastCompletedAt: 0 }]
    expect(resetDueRecurring(todos)).toEqual(todos)
  })

  it('leaves not-done recurring todos untouched', () => {
    const todos = [
      { id: '1', done: false, repeat: 'daily', lastCompletedAt: null },
    ]
    expect(resetDueRecurring(todos)).toEqual(todos)
  })

  it('does not reset a daily todo before 24 hours have elapsed', () => {
    const todos = [
      {
        id: '1',
        done: true,
        repeat: 'daily',
        lastCompletedAt: Date.now() - 23 * HOUR,
      },
    ]
    const result = resetDueRecurring(todos)
    expect(result[0].done).toBe(true)
  })

  it('resets a daily todo once 24 hours have elapsed', () => {
    const todos = [
      {
        id: '1',
        done: true,
        repeat: 'daily',
        lastCompletedAt: Date.now() - 25 * HOUR,
      },
    ]
    const result = resetDueRecurring(todos)
    expect(result[0]).toMatchObject({ done: false, lastCompletedAt: null })
  })

  it('leaves the grown flag untouched when a recurring todo auto-resets', () => {
    const todos = [
      {
        id: '1',
        done: true,
        grown: true,
        repeat: 'daily',
        lastCompletedAt: Date.now() - 25 * HOUR,
      },
    ]
    const result = resetDueRecurring(todos)
    expect(result[0]).toMatchObject({ done: false, grown: true })
  })

  it('does not reset a weekly todo after only 1 day', () => {
    const todos = [
      {
        id: '1',
        done: true,
        repeat: 'weekly',
        lastCompletedAt: Date.now() - 24 * HOUR,
      },
    ]
    const result = resetDueRecurring(todos)
    expect(result[0].done).toBe(true)
  })

  it('resets a weekly todo once 7 days have elapsed', () => {
    const todos = [
      {
        id: '1',
        done: true,
        repeat: 'weekly',
        lastCompletedAt: Date.now() - 8 * 24 * HOUR,
      },
    ]
    const result = resetDueRecurring(todos)
    expect(result[0]).toMatchObject({ done: false, lastCompletedAt: null })
  })
})
