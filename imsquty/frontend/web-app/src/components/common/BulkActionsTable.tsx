import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

interface BulkActionItem {
  id: string | number
  [key: string]: any
}

interface BulkActionsTableProps {
  title: string
  columns: { key: string; label: string }[]
  data: BulkActionItem[]
  onEdit?: (item: BulkActionItem) => void
  onDelete?: (ids: (string | number)[]) => void
  onBulkDelete?: (ids: (string | number)[]) => void
  onExport?: (ids: (string | number)[]) => void
}

const BulkActionsTable: React.FC<BulkActionsTableProps> = ({
  title,
  columns,
  data,
  onEdit,
  onDelete,
  onBulkDelete,
  onExport,
}) => {
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentRow, setCurrentRow] = useState<BulkActionItem | null>(null)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(new Set(data.map((item) => item.id)))
    } else {
      setSelected(new Set())
    }
  }

  const handleSelect = (id: string | number) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: BulkActionItem) => {
    setAnchorEl(event.currentTarget)
    setCurrentRow(row)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setCurrentRow(null)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selected.size > 0) {
      onBulkDelete(Array.from(selected))
      setSelected(new Set())
    }
  }

  const handleExport = () => {
    if (onExport) {
      const idsToExport = selected.size > 0 ? Array.from(selected) : data.map((item) => item.id)
      onExport(idsToExport)
    }
  }

  const exportToCSV = () => {
    const selectedItems = selected.size > 0
      ? data.filter((item) => selected.has(item.id))
      : data

    const headers = columns.map((col) => col.label)
    const rows = selectedItems.map((item) =>
      columns.map((col) => item[col.key] || '')
    )

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Paper>
      {selected.size > 0 && (
        <Toolbar sx={{ backgroundColor: 'action.hover', py: 1 }}>
          <Typography sx={{ flex: 1 }} color="inherit" variant="subtitle1">
            {selected.size} selected
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Export">
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={exportToCSV}
              >
                Export CSV
              </Button>
            </Tooltip>
            <Tooltip title="Delete selected">
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </Tooltip>
          </Stack>
        </Toolbar>
      )}

      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.size > 0 && selected.size < data.length
                  }
                  checked={selected.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                hover
                selected={selected.has(row.id)}
                sx={{
                  backgroundColor: selected.has(row.id)
                    ? 'action.selected'
                    : 'inherit',
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.has(row.id)}
                    onChange={() => handleSelect(row.id)}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key}>{row[col.key]}</TableCell>
                ))}
                <TableCell align="right">
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, row)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onEdit && (
          <MenuItem
            onClick={() => {
              if (currentRow) onEdit(currentRow)
              handleMenuClose()
            }}
          >
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => {
              if (currentRow) onDelete([currentRow.id])
              handleMenuClose()
            }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" color="error" />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Paper>
  )
}

export default BulkActionsTable
