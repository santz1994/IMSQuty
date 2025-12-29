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
import { deleteTicket, fetchTickets } from '../../store/slices/ticketSlice'

const TicketList: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { tickets, loading, error, pagination } = useAppSelector((state) => state.ticket)
  const { priorities } = useAppSelector((state) => state.ticketPriority)
  const { statuses } = useAppSelector((state) => state.ticketStatus)
  const [searchValue, setSearchValue] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch tickets when page or pageSize changes
  useEffect(() => {
    dispatch(fetchTickets({ page, perPage: pageSize }))
  }, [dispatch, page, pageSize])

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      dispatch(deleteTicket(id))
    }
  }

  const handleClearFilters = () => {
    setSearchValue('')
    setFilterPriority('')
    setPage(1)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Tickets</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tickets/create')}
        >
          New Ticket
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filterValue={filterPriority}
        onFilterChange={setFilterPriority}
        filterLabel="Priority"
        filterOptions={priorities.map((p) => ({
          label: p.label,
          value: p.name,
        }))}
        onClear={handleClearFilters}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Ticket Number</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell>{ticket.ticket_number}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{ticket.priority}</TableCell>
                      <TableCell>{ticket.ticket_status_id}</TableCell>
                      <TableCell>{ticket.created_by}</TableCell>
                      <TableCell>{ticket.assigned_to || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          title="View details"
                        >
                          <Info fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          title="Edit ticket"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(ticket.id)}
                          title="Delete ticket"
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

          {/* Pagination Controls */}
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizes={[5, 10, 25, 50]}
          />
        </>
      )}
    </Box>
  )
}

export default TicketList
