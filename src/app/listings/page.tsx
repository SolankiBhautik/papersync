'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FormEntry {
  id: string
  name: string
  address: string
  invoiceNo: string
  date: string
  accountingFees: number
  taxConsultancy: number
  consultancyFees: number
  taxationFees: number
  otherCharges: number
}

interface ApiResponse {
  entries: FormEntry[]
  totalCount: number
}

export default function ListingsPage() {
  const [allEntries, setAllEntries] = useState<FormEntry[]>([])
  const [entries, setEntries] = useState<FormEntry[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof FormEntry>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const entriesPerPage = 10

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterSortSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortField, sortOrder, searchTerm]);


  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries');
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data: ApiResponse = await response.json();
      setAllEntries(data.entries);
      setEntries(data.entries);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
    }
  };

  const filterSortSearch = async () => {
      let filteredEntries = allEntries;
      // Client-side search
      if (searchTerm) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Client-side sorting
      filteredEntries.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Client-side pagination
      const startIndex = (currentPage - 1) * entriesPerPage;
      const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage);
      const totalFilteredCount = filteredEntries.length;
      const totalPages = Math.ceil(totalFilteredCount / entriesPerPage);

      setEntries(paginatedEntries);
      setTotalCount(totalFilteredCount);
      setTotalPages(totalPages);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSort = (field: keyof FormEntry) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Calculate total pages based on filtered and paginated data
  const [totalPages, setTotalPages] = useState(1);

  return (
    <main className="min-h-screen bg-zinc-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Invoice Listings</h1>
          <Link
            href="/"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Create New Invoice
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or invoice number..."
            className="w-full bg-zinc-800 border border-gray-700 rounded-lg px-4 py-2"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full">
            <thead className="">
              <tr>
                <th
                  className="px-6 py-3 text-left cursor-pointer hover:bg-zinc-600"
                  onClick={() => handleSort('date')}
                >
                  Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer hover:bg-zinc-600"
                  onClick={() => handleSort('invoiceNo')}
                >
                  Invoice No {sortField === 'invoiceNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer hover:bg-zinc-600"
                  onClick={() => handleSort('name')}
                >
                  Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const totalAmount =
                  entry.accountingFees +
                  entry.taxConsultancy +
                  entry.consultancyFees +
                  entry.taxationFees +
                  entry.otherCharges

                return (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-700"
                  >
                    <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">{entry.invoiceNo}</td>
                    <td className="px-6 py-4">{entry.name}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(totalAmount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/api/generate-pdf?id=${entry.id}`, '_blank')}
                          className="border border-zinc-700 hover:border-zinc-100 border-input bg-zinc-900 shadow-sm hover:bg-zinc-700 h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                          disabled={actionLoading}
                        >
                          View
                        </button>
                        <Link
                          href={`/edit/${entry.id}`}
                          className="border border-zinc-700 hover:border-zinc-100 border-input bg-zinc-900 shadow-sm hover:bg-zinc-700 h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="border border-zinc-700 hover:border-zinc-100 border-input bg-zinc-900 shadow-sm hover:bg-zinc-700 h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                          disabled={actionLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}