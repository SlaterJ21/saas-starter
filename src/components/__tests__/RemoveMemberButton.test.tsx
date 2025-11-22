import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RemoveMemberButton from '../RemoveMemberButton'
import { removeMember } from '@/app/actions/team'
import { toast } from '@/lib/toast'

jest.mock('@/app/actions/team', () => ({
    removeMember: jest.fn(),
}))

jest.mock('@/lib/toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: jest.fn(),
    }),
}))

describe('RemoveMemberButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Mock window.confirm
        global.confirm = jest.fn(() => true)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('renders remove button', () => {
        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    it('shows confirmation dialog on click', () => {
        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        const button = screen.getByText('Remove')
        fireEvent.click(button)

        expect(global.confirm).toHaveBeenCalledWith('Remove John Doe from this organization?')
    })

    it('does not remove if user cancels', async () => {
        global.confirm = jest.fn(() => false)
        const mockRemove = removeMember as jest.MockedFunction<typeof removeMember>

        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        const button = screen.getByText('Remove')
        fireEvent.click(button)

        expect(mockRemove).not.toHaveBeenCalled()
    })

    it('removes member on confirmation', async () => {
        const mockRemove = removeMember as jest.MockedFunction<typeof removeMember>
        mockRemove.mockResolvedValue({ success: true, message: 'Removed' })

        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        const button = screen.getByText('Remove')
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockRemove).toHaveBeenCalledWith('user-1')
            expect(toast.success).toHaveBeenCalledWith('Member removed', 'Removed')
        })
    })

    it('shows error toast on failure', async () => {
        const mockRemove = removeMember as jest.MockedFunction<typeof removeMember>
        mockRemove.mockResolvedValue({ success: false, message: 'Failed' })

        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        const button = screen.getByText('Remove')
        fireEvent.click(button)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to remove member', 'Failed')
        })
    })

    it('disables button while removing', async () => {
        const mockRemove = removeMember as jest.MockedFunction<typeof removeMember>
        mockRemove.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Removed' }), 100)))

        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        const button = screen.getByText('Remove')
        fireEvent.click(button)

        await waitFor(() => {
            expect(button).toBeDisabled()
        })
    })

    it('shows "Removing..." text while pending', async () => {
        const mockRemove = removeMember as jest.MockedFunction<typeof removeMember>
        mockRemove.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Removed' }), 100)))

        render(<RemoveMemberButton userId="user-1" userName="John Doe" />)

        const button = screen.getByText('Remove')
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('Removing...')).toBeInTheDocument()
        })
    })
})