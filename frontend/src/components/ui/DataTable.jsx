import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react'
import { EmptyState } from './EmptyState'

export const DataTable = ({
  columns = [],
  data = [],
  searchPlaceholder = 'Search...',
  searchKey = '',
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.'
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  React.useEffect(() => {
    setCurrentPageSize(pageSize)
  }, [pageSize])

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Search filter
    if (searchTerm && searchKey) {
      result = result.filter(item => {
        const val = item[searchKey]
        return val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false
      })
    } else if (searchTerm) {
      // General search across all columns
      result = result.filter(item => {
        return Object.values(item).some(val => 
          val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false
        )
      })
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Custom extractors if needed
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, searchKey, sortConfig])

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / currentPageSize)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize
    return filteredData.slice(start, start + currentPageSize)
  }, [filteredData, currentPage, currentPageSize])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10)
    setCurrentPageSize(newSize)
    setCurrentPage(1)
  }

  // Reset page on search
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-elegant overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-outfit">Show:</span>
            <select
              value={currentPageSize}
              onChange={handlePageSizeChange}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            Showing {filteredData.length > 0 ? (currentPage - 1) * currentPageSize + 1 : 0} to{' '}
            {Math.min(currentPage * currentPageSize, filteredData.length)} of {filteredData.length} entries
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                    col.sortable ? 'cursor-pointer hover:text-brand select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <ArrowUpDown size={13} className="text-gray-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-blue-50/10 transition-colors">
                  {columns.map((col, colIndex) => {
                    const cellValue = col.render ? col.render(row) : row[col.accessor]
                    return (
                      <td key={colIndex} className="px-6 py-4.5 text-sm font-medium text-gray-700">
                        {cellValue !== undefined && cellValue !== null ? cellValue : '-'}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-5 border-t border-gray-50 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                  currentPage === page
                    ? 'bg-brand text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
export default DataTable
