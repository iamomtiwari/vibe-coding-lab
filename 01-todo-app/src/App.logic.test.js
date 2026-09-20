import { describe, expect, it } from 'vitest'
import { computeLevelInfo, resetDueRecurring } from './App'

describe('computeLevelInfo', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(computeLevelInfo(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 100,
    })
  })

  it('stays level 1 until the level-1 threshold (100 xp) is reached', () => {
    expect(computeLevelInfo(99)).toEqual({
      level: 1,
      xpIntoLevel: 99,
      xpForNextLevel: 100,
    })
  })

  it('advances to level 2 at exactly 100 xp', () => {
    expect(computeLevelInfo(100)).toEqual({
      level: 2,
      xpIntoLevel: 0,
      xpForNextLevel: 200,
    })
  })

  it('accounts for increasing thresholds across multiple level-ups', () => {
    // 100 (lvl1->2) + 200 (lvl2->3) = 300 to reach level 3
    expect(computeLevelInfo(300)).toEqual({
      level: 3,
      xpIntoLevel: 0,
      xpForNextLevel: 300,
    })
  })

  it('carries partial progress into the current level', () => {
    // 300 to reach level 3, +50 more into level 3
    expect(computeLevelInfo(350)).toEqual({
      level: 3,
      xpIntoLevel: 50,
      xpForNextLevel: 300,
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
