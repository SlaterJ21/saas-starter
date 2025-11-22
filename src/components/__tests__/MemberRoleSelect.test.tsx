import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MemberRoleSelect from '../MemberRoleSelect'
import { updateMemberRole } from '@/app/actions/team'
import { toast } from '@/lib/toast'

jest.mock('@/app/actions/team', () => ({
    updateMemberRole: jest.fn(),
}))

jest.mock('@/lib/toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

describe('MemberRoleSelect Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with current role selected', () => {
        render(<MemberRoleSelect userId="user-1" currentRole="admin" />)

        const select = screen.getByRole('combobox')
        expect(select).toHaveValue('admin')
    })

    it('updates role on change', async () => {
        const mockUpdate = updateMemberRole as jest.MockedFunction<typeof updateMemberRole>
        mockUpdate.mockResolvedValue({ success: true, message: 'Role updated' })

        render(<MemberRoleSelect userId="user-1" currentRole="member" />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'admin' } })

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith('user-1', 'admin')
            expect(toast.success).toHaveBeenCalledWith('Role updated!', 'Role updated')
        })
    })

    it('reverts on error', async () => {
        const mockUpdate = updateMemberRole as jest.MockedFunction<typeof updateMemberRole>
        mockUpdate.mockResolvedValue({ success: false, message: 'Failed' })

        render(<MemberRoleSelect userId="user-1" currentRole="member" />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'admin' } })

        await waitFor(() => {
            expect(select).toHaveValue('member') // Reverted
            expect(toast.error).toHaveBeenCalled()
        })
    })

    it('applies color classes based on role', () => {
        const { container } = render(<MemberRoleSelect userId="user-1" currentRole="owner" />)
        const select = container.querySelector('select')
        expect(select).toHaveClass('border-purple-300', 'bg-purple-50')
    })

    it('updates color when role changes', async () => {
        const mockUpdate = updateMemberRole as jest.MockedFunction<typeof updateMemberRole>
        mockUpdate.mockResolvedValue({ success: true, message: 'Updated' })

        const { container } = render(<MemberRoleSelect userId="user-1" currentRole="member" />)

        const select = screen.getByRole('combobox')

        // Initial color
        expect(select).toHaveClass('border-green-300', 'bg-green-50')

        // Change role
        fireEvent.change(select, { target: { value: 'admin' } })

        // Optimistically updates color
        await waitFor(() => {
            expect(select).toHaveClass('border-blue-300', 'bg-blue-50')
        })
    })

    it('disables select during update', async () => {
        const mockUpdate = updateMemberRole as jest.MockedFunction<typeof updateMemberRole>
        mockUpdate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Updated' }), 100)))

        render(<MemberRoleSelect userId="user-1" currentRole="member" />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'admin' } })

        expect(select).toBeDisabled()

        await waitFor(() => {
            expect(select).not.toBeDisabled()
        })
    })
})