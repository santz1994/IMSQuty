import { Add, Delete, Edit, Info, Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
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
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchRoles } from '../store/slices/roleSlice'
import {
  clearCurrentUser,
  createUser,
  deleteUser,
  fetchUser,
  fetchUsers,
  updateUser,
} from '../store/slices/userSlice'

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch()
  const { users, loading, error, currentUser, pagination } = useAppSelector(
    (state) => state.user,
  )
  const { roles } = useAppSelector((state) => state.roles)

  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view')
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirmation: '',
    role_id: 1,
    department: '',
    team: '',
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    dispatch(fetchRoles())
    loadUsers()
  }, [dispatch, currentPage, roleFilter, statusFilter, searchQuery])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const loadUsers = () => {
    const params: any = { page: currentPage, perPage: 20 }
    if (searchQuery) params.search = searchQuery
    if (roleFilter !== 'all') params.role_id = roleFilter
    if (statusFilter !== 'all') params.is_active = statusFilter === 'active'
    dispatch(fetchUsers(params))
  }

  const handleViewUser = (id: number) => {
    dispatch(fetchUser(id))
    setDialogMode('view')
    setOpenDialog(true)
  }

  const handleEditUser = (id: number) => {
    dispatch(fetchUser(id))
    setDialogMode('edit')
    setOpenDialog(true)
  }

  const handleCreateUser = () => {
    setFormData({
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirmation: '',
      role_id: 1,
      department: '',
      team: '',
      is_active: true,
    })
    setFormErrors({})
    setDialogMode('create')
    setOpenDialog(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingUserId(id)
    setOpenDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingUserId) {
      try {
        await dispatch(deleteUser(deletingUserId)).unwrap()
        setSuccessMessage('User deleted successfully')
        setOpenDeleteDialog(false)
        setDeletingUserId(null)
        loadUsers()
      } catch (err: any) {
        // Error handled by Redux
      }
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormErrors({})
    dispatch(clearCurrentUser())
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format'

    if (!formData.username) errors.username = 'Username is required'
    else if (formData.username.length < 3) errors.username = 'Username must be at least 3 characters'

    if (!formData.first_name) errors.first_name = 'First name is required'
    if (!formData.last_name) errors.last_name = 'Last name is required'

    if (dialogMode === 'create') {
      if (!formData.password) errors.password = 'Password is required'
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'

      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match'
      }
    }

    if (dialogMode === 'edit' && formData.password) {
      if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const userData = {
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_id: formData.role_id,
        department: formData.department || undefined,
        team: formData.team || undefined,
        is_active: formData.is_active,
        ...(formData.password && {
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      }

      if (dialogMode === 'create') {
        await dispatch(createUser(userData)).unwrap()
        setSuccessMessage('User created successfully')
      } else if (dialogMode === 'edit' && currentUser) {
        await dispatch(updateUser({ id: currentUser.id, data: userData })).unwrap()
        setSuccessMessage('User updated successfully')
      }

      handleCloseDialog()
      loadUsers()
    } catch (err: any) {
      // Error handled by Redux
    }
  }

  useEffect(() => {
    if (currentUser && (dialogMode === 'view' || dialogMode === 'edit')) {
      setFormData({
        email: currentUser.email,
        username: currentUser.username || '',
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        password: '',
        password_confirmation: '',
        role_id: currentUser.roles?.[0]?.id || 0,
        department: currentUser.department || '',
        team: currentUser.team || '',
        is_active: currentUser.status === 'active',
      })
    }
  }, [currentUser, dialogMode])

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.display_name : `Role ${roleId}`
  }

  const filteredUsers = users

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateUser}
          disabled={loading}
        >
          Add User
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => {
                setRoleFilter(e.target.value as number | 'all')
                setCurrentPage(1)
              }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
                setCurrentPage(1)
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username || '-'}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.roles?.[0]?.display_name || user.roles?.[0]?.name || 'No Role'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        {user.status === 'active' ? (
                          <Chip label="Active" size="small" color="success" />
                        ) : user.status === 'suspended' ? (
                          <Chip label="Suspended" size="small" color="warning" />
                        ) : (
                          <Chip label="Inactive" size="small" color="error" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(user.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.last_page}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New User' : dialogMode === 'edit' ? 'Edit User' : 'User Details'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={dialogMode === 'view'}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <TextField
                fullWidth
                label="Username *"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                disabled={dialogMode === 'view'}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                disabled={dialogMode === 'view'}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name}
              />
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                disabled={dialogMode === 'view'}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name}
              />
            </Stack>

            {dialogMode !== 'view' && (
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label={dialogMode === 'create' ? 'Password *' : 'New Password (leave blank to keep current)'}
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'Minimum 6 characters'}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, password_confirmation: e.target.value })
                  }
                  error={!!formErrors.password_confirmation}
                  helperText={formErrors.password_confirmation}
                />
              </Stack>
            )}

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Role *</InputLabel>
                <Select
                  value={formData.role_id}
                  label="Role *"
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value as number })
                  }
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {dialogMode !== 'view' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                    />
                  }
                  label="Active"
                />
              )}
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Department (Optional)"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                disabled={dialogMode === 'view'}
              />
              <TextField
                fullWidth
                label="Team (Optional)"
                value={formData.team}
                onChange={(e) =>
                  setFormData({ ...formData, team: e.target.value })
                }
                disabled={dialogMode === 'view'}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {(dialogMode === 'edit' || dialogMode === 'create') && (
            <Button onClick={handleSave} variant="contained" disabled={loading}>
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement
