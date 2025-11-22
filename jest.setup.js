import '@testing-library/jest-dom'
import '@testing-library/jest-dom'

// Mock TextEncoder/TextDecoder for Node environment
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder
// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        }
    },
    usePathname() {
        return '/'
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    redirect: jest.fn(),
}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    startSpan: jest.fn((options, callback) => callback()),
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}))