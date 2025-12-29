import React from 'react'
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material'
import { Search, Clear } from '@mui/icons-material'

interface SearchFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterLabel?: string
  filterOptions?: Array<{ label: string; value: string }>
  onClear?: () => void
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterLabel = 'Filter',
  filterOptions = [],
  onClear,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <TextField
        label="Search"
        placeholder="Search..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ minWidth: 200 }}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
        }}
      />
      
      {filterOptions.length > 0 && onFilterChange && (
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{filterLabel}</InputLabel>
          <Select
            size="small"
            value={filterValue || ''}
            label={filterLabel}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {onClear && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Clear />}
          onClick={onClear}
        >
          Clear
        </Button>
      )}
    </Box>
  )
}

export default SearchFilter
