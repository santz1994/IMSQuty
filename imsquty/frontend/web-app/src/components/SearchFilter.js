import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clear, Search } from '@mui/icons-material';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
const SearchFilter = ({ searchValue, onSearchChange, filterValue, onFilterChange, filterLabel = 'Filter', filterOptions = [], onClear, }) => {
    return (_jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }, children: [_jsx(TextField, { label: "Search", placeholder: "Search...", value: searchValue, onChange: (e) => onSearchChange(e.target.value), variant: "outlined", size: "small", sx: { minWidth: 200 }, InputProps: {
                    startAdornment: _jsx(Search, { sx: { mr: 1, color: 'action.active' } }),
                } }), filterOptions.length > 0 && onFilterChange && (_jsxs(FormControl, { sx: { minWidth: 150 }, children: [_jsx(InputLabel, { children: filterLabel }), _jsxs(Select, { size: "small", value: filterValue || '', label: filterLabel, onChange: (e) => onFilterChange(e.target.value), children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value)))] })] })), onClear && (_jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(Clear, {}), onClick: onClear, children: "Clear" }))] }));
};
export default SearchFilter;
