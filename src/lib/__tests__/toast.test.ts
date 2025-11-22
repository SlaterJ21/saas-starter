import { toast } from '../toast'
import { toast as sonnerToast } from 'sonner'

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        loading: jest.fn(), // Add this
        promise: jest.fn(), // Add this
    },
}))

describe('Toast Helper', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('calls sonner success toast with correct params', () => {
        toast.success('Success!', 'Everything worked')

        expect(sonnerToast.success).toHaveBeenCalledWith('Success!', {
            description: 'Everything worked',
            duration: 3000,
        })
    })

    it('calls sonner error toast with correct params', () => {
        toast.error('Error!', 'Something failed')

        expect(sonnerToast.error).toHaveBeenCalledWith('Error!', {
            description: 'Something failed',
            duration: 4000,
        })
    })

    it('calls sonner info toast with correct params', () => {
        toast.info('Info!', 'Here is some information')

        expect(sonnerToast.info).toHaveBeenCalledWith('Info!', {
            description: 'Here is some information',
            duration: 3000,
        })
    })

    it('works without description', () => {
        toast.success('Success!')

        expect(sonnerToast.success).toHaveBeenCalledWith('Success!', {
            description: undefined,
            duration: 3000,
        })
    })

    it('calls sonner loading toast', () => {
        toast.loading('Loading...')

        expect(sonnerToast.loading).toHaveBeenCalledWith('Loading...')
    })

    it('calls sonner promise toast with string messages', () => {
        const mockPromise = Promise.resolve('data')

        toast.promise(mockPromise, {
            loading: 'Loading...',
            success: 'Success!',
            error: 'Error occurred',
        })

        expect(sonnerToast.promise).toHaveBeenCalledWith(mockPromise, {
            loading: 'Loading...',
            success: 'Success!',
            error: 'Error occurred',
        })
    })

    it('calls sonner promise toast with function messages', () => {
        const mockPromise = Promise.resolve('data')
        const successFn = (data: string) => `Got: ${data}`
        const errorFn = (error: Error) => `Failed: ${error.message}`

        toast.promise(mockPromise, {
            loading: 'Loading...',
            success: successFn,
            error: errorFn,
        })

        expect(sonnerToast.promise).toHaveBeenCalledWith(mockPromise, {
            loading: 'Loading...',
            success: successFn,
            error: errorFn,
        })
    })
})