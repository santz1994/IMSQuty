import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

interface Permission {
  id: number
  name: string
  description: string
  guard_name: string
  created_at: string
}

interface Role {
  id: number
  name: string
  description: string
  guard_name: string
  permissions: Permission[]
  created_at: string
}

interface RoleFormData {
  name: string
  description: string
  permissions: number[]
}

/**
 * RolesPermissions Page
 * Admin-only page for RBAC (Role-Based Access Control) management
 * Features: Manage roles, assign permissions, view role hierarchy
 */
const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
  })

  // Load roles and permissions on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setErrorMessage('')

      // Load roles
      const rolesResponse = await axios.get('/api/v1/admin/roles')
      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.data || [])
      }

      // Load permissions
      const permissionsResponse = await axios.get('/api/v1/admin/permissions')
      if (permissionsResponse.data.success) {
        setPermissions(permissionsResponse.data.data || [])
      }
    } catch (error: any) {
      setErrorMessage('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(p => p.id),
      })
    } else {
      setEditingRole(null)
      setFormData({
        name: '',
        description: '',
        permissions: [],
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRole(null)
    setFormData({ name: '', description: '', permissions: [] })
  }

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('Role name is required')
      return
    }

    try {
      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (editingRole) {
        // Update existing role
        const response = await axios.put(`/api/v1/admin/roles/${editingRole.id}`, formData)
        if (response.data.success) {
          setSuccessMessage('Role updated successfully')
          await loadData()
        }
      } else {
        // Create new role
        const response = await axios.post('/api/v1/admin/roles', formData)
        if (response.data.success) {
          setSuccessMessage('Role created successfully')
          await loadData()
        }
      }
      handleCloseDialog()
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return
    }

    try {
      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const response = await axios.delete(`/api/v1/admin/roles/${roleId}`)
      if (response.data.success) {
        setSuccessMessage('Role deleted successfully')
        await loadData()
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete role')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Roles & Permissions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={saving}
        >
          New Role
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Roles Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Roles" />
            <Divider />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Role Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Permissions</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                          <Typography color="textSecondary">No roles found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map(role => (
                        <TableRow key={role.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">{role.name}</Typography>
                          </TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {role.permissions.length}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenDialog(role)}
                                disabled={saving}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={saving}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Available Permissions" />
            <Divider />
            <CardContent sx={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Stack spacing={1}>
                {permissions.map(permission => (
                  <Typography key={permission.id} variant="body2">
                    • {permission.name}
                  </Typography>
                ))}
                {permissions.length === 0 && (
                  <Typography color="textSecondary">No permissions available</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit/Create Role Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              disabled={saving}
              placeholder="e.g., Asset Manager, Ticket Operator"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              disabled={saving}
              placeholder="Brief description of this role"
            />
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Assign Permissions
            </Typography>
            <Paper sx={{ p: 2, maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd' }}>
              <Stack spacing={1}>
                {permissions.map(permission => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Checkbox
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        disabled={saving}
                      />
                    }
                    label={
                      <Stack>
                        <Typography variant="body2">{permission.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {permission.description}
                        </Typography>
                      </Stack>
                    }
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveRole}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RolesPermissions
