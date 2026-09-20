import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

async function addTodo(user, text, { category, repeat } = {}) {
  await user.type(screen.getByLabelText('New todo'), text)
  if (category) {
    await user.type(screen.getByLabelText('Category'), category)
  }
  if (repeat) {
    await user.selectOptions(screen.getByLabelText('Repeat'), repeat)
  }
  await user.click(screen.getByRole('button', { name: 'Add' }))
}

describe('todo CRUD', () => {
  it('shows the empty state with no todos', () => {
    render(<App />)
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it('adds a todo and displays it in the list', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, 'Buy milk')
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('toggling a todo marks it done and awards xp', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, 'Water the plants')

    expect(screen.getByText('0 quests completed')).toBeInTheDocument()

    await user.click(
      screen.getByRole('checkbox', { name: 'Water the plants' })
    )

    expect(screen.getByText('1 quest completed')).toBeInTheDocument()
    expect(screen.getByText('10 / 100 XP to next level')).toBeInTheDocument()
  })

  it('unchecking a completed todo refunds xp and quest count', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, 'Water the plants')
    const checkbox = screen.getByRole('checkbox', { name: 'Water the plants' })

    await user.click(checkbox)
    await user.click(checkbox)

    expect(screen.getByText('0 quests completed')).toBeInTheDocument()
    expect(screen.getByText('0 / 100 XP to next level')).toBeInTheDocument()
  })

  it('deletes a todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, 'Temporary task')
    expect(screen.getByText('Temporary task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.queryByText('Temporary task')).not.toBeInTheDocument()
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it('groups todos by category', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, 'Do laundry', { category: 'Chores' })
    await addTodo(user, 'Read a book')

    expect(screen.getByText('Chores')).toBeInTheDocument()
    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    expect(
      within(screen.getByText('Chores').closest('section')).getByText(
        'Do laundry'
      )
    ).toBeInTheDocument()
  })

  it('shows a repeat badge for recurring todos', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTodo(user, 'Daily stretch', { repeat: 'daily' })

    expect(screen.getByText('↻ Daily')).toBeInTheDocument()
  })
})

describe('pet customization', () => {
  it('renames the pet', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nameInput = screen.getByLabelText('Name')

    await user.clear(nameInput)
    await user.type(nameInput, 'Sparky')

    expect(screen.getByText('Sparky')).toBeInTheDocument()
  })
})
