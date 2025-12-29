/**
 * Authentication Tests
 * Tests JWT login/logout flow
 */
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display login form', () => {
    cy.contains('Login').should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.contains('Sign in').should('be.visible')
  })

  it('should login with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@imsquty.test')
    cy.get('input[type="password"]').type('password123')
    cy.contains('Sign in').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should show error on invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@test.com')
    cy.get('input[type="password"]').type('wrongpass')
    cy.contains('Sign in').click()
    cy.contains(/error|invalid|credentials/i).should('be.visible')
  })

  it('should logout successfully', () => {
    // Login first
    cy.get('input[type="email"]').type('admin@imsquty.test')
    cy.get('input[type="password"]').type('password123')
    cy.contains('Sign in').click()
    cy.url().should('include', '/dashboard')

    // Logout
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Logout').click()
    cy.url().should('equal', 'http://localhost:5173/')
  })
})
