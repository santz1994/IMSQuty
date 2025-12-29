/**
 * Admin Pages Tests
 * Tests SystemSettings, AuditLogs, RolesPermissions
 */
describe('Admin Pages', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/')
    cy.get('input[type="email"]').type('admin@imsquty.test')
    cy.get('input[type="password"]').type('password123')
    cy.contains('Sign in').click()
    cy.url().should('include', '/dashboard')
  })

  describe('System Settings', () => {
    it('should display system settings page', () => {
      cy.contains('Admin').click()
      cy.contains('System Settings').click()
      cy.url().should('include', '/admin/settings')

      cy.contains('General Settings').should('be.visible')
      cy.contains('Security Settings').should('be.visible')
    })

    it('should load current settings', () => {
      cy.contains('Admin').click()
      cy.contains('System Settings').click()

      cy.get('input[name="app_name"]').should('have.value')
      cy.get('input[name="app_timezone"]').should('have.value')
    })

    it('should update settings', () => {
      cy.contains('Admin').click()
      cy.contains('System Settings').click()

      cy.get('input[name="app_name"]').clear().type('Updated App Name')
      cy.contains('Save').click()

      cy.contains(/success|saved/i).should('be.visible')
    })

    it('should show conditional fields', () => {
      cy.contains('Admin').click()
      cy.contains('System Settings').click()

      cy.get('input[name="enable_api_throttling"]').click()
      cy.get('input[name="api_throttle_rate"]').should('be.visible')
    })
  })

  describe('Audit Logs', () => {
    it('should display audit logs page', () => {
      cy.contains('Admin').click()
      cy.contains('Audit Logs').click()
      cy.url().should('include', '/admin/audit-logs')

      cy.contains('Audit Logs').should('be.visible')
      cy.get('table').should('be.visible')
    })

    it('should display log columns', () => {
      cy.contains('Admin').click()
      cy.contains('Audit Logs').click()

      cy.contains(/user|action|entity|timestamp/i).should('be.visible')
    })

    it('should filter logs by date range', () => {
      cy.contains('Admin').click()
      cy.contains('Audit Logs').click()

      cy.get('input[name="start_date"]').type('2025-01-01')
      cy.get('input[name="end_date"]').type('2025-01-31')
      cy.contains('Filter').click()

      cy.get('table tbody tr').should('have.length.greaterThan', 0)
    })

    it('should export logs', () => {
      cy.contains('Admin').click()
      cy.contains('Audit Logs').click()

      cy.contains('Export').click()
      cy.readFile('cypress/downloads/audit-logs.csv').should('exist')
    })

    it('should refresh logs', () => {
      cy.contains('Admin').click()
      cy.contains('Audit Logs').click()

      cy.contains('Refresh').click()
      cy.contains(/success|refreshed/i).should('be.visible')
    })
  })

  describe('Roles & Permissions', () => {
    it('should display roles and permissions page', () => {
      cy.contains('Admin').click()
      cy.contains('Roles & Permissions').click()
      cy.url().should('include', '/admin/roles')

      cy.contains('Roles').should('be.visible')
      cy.contains('Permissions').should('be.visible')
    })

    it('should list roles', () => {
      cy.contains('Admin').click()
      cy.contains('Roles & Permissions').click()

      cy.get('table tbody tr').should('have.length.greaterThan', 0)
      cy.contains(/admin|user|manager/i).should('be.visible')
    })

    it('should create new role', () => {
      cy.contains('Admin').click()
      cy.contains('Roles & Permissions').click()

      cy.contains('Add Role').click()
      cy.get('input[name="name"]').type('Test Role')
      cy.get('textarea[name="description"]').type('Test role description')

      cy.contains('Save').click()
      cy.contains(/success|created/i).should('be.visible')
    })

    it('should assign permissions to role', () => {
      cy.contains('Admin').click()
      cy.contains('Roles & Permissions').click()

      cy.get('table tbody tr').first().within(() => {
        cy.contains('Edit').click()
      })

      cy.get('input[type="checkbox"]').eq(0).check()
      cy.contains('Save').click()

      cy.contains(/success|updated/i).should('be.visible')
    })

    it('should delete role', () => {
      cy.contains('Admin').click()
      cy.contains('Roles & Permissions').click()

      cy.get('table tbody tr').last().within(() => {
        cy.contains('Delete').click()
      })

      cy.contains(/confirm|sure/i).should('be.visible')
      cy.contains(/yes|confirm/i).click()

      cy.contains(/success|deleted/i).should('be.visible')
    })
  })
})
