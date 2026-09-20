import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PetAvatar from './PetAvatar'

describe('PetAvatar', () => {
  it('renders with an accessible label', () => {
    render(<PetAvatar />)
    expect(
      screen.getByRole('button', { name: /pet avatar/i })
    ).toBeInTheDocument()
  })

  it('shows a heart when patted', async () => {
    const user = userEvent.setup()
    render(<PetAvatar />)

    expect(screen.queryByText('💗')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /pet avatar/i }))

    expect(screen.getByText('💗')).toBeInTheDocument()
  })

  it('renders only the equipped accessories', () => {
    const { container } = render(<PetAvatar equipped={['bowtie']} />)

    expect(container.querySelector('.pet-accessory-bowtie')).not.toBeNull()
    expect(container.querySelector('.pet-accessory-hat')).toBeNull()
  })
})
