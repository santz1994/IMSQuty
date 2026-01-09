import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { CreateRoleRequest, Role } from '../api/roleService'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  assignPermissions,
  clearError,
  clearSelectedRole,
  createRole,
  deleteRole,
  fetchPermissions,
  fetchPermissionsByModule,
  fetchRoleById,
  fetchRoles,
  updateRole,
} from '../store/slices/roleSlice'

interface RoleFormData {
  name: string
  display_name: string
  description: string
  permission_ids: number[]
}

const RolesPermissions: React.FC = () => {
  const dispatch = useAppDispatch()
  const { roles, permissions, permissionsByModule, selectedRole, loading, error } =
    useAppSelector((state) => state.roles)

  const [openDialog, setOpenDialog] = useState(false)
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    display_name: '',
    description: '',
    permission_ids: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Load data on mount
  useEffect(() => {
    dispatch(fetchRoles())
    dispatch(fetchPermissions())
    dispatch(fetchPermissionsByModule())
  }, [dispatch])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handle create/edit dialog
  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        display_name: role.display_name,
        description: role.description || '',
        permission_ids: role.permissions?.map((p) => p.id) || [],
      })
      // Fetch role details with permissions
      dispatch(fetchRoleById(role.id))
    } else {
      setEditingRole(null)
      setFormData({
        name: '',
        display_name: '',
        description: '',
        permission_ids: [],
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingRole(null)
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permission_ids: [],
    })
    dispatch(clearError())
  }

  const handleSubmit = async () => {
    const data: CreateRoleRequest = {
      name: formData.name,
      display_name: formData.display_name,
      description: formData.description,
      permission_ids: formData.permission_ids,
    }

    try {
      if (editingRole) {
        await dispatch(updateRole({ id: editingRole.id, data })).unwrap()
        setSuccessMessage('Role updated successfully')
      } else {
        await dispatch(createRole(data)).unwrap()
        setSuccessMessage('Role created successfully')
      }
      handleCloseDialog()
      dispatch(fetchRoles())
    } catch (err) {
      // Error handled by Redux
    }
  }

  const handleDelete = async () => {
    if (deletingRole) {
      try {
        await dispatch(deleteRole(deletingRole.id)).unwrap()
        setSuccessMessage('Role deleted successfully')
        setOpenDeleteDialog(false)
        setDeletingRole(null)
      } catch (err) {
        // Error handled by Redux
      }
    }
  }

  const handleOpenPermissionDialog = (role: Role) => {
    setEditingRole(role)
    dispatch(fetchRoleById(role.id))
    setOpenPermissionDialog(true)
  }

  const handleClosePermissionDialog = () => {
    setOpenPermissionDialog(false)
    setEditingRole(null)
    dispatch(clearSelectedRole())
  }

  const handleTogglePermission = (permissionId: number) => {
    setFormData((prev) => {
      const newIds = prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter((id) => id !== permissionId)
        : [...prev.permission_ids, permissionId]
      return { ...prev, permission_ids: newIds }
    })
  }

  const handleSavePermissions = async () => {
    if (editingRole) {
      try {
        await dispatch(
          assignPermissions({
            roleId: editingRole.id,
            permissionIds: selectedRole?.permissions?.map((p) => p.id) || [],
          })
        ).unwrap()
        setSuccessMessage('Permissions updated successfully')
        handleClosePermissionDialog()
        dispatch(fetchRoles())
      } catch (err) {
        // Error handled by Redux
      }
    }
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon /> Roles & Permissions Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Create Role
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
      </Paper>

      {/* Roles Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Display Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell><strong>Users</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !roles.length ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.display_name}</TableCell>
                  <TableCell>
                    {role.description || <em style={{ color: '#999' }}>No description</em>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${role.permissions?.length || 0} permissions`}
                      size="small"
                      color="primary"
                      onClick={() => handleOpenPermissionDialog(role)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<PeopleIcon />}
                      label={role.users_count || 0}
                      size="small"
                      color="default"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(role)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Permissions">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenPermissionDialog(role)}
                      >
                        <SecurityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeletingRole(role)
                          setOpenDeleteDialog(true)
                        }}
                        disabled={role.name === 'superadmin'} // Prevent deleting superadmin
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name (System)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                }
                required
                helperText="Lowercase, underscores only (e.g., admin_manager)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
                helperText="Human-readable name (e.g., Admin Manager)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                helperText="Brief description of role responsibilities"
              />
            </Grid>

            {/* Permission Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Select Permissions
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                {Object.entries(permissionsByModule).map(([module, perms]) => (
                  <Accordion key={module}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        {module.toUpperCase()} ({perms.length} permissions)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {perms.map((permission) => (
                          <Grid item xs={12} sm={6} key={permission.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.permission_ids.includes(permission.id)}
                                  onChange={() => handleTogglePermission(permission.id)}
                                  size="small"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2">{permission.display_name}</Typography>
                                  {permission.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {permission.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Selected: {formData.permission_ids.length} / {permissions.length} permissions
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              !formData.name ||
              !formData.display_name ||
              formData.permission_ids.length === 0
            }
          >
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Matrix Dialog */}
      <Dialog
        open={openPermissionDialog}
        onClose={handleClosePermissionDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Permission Matrix - {selectedRole?.display_name || editingRole?.display_name}
        </DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box sx={{ mt: 2 }}>
              {Object.entries(permissionsByModule).map(([module, perms]) => (
                <Accordion key={module} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      {module.toUpperCase()} Module
                      <Chip
                        label={`${perms.filter((p) =>
                          selectedRole.permissions?.some((sp) => sp.id === p.id)
                        ).length} / ${perms.length}`}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {perms.map((permission) => {
                        const hasPermission = selectedRole.permissions?.some(
                          (p) => p.id === permission.id
                        )
                        return (
                          <Grid item xs={12} sm={6} md={4} key={permission.id}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                bgcolor: hasPermission ? 'success.light' : 'grey.100',
                                borderColor: hasPermission ? 'success.main' : 'grey.300',
                              }}
                            >
                              <Typography variant="body2" fontWeight="bold">
                                {permission.display_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {permission.name}
                              </Typography>
                              {permission.description && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                  {permission.description}
                                </Typography>
                              )}
                              <Chip
                                label={hasPermission ? 'Granted' : 'Not Granted'}
                                size="small"
                                color={hasPermission ? 'success' : 'default'}
                                sx={{ mt: 1 }}
                              />
                            </Paper>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete role <strong>{deletingRole?.display_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. Users with this role will lose access.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RolesPermissions
