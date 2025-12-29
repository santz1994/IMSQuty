import { Add, Delete, Edit, Info } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaginationControls } from '../../components/PaginationControls'
import SearchFilter from '../../components/SearchFilter'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { deleteAsset, fetchAssets } from '../../store/slices/assetSlice'

const AssetList: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { assets, loading, error, pagination } = useAppSelector((state) => state.asset)
  const [searchValue, setSearchValue] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch assets when page or pageSize changes
  useEffect(() => {
    dispatch(fetchAssets({ page, perPage: pageSize }))
  }, [dispatch, page, pageSize])

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      dispatch(deleteAsset(id))
    }
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setFilterStatus('')
    setPage(1)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Assets</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/assets/create')}
        >
          New Asset
        </Button>
      </Box>

      <SearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterLabel="Status"
        filterOptions={[
          { label: 'Active', value: '1' },
          { label: 'Inactive', value: '2' },
          { label: 'Maintenance', value: '3' },
        ]}
        onClear={handleClearFilters}
      />

      {assets.length === 0 && (
        <Alert severity="info">No assets found</Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Asset Tag</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Alert severity="info" sx={{ border: 'none' }}>
                    No assets found
                  </Alert>
                </TableCell>
              </TableRow>
            )}
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.asset_tag}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.serial_number}</TableCell>
                <TableCell>{asset.asset_type_id}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <Info fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(asset.id)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={pagination.total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizes={[5, 10, 25, 50]}
      />
    </Box>
  )
}

export default AssetList
