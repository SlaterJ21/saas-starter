import { render } from '@testing-library/react'
import { Skeleton } from '../Skeleton'

describe('Skeleton Component', () => {
    it('renders with default classes', () => {
        const { container } = render(<Skeleton />)

        const skeleton = container.firstChild
        expect(skeleton).toHaveClass('animate-pulse', 'rounded', 'bg-gray-200')
    })

    it('applies custom className', () => {
        const { container } = render(<Skeleton className="w-full h-20" />)

        const skeleton = container.firstChild
        expect(skeleton).toHaveClass('animate-pulse', 'w-full', 'h-20')
    })

    it('merges custom classes with default classes', () => {
        const { container } = render(<Skeleton className="custom-class" />)

        const skeleton = container.firstChild
        expect(skeleton).toHaveClass('animate-pulse', 'custom-class')
    })
})