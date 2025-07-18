import { useState, useMemo, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnResizeMode,
  ColumnOrderState,
  RowSelectionState,
  ExpandedState,
  PaginationState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTablePagination } from '@/components/ui/pagination/DataTablePagination';
import { AdvancedFilters } from '@/components/ui/filters/AdvancedFilters';
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner';
import { cn } from '@/lib/utils';

/**
 * DataTable component for displaying tabular data with sorting, filtering, and pagination
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions for the table
 * @param {Array} props.data - Data to display in the table
 * @param {boolean} [props.loading] - Whether the table is loading data
 * @param {number} [props.totalItems] - Total number of items (for server-side pagination)
 * @param {number} [props.pageCount] - Total number of pages (for server-side pagination)
 * @param {Function} [props.onPaginationChange] - Callback when pagination changes
 * @param {Function} [props.onSortingChange] - Callback when sorting changes
 * @param {Function} [props.onColumnFiltersChange] - Callback when column filters change
 * @param {Function} [props.onRowSelectionChange] - Callback when row selection changes
 * @param {Object} [props.initialState] - Initial state of the table
 * @param {string} [props.searchPlaceholder] - Placeholder text for the search input
 * @param {boolean} [props.enablePagination] - Whether to enable pagination
 * @param {boolean} [props.enableSorting] - Whether to enable sorting
 * @param {boolean} [props.enableColumnFilters] - Whether to enable column filters
 * @param {boolean} [props.enableRowSelection] - Whether to enable row selection
 * @param {boolean} [props.enableMultiRowSelection] - Whether to enable multi-row selection
 * @param {boolean} [props.enableGlobalFilter] - Whether to enable global filtering
 * @param {boolean} [props.enableColumnResizing] - Whether to enable column resizing
 * @param {boolean} [props.showHeader] - Whether to show the table header
 * @param {boolean} [props.stickyHeader] - Whether to make the header sticky
 * @param {string} [props.className] - Additional CSS classes for the table container
 * @param {string} [props.tableClassName] - Additional CSS classes for the table element
 * @param {React.ReactNode} [props.emptyState] - Custom empty state component
 * @param {Array} [props.filters] - Array of filter configurations for the advanced filters
 * @param {Function} [props.onFilter] - Callback when filters are applied
 * @param {Function} [props.onResetFilters] - Callback when filters are reset
 * @param {Object} [props.defaultFilterValues] - Default filter values
 * @returns {JSX.Element} DataTable component
 */
const DataTable = ({
  columns,
  data = [],
  loading = false,
  totalItems,
  pageCount: controlledPageCount,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onRowSelectionChange,
  initialState,
  searchPlaceholder = 'Rechercher...',
  enablePagination = true,
  enableSorting = true,
  enableColumnFilters = true,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableGlobalFilter = true,
  enableColumnResizing = false,
  showHeader = true,
  stickyHeader = true,
  className,
  tableClassName,
  emptyState,
  filters = [],
  onFilter,
  onResetFilters,
  defaultFilterValues = {},
  ...props
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState(initialState?.sorting || []);
  const [columnFilters, setColumnFilters] = useState(initialState?.columnFilters || []);
  const [columnVisibility, setColumnVisibility] = useState(initialState?.columnVisibility || {});
  const [rowSelection, setRowSelection] = useState(initialState?.rowSelection || {});
  const [columnPinning, setColumnPinning] = useState(initialState?.columnPinning || {});
  const [columnOrder, setColumnOrder] = useState(initialState?.columnOrder || []);
  const [expanded, setExpanded] = useState(initialState?.expanded || {});
  const [pagination, setPagination] = useState(
    initialState?.pagination || {
      pageIndex: 0,
      pageSize: 10,
    }
  );

  // Handle controlled vs uncontrolled pagination
  const paginationState = {
    ...pagination,
    pageIndex: controlledPageCount !== undefined ? pagination.pageIndex : pagination.pageIndex,
  };

  // Update internal state when props change
  useEffect(() => {
    if (initialState) {
      if (initialState.sorting) setSorting(initialState.sorting);
      if (initialState.columnFilters) setColumnFilters(initialState.columnFilters);
      if (initialState.columnVisibility) setColumnVisibility(initialState.columnVisibility);
      if (initialState.rowSelection) setRowSelection(initialState.rowSelection);
      if (initialState.columnPinning) setColumnPinning(initialState.columnPinning);
      if (initialState.columnOrder) setColumnOrder(initialState.columnOrder);
      if (initialState.expanded) setExpanded(initialState.expanded);
      if (initialState.pagination) setPagination(initialState.pagination);
    }
  }, [initialState]);

  // Memoize the columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Initialize the table
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    pageCount: controlledPageCount,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnPinning,
      columnOrder,
      expanded,
      pagination: enablePagination ? paginationState : undefined,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onColumnFiltersChange?.(newFilters);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      onRowSelectionChange?.(newSelection);
    },
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
    onExpandedChange: setExpanded,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(paginationState) : updater;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: controlledPageCount !== undefined,
    manualFiltering: onColumnFiltersChange !== undefined,
    manualSorting: onSortingChange !== undefined,
    enableRowSelection,
    enableMultiRowSelection,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    debugTable: process.env.NODE_ENV === 'development',
    debugHeaders: process.env.NODE_ENV === 'development',
    debugColumns: process.env.NODE_ENV === 'development',
  });

  // Handle filter changes from AdvancedFilters
  const handleFilter = (filters) => {
    const newColumnFilters = [];
    
    // Convert filter values to column filters
    Object.entries(filters).forEach(([key, value]) => {
      // Handle date range filters
      if (key.endsWith('From') || key.endsWith('To')) {
        const baseKey = key.endsWith('From') ? key.replace('From', '') : key.replace('To', '');
        const isFrom = key.endsWith('From');
        
        // Find existing date range filter or create a new one
        const existingIndex = newColumnFilters.findIndex(f => f.id === baseKey);
        
        if (existingIndex >= 0) {
          // Update existing date range filter
          newColumnFilters[existingIndex] = {
            ...newColumnFilters[existingIndex],
            value: {
              ...newColumnFilters[existingIndex].value,
              [isFrom ? 'from' : 'to']: value,
            },
          };
        } else {
          // Add new date range filter
          newColumnFilters.push({
            id: baseKey,
            value: {
              [isFrom ? 'from' : 'to']: value,
            },
          });
        }
      } else {
        // Handle regular filters
        newColumnFilters.push({
          id: key,
          value,
        });
      }
    });
    
    // Update table state
    table.setColumnFilters(newColumnFilters);
    
    // Call the onFilter callback if provided
    if (onFilter) {
      onFilter(filters);
    }
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setColumnFilters([]);
    setGlobalFilter('');
    
    if (onResetFilters) {
      onResetFilters();
    } else if (onFilter) {
      onFilter({});
    }
  };

  // Render the empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    if (emptyState) {
      return (
        <TableRow>
          <TableCell colSpan={table.getVisibleFlatColumns().length} className="h-24 text-center">
            {emptyState}
          </TableCell>
        </TableRow>
      );
    }
    
    return (
      <TableRow>
        <TableCell colSpan={table.getVisibleFlatColumns().length} className="h-24 text-center">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-muted-foreground">
              Aucune donnée disponible
            </div>
            {enableGlobalFilter && globalFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setGlobalFilter('')}
              >
                Réinitialiser la recherche
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Global Filter */}
        {enableGlobalFilter && (
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-full sm:w-[250px]"
              />
              {(globalFilter || columnFilters.length > 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-8 w-8"
                  onClick={() => {
                    setGlobalFilter('');
                    handleResetFilters();
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Réinitialiser les filtres</span>
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Advanced Filters */}
        {filters && filters.length > 0 && (
          <AdvancedFilters
            filters={filters}
            onFilter={handleFilter}
            onReset={onResetFilters}
            defaultValues={defaultFilterValues}
            triggerLabel="Filtres avancés"
            showReset={columnFilters.length > 0 || globalFilter}
            onResetFilters={handleResetFilters}
          />
        )}
      </div>
      
      {/* Table Container */}
      <div className="rounded-md border overflow-hidden">
        <div className="relative overflow-x-auto">
          {loading && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          
          <Table className={cn('w-full', tableClassName)}>
            {showHeader && (
              <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          'whitespace-nowrap',
                          header.column.getCanSort() && 'cursor-pointer select-none',
                          header.column.getIsResizing() && 'relative bg-muted/50',
                          header.column.columnDef.meta?.headerClassName
                        )}
                        style={{
                          width: header.getSize(),
                          minWidth: header.column.columnDef.minSize,
                          maxWidth: header.column.columnDef.maxSize,
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center justify-between">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          
                          {header.column.getCanSort() && (
                            <span className="ml-2">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted()] ?? '↕'}
                            </span>
                          )}
                        </div>
                        
                        {enableColumnResizing && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize select-none touch-none ${
                              header.column.getIsResizing() ? 'bg-primary' : ''
                            }`}
                          />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      row.getIsSelected() && 'bg-muted/50',
                      row.getCanSelect() && 'cursor-pointer',
                      row.getIsExpanded() && 'bg-muted/10',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.cellClassName,
                          'whitespace-nowrap',
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                renderEmptyState()
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {enablePagination && (
          <div className="border-t px-4 py-3">
            <DataTablePagination
              totalItems={controlledPageCount ? controlledPageCount * (pagination.pageSize || 10) : totalItems || data.length}
              itemsPerPage={pagination.pageSize || 10}
              currentPage={(pagination.pageIndex || 0) + 1}
              onPageChange={(page) => {
                table.setPageIndex(page - 1);
              }}
              onItemsPerPageChange={(size) => {
                table.setPageSize(size);
              }}
              itemsPerPageOptions={[5, 10, 20, 50, 100]}
              showItemsPerPage={true}
              showPageNumbers={true}
              label={`${table.getFilteredRowModel().rows.length} élément(s)`}
            />
          </div>
        )}
      </div>
      
      {/* Selected Rows Info */}
      {enableRowSelection && Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between rounded-md border p-2 bg-muted/20">
          <div className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} élément(s) sélectionné(s)
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
            className="h-8"
          >
            Désélectionner
          </Button>
        </div>
      )}
    </div>
  );
};

export { DataTable };
