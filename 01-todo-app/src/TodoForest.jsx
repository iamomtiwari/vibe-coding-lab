const FOLIAGE_COLORS = ['#4c956c', '#2f6f4e', '#6a994e', '#386641', '#588157']

function Plant({ grown, colorIndex }) {
  const foliage = FOLIAGE_COLORS[colorIndex % FOLIAGE_COLORS.length]

  return (
    <svg className="plant" viewBox="0 0 60 70" width="48" height="56">
      <ellipse className="plant-ground" cx="30" cy="66" rx="22" ry="4" />
      {grown ? (
        <g className="plant-tree">
          <rect x="26" y="30" width="8" height="34" rx="3" fill="#8a5a34" />
          <circle cx="30" cy="26" r="20" fill={foliage} />
        </g>
      ) : (
        <ellipse className="plant-seed" cx="30" cy="58" rx="6" ry="8" />
      )}
    </svg>
  )
}

function TodoForest({ todos }) {
  const grownCount = todos.filter((todo) => todo.grown).length

  return (
    <section className="forest-panel">
      <h2 className="group-title">
        Forest{todos.length > 0 && ` · ${grownCount} / ${todos.length} grown`}
      </h2>
      {todos.length === 0 ? (
        <p className="empty-state">Add a todo to plant your first seed.</p>
      ) : (
        <div className="forest-grid">
          {todos.map((todo, i) => (
            <Plant key={todo.id} grown={todo.grown} colorIndex={i} />
          ))}
        </div>
      )}
    </section>
  )
}

export default TodoForest
