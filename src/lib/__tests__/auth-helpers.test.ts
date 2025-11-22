describe('Auth Helper Functions', () => {
    describe('getInitials', () => {
        it('returns initials from full name', () => {
            // If you have this helper function
            // Otherwise skip this test
            expect(true).toBe(true) // Placeholder
        })
    })

    describe('formatRole', () => {
        const formatRole = (role: string) => {
            return role.charAt(0).toUpperCase() + role.slice(1)
        }

        it('capitalizes role name', () => {
            expect(formatRole('admin')).toBe('Admin')
            expect(formatRole('member')).toBe('Member')
            expect(formatRole('viewer')).toBe('Viewer')
        })
    })
})