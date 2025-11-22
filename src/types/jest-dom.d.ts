import '@testing-library/jest-dom'

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R
            toHaveAttribute(attr: string, value?: string): R
            toHaveClass(...classNames: string[]): R
            toHaveTextContent(text: string | RegExp): R
            toBeDisabled(): R
            toBeEnabled(): R
            toHaveValue(value: string | number): R
        }
    }
}