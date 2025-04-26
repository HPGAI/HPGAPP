import { PaginationState } from "@tanstack/react-table";

/**
 * Calculate pagination range for Supabase queries
 */
export function calculatePaginationRange(pagination: PaginationState) {
  const from = pagination.pageIndex * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  return { from, to };
}

/**
 * Calculate page count based on total record count and page size
 */
export function calculatePageCount(totalCount: number | null, pageSize: number) {
  if (totalCount === null) return 0;
  return Math.ceil(totalCount / pageSize);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null, defaultValue = '-') {
  if (!dateString) return defaultValue;
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | null, currency = 'USD', defaultValue = '-') {
  if (amount === null) return defaultValue;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generate status badge class based on status value
 */
export function getStatusBadgeClass(status: string | null, options: Record<string, string> = {}) {
  if (!status) return 'bg-gray-100 text-gray-800 text-xs px-2 py-0.5';
  
  return (options[status] || 'bg-gray-100 text-gray-800') + ' text-xs px-2 py-0.5';
}

export const defaultStatusClasses = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'In Review': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

/**
 * Default table page sizes
 */
export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100]; 