import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'
import * as Sentry from '@sentry/nextjs'

// Component that throws an error
const ThrowError = () => {
    throw new Error('Test error')
}

const GoodComponent = () => <div>No error</div>

describe('ErrorBoundary Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Suppress console.error for these tests
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('renders children when no error', () => {
        render(
            <ErrorBoundary>
                <GoodComponent />
            </ErrorBoundary>
        )

        expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('renders default fallback when error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
        render(
            <ErrorBoundary fallback={<div>Custom error message</div>}>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('captures error to Sentry', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(Sentry.captureException).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                contexts: expect.objectContaining({
                    react: expect.any(Object),
                }),
            })
        )
    })

    it('displays error message in fallback', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Test error')).toBeInTheDocument()
    })
})