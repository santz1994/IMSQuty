import React from 'react';
interface SearchFilterProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    filterLabel?: string;
    filterOptions?: Array<{
        label: string;
        value: string;
    }>;
    onClear?: () => void;
}
declare const SearchFilter: React.FC<SearchFilterProps>;
export default SearchFilter;
