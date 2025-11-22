import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCard } from '../TaskCard'
import { updateTaskStatus } from '@/app/actions/task'
import { toast } from '@/lib/toast'

// Mock the actions and toast
jest.mock('@/app/actions/task', () => ({
    updateTaskStatus: jest.fn(),
}))

jest.mock('@/lib/toast', () => ({
    toast: {
        error: jest.fn(),
    },
}))

const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo' as const,
    project_name: 'Test Project',
    assigned_to_name: 'John Doe',
}

describe('TaskCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders task information', () => {
        render(<TaskCard task={mockTask} />)

        expect(screen.getByText('Test Task')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Test Project')).toBeInTheDocument()
        expect(screen.getByText('→ John Doe')).toBeInTheDocument()
    })

    it('renders without description', () => {
        const taskWithoutDesc = { ...mockTask, description: undefined }
        render(<TaskCard task={taskWithoutDesc} />)

        expect(screen.getByText('Test Task')).toBeInTheDocument()
        expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
    })

    it('renders without assigned user', () => {
        const taskWithoutAssignee = { ...mockTask, assigned_to_name: undefined }
        render(<TaskCard task={taskWithoutAssignee} />)

        expect(screen.getByText('Test Task')).toBeInTheDocument()
        expect(screen.queryByText(/→/)).not.toBeInTheDocument()
    })

    it('applies correct status color classes', () => {
        const { container } = render(<TaskCard task={mockTask} />)

        const card = container.firstChild
        expect(card).toHaveClass('bg-gray-100', 'border-gray-300')
    })

    it('changes status when select is changed', async () => {
        const mockUpdate = updateTaskStatus as jest.MockedFunction<typeof updateTaskStatus>
        mockUpdate.mockResolvedValue({ success: true, message: 'Updated' })

        render(<TaskCard task={mockTask} />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'in_progress' } })

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith('task-1', 'in_progress')
        })
    })

    it('shows error toast on update failure', async () => {
        const mockUpdate = updateTaskStatus as jest.MockedFunction<typeof updateTaskStatus>
        mockUpdate.mockResolvedValue({ success: false, message: 'Failed' })

        render(<TaskCard task={mockTask} />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'done' } })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to update task', 'Failed')
        })
    })

    it('disables select while updating', async () => {
        const mockUpdate = updateTaskStatus as jest.MockedFunction<typeof updateTaskStatus>
        mockUpdate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Updated' }), 100)))

        render(<TaskCard task={mockTask} />)

        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: 'done' } })

        // Should be disabled during transition
        expect(select).toBeDisabled()

        await waitFor(() => {
            expect(select).not.toBeDisabled()
        })
    })
})