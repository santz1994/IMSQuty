/**
 * Asset Management Tests
 * Tests Asset CRUD with form validation
 */
describe('Asset Management', () => {
  beforeEach(() => {
    // Login
    cy.visit('/')
    cy.get('input[type="email"]').type('admin@imsquty.test')
    cy.get('input[type="password"]').type('password123')
    cy.contains('Sign in').click()
    cy.url().should('include', '/dashboard')
  })

  describe('Asset List', () => {
    it('should display asset list with pagination', () => {
      cy.contains('Assets').click()
      cy.url().should('include', '/assets')
      cy.contains('Asset List').should('be.visible')
      cy.get('[data-testid="pagination-component"]').should('exist')
    })

    it('should change pages', () => {
      cy.contains('Assets').click()
      cy.get('[data-testid="page-size-select"]').select('5')
      cy.get('.MuiPagination-ul button').eq(2).click() // next page
      cy.contains(/page.*2|showing.*6.*10/i).should('be.visible')
    })

    it('should search assets', () => {
      cy.contains('Assets').click()
      cy.get('input[placeholder*="search" i]').type('ASSET-001')
      cy.contains('ASSET-001').should('be.visible')
    })
  })

  describe('Asset Create with Validation', () => {
    it('should show validation errors on empty submit', () => {
      cy.contains('Assets').click()
      cy.contains('Add Asset').click()
      cy.url().should('include', '/assets/create')
      cy.contains('Create Asset').should('be.visible')

      cy.contains('Save').click()
      cy.contains(/required/i).should('be.visible')
    })

    it('should create asset with valid data', () => {
      cy.contains('Assets').click()
      cy.contains('Add Asset').click()

      // Fill form
      cy.get('input[name="asset_tag"]').type('TEST-ASSET-001')
      cy.get('input[name="name"]').type('Test Server')
      cy.get('input[name="serial_number"]').type('SN-12345-67890')
      cy.get('select[name="asset_type_id"]').select('1')
      cy.get('select[name="division_id"]').select('1')
      cy.get('select[name="location_id"]').select('1')

      // Submit
      cy.contains('Save').click()
      cy.contains(/success|created/i).should('be.visible')
      cy.url().should('include', '/assets')
    })

    it('should validate required fields', () => {
      cy.contains('Assets').click()
      cy.contains('Add Asset').click()

      cy.get('input[name="asset_tag"]').type('TEST')
      cy.get('input[name="name"]').clear()
      cy.contains('Save').click()

      cy.contains(/name.*required/i).should('be.visible')
    })

    it('should validate field lengths', () => {
      cy.contains('Assets').click()
      cy.contains('Add Asset').click()

      cy.get('input[name="asset_tag"]').type('AB') // too short
      cy.contains('Save').click()

      cy.contains(/at least.*3|minimum.*characters/i).should('be.visible')
    })
  })

  describe('Asset Detail Edit', () => {
    it('should edit asset with validation', () => {
      cy.contains('Assets').click()
      cy.get('tbody tr').first().within(() => {
        cy.contains('Edit').click()
      })
      cy.url().should('include', '/assets/')

      // Update field
      cy.get('input[name="name"]').clear().type('Updated Asset Name')
      cy.contains('Save').click()

      cy.contains(/success|updated/i).should('be.visible')
    })

    it('should show edit mode controls', () => {
      cy.contains('Assets').click()
      cy.get('tbody tr').first().within(() => {
        cy.contains('Edit').click()
      })

      cy.contains('Save').should('be.visible')
      cy.contains('Cancel').should('be.visible')
    })
  })

  describe('Asset Delete', () => {
    it('should delete asset with confirmation', () => {
      cy.contains('Assets').click()
      cy.get('tbody tr').first().within(() => {
        cy.contains('Delete').click()
      })

      cy.contains(/confirm|sure/i).should('be.visible')
      cy.contains(/yes|confirm/i).click()

      cy.contains(/success|deleted/i).should('be.visible')
    })
  })
})
