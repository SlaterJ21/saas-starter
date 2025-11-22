import { cn } from '../utils'

describe('cn utility function', () => {
    it('merges class names', () => {
        const result = cn('foo', 'bar')
        expect(result).toBe('foo bar')
    })

    it('handles conditional classes', () => {
        const result = cn('foo', false && 'bar', 'baz')
        expect(result).toBe('foo baz')
    })

    it('handles undefined and null', () => {
        const result = cn('foo', undefined, null, 'bar')
        expect(result).toBe('foo bar')
    })

    it('merges Tailwind classes correctly', () => {
        // Should keep the last duplicate class
        const result = cn('px-2 py-1', 'px-4')
        expect(result).toBe('py-1 px-4')
    })

    it('handles arrays of classes', () => {
        const result = cn(['foo', 'bar'], 'baz')
        expect(result).toBe('foo bar baz')
    })

    it('handles empty input', () => {
        const result = cn()
        expect(result).toBe('')
    })
})