import { useEffect, useRef, useState } from 'react'
import PetAvatar, { ACCESSORIES } from './PetAvatar'
import './App.css'

const STORAGE_KEY = 'todo-app.todos'
const PROFILE_STORAGE_KEY = 'todo-app.profile'
const PET_STORAGE_KEY = 'todo-app.pet'
const UNCATEGORIZED = 'Uncategorized'
const XP_PER_TASK = 10

const PET_SHAPES = ['round', 'square', 'star']
const DEFAULT_PET = {
  name: 'Buddy',
  shape: 'round',
  color: '#f4a261',
  equipped: [],
}

const REPEAT_INTERVAL_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
}

const REPEAT_LABELS = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : { xp: 0, questsCompleted: 0 }
  } catch {
    return { xp: 0, questsCompleted: 0 }
  }
}

function loadPet() {
  try {
    const raw = localStorage.getItem(PET_STORAGE_KEY)
    return raw ? { ...DEFAULT_PET, ...JSON.parse(raw) } : DEFAULT_PET
  } catch {
    return DEFAULT_PET
  }
}

// Level N requires N*100 XP to reach level N+1 (100, 200, 300, ...).
function computeLevelInfo(xp) {
  let level = 1
  let remaining = xp
  let xpForNextLevel = level * 100
  while (remaining >= xpForNextLevel) {
    remaining -= xpForNextLevel
    level += 1
    xpForNextLevel = level * 100
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel }
}

const FILTERS = {
  all: () => true,
  active: (todo) => !todo.done,
  completed: (todo) => todo.done,
}

// Recurring todos that were completed longer ago than their interval
// automatically pop back to "not done" so they can be repeated.
function resetDueRecurring(todos) {
  const now = Date.now()
  return todos.map((todo) => {
    if (!todo.done || todo.repeat === 'none' || !todo.lastCompletedAt) {
      return todo
    }
    const interval = REPEAT_INTERVAL_MS[todo.repeat]
    if (now - todo.lastCompletedAt >= interval) {
      return { ...todo, done: false, lastCompletedAt: null }
    }
    return todo
  })
}

function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [profile, setProfile] = useState(loadProfile)
  const [pet, setPet] = useState(loadPet)
  const [petExpression, setPetExpression] = useState('neutral')
  const smileTimeoutRef = useRef(null)
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')
  const [repeat, setRepeat] = useState('none')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet))
  }, [pet])

  useEffect(() => () => clearTimeout(smileTimeoutRef.current), [])

  // Check for due recurring todos on load, then poll periodically
  // in case the app is left open across the reset boundary.
  useEffect(() => {
    setTodos((prev) => resetDueRecurring(prev))
    const id = setInterval(() => {
      setTodos((prev) => resetDueRecurring(prev))
    }, 60 * 1000)
    return () => clearInterval(id)
  }, [])

  function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false,
        category: category.trim(),
        repeat,
        lastCompletedAt: null,
      },
    ])
    setText('')
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const nowDone = !todo.done

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              done: nowDone,
              lastCompletedAt: nowDone && t.repeat !== 'none' ? Date.now() : null,
            }
          : t
      )
    )

    // Manually checking a task awards XP; manually unchecking (an undo)
    // takes it back. Automatic recurring resets skip this function entirely,
    // so XP already earned for a past completion is never clawed back.
    const delta = nowDone ? 1 : -1
    setProfile((prev) => ({
      xp: Math.max(0, prev.xp + delta * XP_PER_TASK),
      questsCompleted: Math.max(0, prev.questsCompleted + delta),
    }))

    if (nowDone) {
      setPetExpression('happy')
      clearTimeout(smileTimeoutRef.current)
      smileTimeoutRef.current = setTimeout(
        () => setPetExpression('neutral'),
        2500
      )
    }
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((todo) => !todo.done))
  }

  function toggleAccessory(id) {
    const accessory = ACCESSORIES.find((a) => a.id === id)
    if (!accessory || computeLevelInfo(profile.xp).level < accessory.unlockLevel) {
      return
    }
    setPet((prev) => ({
      ...prev,
      equipped: prev.equipped.includes(id)
        ? prev.equipped.filter((e) => e !== id)
        : [...prev.equipped, id],
    }))
  }

  const knownCategories = Array.from(
    new Set(todos.map((todo) => todo.category).filter(Boolean))
  ).sort()

  const visibleTodos = todos.filter(FILTERS[filter])
  const activeCount = todos.filter((todo) => !todo.done).length

  const groups = visibleTodos.reduce((acc, todo) => {
    const key = todo.category || UNCATEGORIZED
    if (!acc[key]) acc[key] = []
    acc[key].push(todo)
    return acc
  }, {})

  const groupNames = Object.keys(groups).sort((a, b) => {
    if (a === UNCATEGORIZED) return 1
    if (b === UNCATEGORIZED) return -1
    return a.localeCompare(b)
  })

  const { level, xpIntoLevel, xpForNextLevel } = computeLevelInfo(profile.xp)
  const progressPercent = Math.round((xpIntoLevel / xpForNextLevel) * 100)

  // If XP ever drops below an accessory's unlock threshold (e.g. undoing a
  // completion), hide it on the pet without discarding the equip choice.
  const unlockedEquipped = pet.equipped.filter((id) => {
    const accessory = ACCESSORIES.find((a) => a.id === id)
    return accessory && level >= accessory.unlockLevel
  })

  return (
    <main className="app">
      <h1>Todo App</h1>

      <section className="pet-panel">
        <div className="pet-display">
          <PetAvatar
            shape={pet.shape}
            color={pet.color}
            expression={petExpression}
            equipped={unlockedEquipped}
          />
          <span className="pet-name">{pet.name || 'Unnamed pet'}</span>
        </div>
        <div className="pet-controls">
          <label className="pet-field">
            Name
            <input
              type="text"
              value={pet.name}
              onChange={(e) =>
                setPet((prev) => ({ ...prev, name: e.target.value }))
              }
              maxLength={20}
            />
          </label>
          <label className="pet-field">
            Shape
            <select
              value={pet.shape}
              onChange={(e) =>
                setPet((prev) => ({ ...prev, shape: e.target.value }))
              }
            >
              {PET_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="pet-field">
            Color
            <input
              type="color"
              value={pet.color}
              onChange={(e) =>
                setPet((prev) => ({ ...prev, color: e.target.value }))
              }
            />
          </label>
        </div>
      </section>

      <section className="accessories-panel">
        <h2 className="group-title">Accessories</h2>
        <ul className="accessories-list">
          {ACCESSORIES.map((accessory) => {
            const unlocked = level >= accessory.unlockLevel
            const isEquipped = pet.equipped.includes(accessory.id)
            return (
              <li key={accessory.id} className={unlocked ? '' : 'locked'}>
                <label>
                  <input
                    type="checkbox"
                    checked={unlocked && isEquipped}
                    disabled={!unlocked}
                    onChange={() => toggleAccessory(accessory.id)}
                  />
                  {accessory.label}
                </label>
                {!unlocked && (
                  <span className="unlock-hint">
                    Unlocks at level {accessory.unlockLevel}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="stats-panel">
        <div className="stats-header">
          <span className="level-badge">Level {level}</span>
          <span className="quests-completed">
            {profile.questsCompleted} quest
            {profile.questsCompleted === 1 ? '' : 's'} completed
          </span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={xpIntoLevel}
          aria-valuemin={0}
          aria-valuemax={xpForNextLevel}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="xp-label">
          {xpIntoLevel} / {xpForNextLevel} XP to next level
        </span>
      </section>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New todo"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          aria-label="Category"
          list="known-categories"
          className="category-input"
        />
        <datalist id="known-categories">
          {knownCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <select
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          aria-label="Repeat"
        >
          <option value="none">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {todos.length === 0 ? (
        <p className="empty-state">No todos yet. Add one above.</p>
      ) : (
        groupNames.map((groupName) => (
          <section key={groupName} className="todo-group">
            <h2 className="group-title">{groupName}</h2>
            <ul className="todo-list">
              {groups[groupName].map((todo) => (
                <li key={todo.id} className={todo.done ? 'done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span>{todo.text}</span>
                    {todo.repeat !== 'none' && (
                      <span className="repeat-badge">
                        ↻ {REPEAT_LABELS[todo.repeat]}
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    className="delete"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label={`Delete "${todo.text}"`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {todos.length > 0 && (
        <footer className="footer">
          <span>{activeCount} item{activeCount === 1 ? '' : 's'} left</span>
          <div className="filters">
            {Object.keys(FILTERS).map((key) => (
              <button
                key={key}
                type="button"
                className={filter === key ? 'active' : ''}
                onClick={() => setFilter(key)}
              >
                {key}
              </button>
            ))}
          </div>
          <button type="button" onClick={clearCompleted}>
            Clear completed
          </button>
        </footer>
      )}
    </main>
  )
}

export default App
