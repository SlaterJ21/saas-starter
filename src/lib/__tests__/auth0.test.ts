import { auth0 } from '../auth0'

describe('Auth0 Client', () => {
    it('exports auth0 client', () => {
        expect(auth0).toBeDefined()
    })

    it('has required methods', () => {
        expect(typeof auth0.getSession).toBe('function')
        expect(typeof auth0.middleware).toBe('function')
    })
})