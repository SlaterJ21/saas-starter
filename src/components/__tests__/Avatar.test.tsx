import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import Avatar from '../Avatar'

describe('Avatar Component', () => {
    it('renders with initials when no image provided', () => {
        render(<Avatar name="John Doe" size="md" />)

        const avatar = screen.getByText('JD')
        expect(avatar).toBeInTheDocument()
    })

    it('renders image when imageUrl is provided', () => {
        render(
            <Avatar
                name="John Doe"
                imageUrl="https://example.com/avatar.jpg"
                size="md"
            />
        )

        const image = screen.getByAltText('John Doe')
        expect(image).toBeInTheDocument()
    })

    it('handles single name', () => {
        render(<Avatar name="John" size="md" />)

        const avatar = screen.getByText('J')
        expect(avatar).toBeInTheDocument()
    })

    it('generates initials from first and middle name', () => {
        render(<Avatar name="John Michael Doe" size="md" />)

        // Based on your implementation, it takes first and second name
        const avatar = screen.getByText('JM')
        expect(avatar).toBeInTheDocument()
    })

    it('falls back to initials on image error', async () => {
        render(
            <Avatar
                name="John Doe"
                imageUrl="https://example.com/broken.jpg"
                size="md"
            />
        )

        const image = screen.getByAltText('John Doe')

        await act(async () => {
            const errorEvent = new Event('error', { bubbles: true })
            image.dispatchEvent(errorEvent)
        })

        await waitFor(() => {
            expect(screen.getByText('JD')).toBeInTheDocument()
        })
    })
})