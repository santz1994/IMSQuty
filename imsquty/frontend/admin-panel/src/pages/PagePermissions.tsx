import { Cancel, CheckCircle, Save, Security } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import client from '../api/client'

interface Page {
  id: number
  path: string
  name: string
  module: string
  icon: string
  can_access?: boolean | null
  permission_id?: number | null
}

interface Role {
  id: number
  name: string
  display_name: string
}

const PagePermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pagesByModule, setPagesByModule] = useState<Record<string, Page[]>>({})
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())

  // Load roles on mount
  useEffect(() => {
    loadRoles()
  }, [])

  // Load pages when role is selected
  useEffect(() => {
    if (selectedRoleId) {
      loadRolePages(selectedRoleId)
    }
  }, [selectedRoleId])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await client.get('/roles')
      if (response.data.success) {
        setRoles(response.data.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const loadRolePages = async (roleId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await client.get(`/page-permissions/roles/${roleId}/pages`)

      if (response.data.success) {
        const pagesData = response.data.data.pages as Page[]
        setPages(pagesData)

        // Group by module
        const grouped = pagesData.reduce((acc, page) => {
          if (!acc[page.module]) {
            acc[page.module] = []
          }
          acc[page.module].push(page)
          return acc
        }, {} as Record<string, Page[]>)
        setPagesByModule(grouped)

        // Set initially selected pages
        const selected = new Set(
          pagesData
            .filter(p => p.can_access === true)
            .map(p => p.id)
        )
        setSelectedPages(selected)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load role pages')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePage = (pageId: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageId)) {
        newSet.delete(pageId)
      } else {
        newSet.add(pageId)
      }
      return newSet
    })
  }

  const handleToggleModule = (module: string, checked: boolean) => {
    const modulePagesIds = pagesByModule[module].map(p => p.id)
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      modulePagesIds.forEach(id => {
        if (checked) {
          newSet.add(id)
        } else {
          newSet.delete(id)
        }
      })
      return newSet
    })
  }

  const handleSave = async () => {
    if (!selectedRoleId) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await client.post(
        `/page-permissions/roles/${selectedRoleId}/pages/sync`,
        {
          page_ids: Array.from(selectedPages),
        }
      )

      if (response.data.success) {
        setSuccess(`✅ Page permissions saved successfully for role!`)
        // Reload to reflect changes
        setTimeout(() => {
          loadRolePages(selectedRoleId)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save page permissions')
    } finally {
      setSaving(false)
    }
  }

  const isModuleFullySelected = (module: string): boolean => {
    const modulePages = pagesByModule[module] || []
    return modulePages.every(page => selectedPages.has(page.id))
  }

  const isModulePartiallySelected = (module: string): boolean => {
    const modulePages = pagesByModule[module] || []
    const selectedCount = modulePages.filter(page => selectedPages.has(page.id)).length
    return selectedCount > 0 && selectedCount < modulePages.length
  }

  if (loading && roles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Security fontSize="large" color="primary" />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Page Permissions Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Control which pages each role can access
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Role Selector */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
            Select Role
          </Typography>
          <Select
            fullWidth
            value={selectedRoleId || ''}
            onChange={(e) => setSelectedRoleId(Number(e.target.value))}
            displayEmpty
          >
            <MenuItem value="">
              <em>-- Select a role --</em>
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.display_name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {selectedRoleId && (
          <>
            <Divider sx={{ my: 3 }} />

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Managing Pages for: {roles.find(r => r.id === selectedRoleId)?.display_name || 'Unknown Role'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedPages.size} / {pages.length} pages
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {Object.entries(pagesByModule).map(([module, modulePages]) => {
                    const isFullySelected = isModuleFullySelected(module)
                    const isPartiallySelected = isModulePartiallySelected(module)

                    return (
                      <Grid item xs={12} md={6} key={module}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box mb={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isFullySelected}
                                    indeterminate={isPartiallySelected}
                                    onChange={(e) =>
                                      handleToggleModule(module, e.target.checked)
                                    }
                                  />
                                }
                                label={
                                  <Typography variant="h6" fontWeight="bold">
                                    {module}
                                  </Typography>
                                }
                              />
                              <Chip
                                label={`${modulePages.filter(p => selectedPages.has(p.id)).length}/${modulePages.length}`}
                                size="small"
                                color={isFullySelected ? 'success' : 'default'}
                              />
                            </Box>

                            <List dense>
                              {modulePages.map((page) => (
                                <ListItem
                                  key={page.id}
                                  disablePadding
                                  sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&:hover': { bgcolor: 'action.hover' },
                                  }}
                                >
                                  <FormControlLabel
                                    sx={{ width: '100%', px: 1 }}
                                    control={
                                      <Checkbox
                                        checked={selectedPages.has(page.id)}
                                        onChange={() => handleTogglePage(page.id)}
                                        icon={<Cancel color="error" />}
                                        checkedIcon={<CheckCircle color="success" />}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography variant="body2">
                                          {page.name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {page.path}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </>
            )}
          </>
        )}
      </Paper>
    </Box>
  )
}

export default PagePermissionsManager
