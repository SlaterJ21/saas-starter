import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DeleteTaskButton from '../DeleteTaskButton'
import { deleteTask } from '@/app/actions/task'
import { toast } from '@/lib/toast'

jest.mock('@/app/actions/task', () => ({
    deleteTask: jest.fn(),
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

describe('DeleteTaskButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.confirm = jest.fn(() => true)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('renders delete button', () => {
        render(<DeleteTaskButton taskId="task-1" />)
        expect(screen.getByText('Delete Task')).toBeInTheDocument()
    })

    it('shows confirmation dialog', () => {
        render(<DeleteTaskButton taskId="task-1" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
    })

    it('does not delete if cancelled', () => {
        global.confirm = jest.fn(() => false)
        const mockDelete = deleteTask as jest.MockedFunction<typeof deleteTask>

        render(<DeleteTaskButton taskId="task-1" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        expect(mockDelete).not.toHaveBeenCalled()
    })

    it('deletes task on confirmation', async () => {
        const mockDelete = deleteTask as jest.MockedFunction<typeof deleteTask>
        mockDelete.mockResolvedValue({ success: true, message: 'Deleted' })

        render(<DeleteTaskButton taskId="task-1" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('task-1', undefined)
            expect(toast.success).toHaveBeenCalledWith('Task deleted!', 'Deleted')
        })
    })

    it('passes redirectTo parameter', async () => {
        const mockDelete = deleteTask as jest.MockedFunction<typeof deleteTask>
        mockDelete.mockResolvedValue({ success: true, message: 'Deleted' })

        render(<DeleteTaskButton taskId="task-1" redirectTo="/projects" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('task-1', '/projects')
        })
    })

    it('shows error on failure', async () => {
        const mockDelete = deleteTask as jest.MockedFunction<typeof deleteTask>
        mockDelete.mockResolvedValue({ success: false, message: 'Failed' })

        render(<DeleteTaskButton taskId="task-1" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to delete task', 'Failed')
        })
    })

    it('disables button while deleting', async () => {
        const mockDelete = deleteTask as jest.MockedFunction<typeof deleteTask>
        mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Deleted' }), 100)))

        render(<DeleteTaskButton taskId="task-1" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        await waitFor(() => {
            expect(button).toBeDisabled()
        })
    })

    it('shows "Deleting..." text while pending', async () => {
        const mockDelete = deleteTask as jest.MockedFunction<typeof deleteTask>
        mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Deleted' }), 100)))

        render(<DeleteTaskButton taskId="task-1" />)

        const button = screen.getByText('Delete Task')
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('Deleting...')).toBeInTheDocument()
        })
    })
})