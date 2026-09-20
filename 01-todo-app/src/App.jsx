import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'todo-app.todos'
const UNCATEGORIZED = 'Uncategorized'

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
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')
  const [repeat, setRepeat] = useState('none')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

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
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo
        const done = !todo.done
        return {
          ...todo,
          done,
          lastCompletedAt: done && todo.repeat !== 'none' ? Date.now() : null,
        }
      })
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((todo) => !todo.done))
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

  return (
    <main className="app">
      <h1>Todo App</h1>

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
