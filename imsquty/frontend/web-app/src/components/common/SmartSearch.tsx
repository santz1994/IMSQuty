import HistoryIcon from '@mui/icons-material/History'
import SearchIcon from '@mui/icons-material/Search'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'

interface SearchSuggestion {
  label: string
  category: 'asset' | 'ticket' | 'user' | 'recent' | 'trending'
  value: any
  description?: string
}

interface SmartSearchProps {
  onSearch: (query: string, suggestion?: SearchSuggestion) => void
  placeholder?: string
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  onSearch,
  placeholder = 'Search assets, tickets, users...',
}) => {
  const theme = useTheme()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5))
    }
  }, [])

  // Mock trending searches
  const trendingSearches: SearchSuggestion[] = useMemo(
    () => [
      {
        label: 'High Priority Tickets',
        category: 'trending',
        value: { filter: 'priority:high' },
        description: 'All high-priority tickets',
      },
      {
        label: 'Maintenance Assets',
        category: 'trending',
        value: { filter: 'status:maintenance' },
        description: 'Assets under maintenance',
      },
      {
        label: 'Overdue Tasks',
        category: 'trending',
        value: { filter: 'status:overdue' },
        description: 'Tasks that need attention',
      },
    ],
    []
  )

  const handleInputChange = async (value: string) => {
    setInput(value)
    if (!value) {
      setSuggestions([])
      return
    }

    setLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const mockResults: SearchSuggestion[] = [
        // Mock assets
        {
          label: `Asset: ${value}-001`,
          category: 'asset',
          value: { id: '1', type: 'asset' },
          description: 'Desktop Computer',
        },
        {
          label: `Asset: ${value}-002`,
          category: 'asset',
          value: { id: '2', type: 'asset' },
          description: 'Laptop Device',
        },
        // Mock tickets
        {
          label: `Ticket: #${value.toUpperCase()}-100`,
          category: 'ticket',
          value: { id: '100', type: 'ticket' },
          description: 'System Issue Report',
        },
        {
          label: `Ticket: #${value.toUpperCase()}-101`,
          category: 'ticket',
          value: { id: '101', type: 'ticket' },
          description: 'Hardware Request',
        },
        // Mock users
        {
          label: `User: ${value}@company.com`,
          category: 'user',
          value: { email: `${value}@company.com`, type: 'user' },
          description: 'Employee Account',
        },
      ]

      // Add trending suggestions
      const combined = [
        ...mockResults,
        ...trendingSearches.filter((t) =>
          t.label.toLowerCase().includes(value.toLowerCase())
        ),
      ]

      setSuggestions(combined)
      setLoading(false)
    }, 300)
  }

  const handleSearch = (suggestion?: SearchSuggestion) => {
    const searchTerm = suggestion?.label || input
    if (!searchTerm) return

    // Save to recent searches
    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    onSearch(searchTerm, suggestion)
    setInput('')
    setSuggestions([])
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'asset':
        return 'info'
      case 'ticket':
        return 'warning'
      case 'user':
        return 'success'
      case 'trending':
        return 'error'
      case 'recent':
        return 'default'
      default:
        return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trending':
        return <TrendingUpIcon fontSize="small" />
      case 'recent':
        return <HistoryIcon fontSize="small" />
      default:
        return null
    }
  }

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      groupBy={(option) => {
        const categoryMap: Record<string, string> = {
          trending: '📈 Trending',
          asset: '📦 Assets',
          ticket: '🎫 Tickets',
          user: '👤 Users',
          recent: '🕐 Recent',
        }
        return categoryMap[option.category] || 'Other'
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      loading={loading}
      inputValue={input}
      onInputChange={(_, value) => handleInputChange(value)}
      onChange={(_, value) => {
        if (value && typeof value !== 'string') {
          handleSearch(value as SearchSuggestion)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSearch()
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box {...props} component="li" sx={{ py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
            {getCategoryIcon(option.category)}
            <Stack sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {option.label}
              </Typography>
              {option.description && (
                <Typography variant="caption" color="textSecondary">
                  {option.description}
                </Typography>
              )}
            </Stack>
            <Chip
              label={option.category.toUpperCase()}
              size="small"
              variant="outlined"
              color={getCategoryColor(option.category)}
            />
          </Stack>
        </Box>
      )}
      ListboxProps={{
        sx: { maxHeight: 400 },
      }}
      noOptionsText={
        input ? (
          <Stack sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No results found for "{input}"
            </Typography>
          </Stack>
        ) : recentSearches.length > 0 ? (
          <Stack sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, px: 1 }}>
              RECENT SEARCHES
            </Typography>
            {recentSearches.map((search) => (
              <Box
                key={search}
                onClick={() => handleSearch()}
                sx={{
                  p: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
              >
                <Typography variant="body2">{search}</Typography>
              </Box>
            ))}
          </Stack>
        ) : null
      }
    />
  )
}

export default SmartSearch
