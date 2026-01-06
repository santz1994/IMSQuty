import { Search, TrendingUp } from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'

interface SearchSuggestion {
  id: string | number
  label: string
  category: 'asset' | 'ticket' | 'user' | 'recent'
  icon?: React.ReactNode
  meta?: string
}

interface AISearchBarProps {
  onSearch?: (query: string, suggestion?: SearchSuggestion) => void
  placeholder?: string
}

const AISearchBar: React.FC<AISearchBarProps> = ({
  onSearch,
  placeholder = 'Search assets, tickets, users... (powered by AI)',
}) => {
  const theme = useTheme()
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const assetState = useAppSelector((state) => state.asset)
  const ticketState = useAppSelector((state) => state.ticket)
  const assets = (assetState as any)?.items || (assetState as any)?.data || []
  const tickets = (ticketState as any)?.items || (ticketState as any)?.data || []
  const users = [] // Users not currently in state, can be added later

  // AI-powered suggestion algorithm
  const generateSuggestions = useCallback(
    (query: string): SearchSuggestion[] => {
      if (!query.trim()) {
        return recentSearches
          .slice(0, 3)
          .map((s) => ({
            id: s,
            label: s,
            category: 'recent' as const,
            meta: 'Recently searched',
          }))
      }

      const queryLower = query.toLowerCase()
      const suggestions: SearchSuggestion[] = []

      // Search assets with smart matching
      const matchedAssets = (assets || []).filter(
        (asset: any) =>
          asset.name?.toLowerCase().includes(queryLower) ||
          asset.asset_tag?.toLowerCase().includes(queryLower) ||
          asset.serial_number?.toLowerCase().includes(queryLower),
      )
      suggestions.push(
        ...matchedAssets.slice(0, 3).map((asset: any) => ({
          id: asset.id,
          label: asset.name,
          category: 'asset' as const,
          meta: `Tag: ${asset.asset_tag}`,
        })),
      )

      // Search tickets with smart matching
      const matchedTickets = (tickets || []).filter(
        (ticket: any) =>
          ticket.title?.toLowerCase().includes(queryLower) ||
          ticket.ticket_number?.toLowerCase().includes(queryLower),
      )
      suggestions.push(
        ...matchedTickets.slice(0, 3).map((ticket: any) => ({
          id: ticket.id,
          label: ticket.title,
          category: 'ticket' as const,
          meta: `#${ticket.ticket_number}`,
        })),
      )

      // Search users with smart matching
      const matchedUsers = (users || []).filter(
        (user: any) =>
          user.first_name?.toLowerCase().includes(queryLower) ||
          user.last_name?.toLowerCase().includes(queryLower) ||
          user.email?.toLowerCase().includes(queryLower),
      )
      suggestions.push(
        ...matchedUsers.slice(0, 2).map((user: any) => ({
          id: user.id,
          label: `${user.first_name} ${user.last_name}`,
          category: 'user' as const,
          meta: user.email,
        })),
      )

      return suggestions.slice(0, 8) // Top 8 suggestions
    },
    [assets, tickets, users, recentSearches],
  )

  const suggestions = useMemo(
    () => generateSuggestions(inputValue),
    [inputValue, generateSuggestions],
  )

  const handleSearch = (value: string | SearchSuggestion | null) => {
    if (typeof value === 'string') {
      setInputValue(value)
      if (value && !recentSearches.includes(value)) {
        setRecentSearches((prev) => [value, ...prev.slice(0, 4)])
      }
      onSearch?.(value)
    } else if (value) {
      setInputValue(value.label)
      setRecentSearches((prev) => [value.label, ...prev.slice(0, 4)])
      onSearch?.(value.label, value)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      asset: theme.palette.primary.main,
      ticket: theme.palette.warning.main,
      user: theme.palette.success.main,
      recent: theme.palette.grey[500],
    }
    return colors[category] || theme.palette.grey[500]
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Autocomplete
        freeSolo
        options={suggestions}
        groupBy={(option) => {
          const categoryLabels: Record<string, string> = {
            asset: '📦 Assets',
            ticket: '🎫 Tickets',
            user: '👥 Users',
            recent: '⏱️ Recent',
          }
          return categoryLabels[option.category] || 'Other'
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option
          return option.label
        }}
        inputValue={inputValue}
        onInputChange={(_, value) => setInputValue(value)}
        onChange={(_, value) => handleSearch(value)}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                },
                '&.Mui-focused': {
                  boxShadow: `0 4px 20px ${theme.palette.primary.main}33`,
                },
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.primary.main, mr: 1 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              mb: 0.5,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              ...((props as any).sx || {}),
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {typeof option === 'string' ? option : option.label}
              </Typography>
              {typeof option !== 'string' && option.meta && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {option.meta}
                </Typography>
              )}
            </Box>
            {typeof option !== 'string' && (
              <Chip
                label={option.category.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: getCategoryColor(option.category),
                  color: 'white',
                  ml: 1,
                }}
              />
            )}
          </Box>
        )}
        noOptionsText={
          inputValue ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No results for "{inputValue}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                <TrendingUp sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                Start typing to search across your data
              </Typography>
            </Box>
          )
        }
      />
    </Box>
  )
}

export default AISearchBar
