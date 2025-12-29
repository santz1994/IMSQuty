/**
 * Ticket Management Tests
 * Tests Ticket CRUD with form validation
 */
describe('Ticket Management', () => {
  beforeEach(() => {
    // Login
    cy.visit('/')
    cy.get('input[type="email"]').type('admin@imsquty.test')
    cy.get('input[type="password"]').type('password123')
    cy.contains('Sign in').click()
    cy.url().should('include', '/dashboard')
  })

  describe('Ticket List', () => {
    it('should display ticket list with pagination', () => {
      cy.contains('Tickets').click()
      cy.url().should('include', '/tickets')
      cy.contains('Ticket List').should('be.visible')
      cy.get('[data-testid="pagination-component"]').should('exist')
    })

    it('should filter by priority', () => {
      cy.contains('Tickets').click()
      cy.get('select[name="priority"]').select('High')
      cy.contains(/high/i).should('be.visible')
    })

    it('should search tickets', () => {
      cy.contains('Tickets').click()
      cy.get('input[placeholder*="search" i]').type('TKT-001')
      cy.contains('TKT-001').should('be.visible')
    })
  })

  describe('Ticket Create with Validation', () => {
    it('should show validation errors on empty submit', () => {
      cy.contains('Tickets').click()
      cy.contains('Add Ticket').click()
      cy.url().should('include', '/tickets/create')

      cy.contains('Create Ticket').should('be.visible')
      cy.contains('Save').click()

      cy.contains(/required/i).should('be.visible')
    })

    it('should create ticket with valid data', () => {
      cy.contains('Tickets').click()
      cy.contains('Add Ticket').click()

      // Fill form
      cy.get('input[name="ticket_number"]').type('TKT-001')
      cy.get('input[name="title"]').type('System Down')
      cy.get('textarea[name="description"]').type('Server is not responding')
      cy.get('select[name="priority_id"]').select('High')
      cy.get('select[name="status_id"]').select('Open')

      cy.contains('Save').click()
      cy.contains(/success|created/i).should('be.visible')
      cy.url().should('include', '/tickets')
    })

    it('should validate minimum field lengths', () => {
      cy.contains('Tickets').click()
      cy.contains('Add Ticket').click()

      cy.get('input[name="title"]').type('X') // too short
      cy.contains('Save').click()

      cy.contains(/at least.*3|minimum.*characters/i).should('be.visible')
    })
  })

  describe('Ticket Detail', () => {
    it('should view ticket details', () => {
      cy.contains('Tickets').click()
      cy.get('tbody tr').first().click()
      cy.url().should('include', '/tickets/')

      cy.contains(/ticket number|priority|status/i).should('be.visible')
    })

    it('should edit ticket', () => {
      cy.contains('Tickets').click()
      cy.get('tbody tr').first().click()

      cy.contains('Edit').click()
      cy.get('input[name="title"]').clear().type('Updated Title')
      cy.contains('Save').click()

      cy.contains(/success|updated/i).should('be.visible')
    })

    it('should toggle view/edit mode', () => {
      cy.contains('Tickets').click()
      cy.get('tbody tr').first().click()

      cy.contains('Edit').click()
      cy.contains('Save').should('be.visible')

      cy.contains('Cancel').click()
      cy.contains('Edit').should('be.visible')
    })
  })

  describe('Ticket Delete', () => {
    it('should delete ticket', () => {
      cy.contains('Tickets').click()
      cy.get('tbody tr').first().within(() => {
        cy.contains('Delete').click()
      })

      cy.contains(/confirm|sure/i).should('be.visible')
      cy.contains(/yes|confirm/i).click()

      cy.contains(/success|deleted/i).should('be.visible')
    })
  })
})
