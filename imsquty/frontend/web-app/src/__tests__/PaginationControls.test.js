import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationControls } from '../components/PaginationControls';
describe('PaginationControls', () => {
    const defaultProps = {
        page: 1,
        pageSize: 10,
        total: 150,
        onPageChange: jest.fn(),
        onPageSizeChange: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should render pagination controls', () => {
        render(_jsx(PaginationControls, { ...defaultProps }));
        expect(screen.getByTestId('pagination-component')).toBeInTheDocument();
    });
    it('should display item count', () => {
        render(_jsx(PaginationControls, { ...defaultProps }));
        expect(screen.getByText(/showing 1 to 10 of 150/i)).toBeInTheDocument();
    });
    it('should display correct count for last page', () => {
        render(_jsx(PaginationControls, { ...defaultProps, page: 15, total: 150, pageSize: 10 }));
        expect(screen.getByText(/showing 141 to 150 of 150/i)).toBeInTheDocument();
    });
    it('should have page size selector', () => {
        render(_jsx(PaginationControls, { ...defaultProps }));
        const select = screen.getByTestId('page-size-select');
        expect(select).toBeInTheDocument();
    });
    it('should change page size', async () => {
        const user = userEvent.setup();
        const onPageSizeChange = jest.fn();
        render(_jsx(PaginationControls, { ...defaultProps, onPageSizeChange: onPageSizeChange }));
        const select = screen.getByTestId('page-size-select');
        await user.selectOptions(select, '25');
        expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });
    it('should navigate to next page', async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();
        render(_jsx(PaginationControls, { ...defaultProps, onPageChange: onPageChange }));
        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
    it('should navigate to previous page', async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();
        render(_jsx(PaginationControls, { ...defaultProps, page: 3, onPageChange: onPageChange }));
        const prevButton = screen.getByRole('button', { name: /previous/i });
        await user.click(prevButton);
        expect(onPageChange).toHaveBeenCalledWith(2);
    });
    it('should reset to page 1 when page size changes', async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();
        const onPageSizeChange = jest.fn();
        render(_jsx(PaginationControls, { ...defaultProps, page: 5, onPageChange: onPageChange, onPageSizeChange: onPageSizeChange }));
        const select = screen.getByTestId('page-size-select');
        await user.selectOptions(select, '25');
        expect(onPageChange).toHaveBeenCalledWith(1);
    });
    it('should disable prev button on first page', () => {
        render(_jsx(PaginationControls, { ...defaultProps, page: 1 }));
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton.disabled).toBe(true);
    });
    it('should disable next button on last page', () => {
        render(_jsx(PaginationControls, { ...defaultProps, page: 15, total: 150, pageSize: 10 }));
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton.disabled).toBe(true);
    });
    it('should show custom page sizes', () => {
        render(_jsx(PaginationControls, { ...defaultProps, pageSizes: [5, 10, 20, 50, 100] }));
        const select = screen.getByTestId('page-size-select');
        expect(select).toHaveDisplayValue('10');
    });
});
