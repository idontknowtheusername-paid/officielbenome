import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * DataTablePagination component for handling pagination in data tables
 * @param {Object} props - Component props
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} [props.onItemsPerPageChange] - Callback when items per page changes
 * @param {number[]} [props.itemsPerPageOptions] - Options for items per page
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showItemsPerPage] - Whether to show items per page selector
 * @param {boolean} [props.showPageNumbers] - Whether to show page numbers
 * @param {string} [props.label] - Optional label to display
 * @returns {JSX.Element} DataTablePagination component
 */
const DataTablePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  className,
  showItemsPerPage = true,
  showPageNumbers = true,
  label,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleItemsPerPageChange = (value) => {
    const newItemsPerPage = Number(value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
    // Reset to first page when changing items per page
    onPageChange(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Maximum number of page numbers to show
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      // Calculate start and end page numbers to show
      startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 px-2', className)}>
      {label && (
        <div className="text-sm text-muted-foreground">
          {label}
        </div>
      )}
      
      <div className="flex flex-1 items-center justify-between sm:justify-end gap-2">
        {/* Items per page selector */}
        {showItemsPerPage && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium whitespace-nowrap">Lignes par page</p>
            <Select
              value={`${itemsPerPage}`}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={`${option}`}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page info */}
        <div className="flex items-center space-x-1">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {startItem}-{endItem} sur {totalItems}
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Première page"
          >
            <span className="sr-only">Première page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Page précédente"
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {showPageNumbers && (
            <div className="hidden sm:flex items-center space-x-1">
              {getPageNumbers().map((page, index) =>
                typeof page === 'number' ? (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    className={cn('h-8 w-8 p-0', {
                      'font-bold': page === currentPage,
                    })}
                    onClick={() => onPageChange(page)}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    {page}
                  </span>
                )
              )}
            </div>
          )}

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Page suivante"
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Dernière page"
          >
            <span className="sr-only">Dernière page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;
