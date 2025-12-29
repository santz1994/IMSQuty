import { Add, Delete, Edit, Info } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
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
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
    clearCurrentUser,
    deleteUser,
    fetchUser,
    fetchUsers,
} from '../store/slices/userSlice'

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch()
  const { users, loading, error, currentUser } = useAppSelector(
    (state) => state.user,
  )
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view')
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role_id: 1,
    is_active: true,
  })

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 100 }))
  }, [dispatch])

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
      first_name: '',
      last_name: '',
      role_id: 1,
      is_active: true,
    })
    setDialogMode('create')
    setOpenDialog(true)
  }

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id))
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    dispatch(clearCurrentUser())
  }

  const handleSave = () => {
    // Handle save logic here
    handleCloseDialog()
  }

  useEffect(() => {
    if (currentUser && (dialogMode === 'view' || dialogMode === 'edit')) {
      setFormData({
        email: currentUser.email,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        role_id: currentUser.role_id,
        is_active: currentUser.is_active,
      })
    }
  }, [currentUser, dialogMode])

  return (
    <Box>
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
        >
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.role_id}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Box sx={{ color: '#4caf50' }}>Active</Box>
                      ) : (
                        <Box sx={{ color: '#f44336' }}>Inactive</Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Info fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New User' : 'User Details'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={dialogMode === 'view'}
            />
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              disabled={dialogMode === 'view'}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              disabled={dialogMode === 'view'}
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role_id}
              onChange={(e) =>
                setFormData({ ...formData, role_id: parseInt(e.target.value) })
              }
              disabled={dialogMode === 'view'}
              SelectProps={{ native: true }}
            >
              <option value={1}>Admin</option>
              <option value={2}>Manager</option>
              <option value={3}>User</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {(dialogMode === 'edit' || dialogMode === 'create') && (
            <Button onClick={handleSave} variant="contained">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement
