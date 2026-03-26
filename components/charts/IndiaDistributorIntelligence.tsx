'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

interface DistributorData {
  metadata: {
    title: string
    source: string
    total_distributors: number
  }
  headers: string[]
  distributors: Record<string, string>[]
}

interface IndiaDistributorIntelligenceProps {
  title?: string
  height?: number
}

// Section color mapping for headers
const SECTION_CONFIG: { label: string; keys: string[]; bgClass: string; headerBgClass: string }[] = [
  {
    label: 'IDENTIFICATION',
    keys: ['S.No.', 'Distributor Name', 'Status'],
    bgClass: 'bg-purple-50',
    headerBgClass: 'bg-purple-100',
  },
  {
    label: 'COMPANY INFORMATION',
    keys: ['HQ / City', 'Year Est.', 'Parent Entity', 'Company Overview (Sweetener-Focused)'],
    bgClass: 'bg-orange-50',
    headerBgClass: 'bg-orange-100',
  },
  {
    label: 'PRODUCT & PARTNERSHIPS',
    keys: ['Sweetener Products Distributed', 'Principal / Supplier Partnerships (Sweetener-Relevant)', 'Application Industries Served'],
    bgClass: 'bg-green-50',
    headerBgClass: 'bg-green-100',
  },
  {
    label: 'MARKET INTELLIGENCE',
    keys: ['Regional Coverage India', 'Market Strength & Positioning', 'Strategic Insights (Sweetener Market)', 'Key Customers'],
    bgClass: 'bg-blue-50',
    headerBgClass: 'bg-blue-100',
  },
  {
    label: 'CONTACT DETAILS',
    keys: ['Contact Person', 'Designation', 'Email', 'Phone', 'LinkedIn'],
    bgClass: 'bg-yellow-50',
    headerBgClass: 'bg-yellow-100',
  },
]

function getSectionForKey(key: string) {
  for (const section of SECTION_CONFIG) {
    if (section.keys.includes(key)) return section
  }
  return null
}

// Detail modal
function DistributorDetailModal({
  isOpen,
  onClose,
  distributor,
}: {
  isOpen: boolean
  onClose: () => void
  distributor: Record<string, string> | null
}) {
  if (!isOpen || !distributor) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black">Distributor Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {distributor['Distributor Name']} - {distributor['Status']}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {SECTION_CONFIG.map((section) => (
              <div key={section.label}>
                <h3
                  className={`text-sm font-semibold uppercase tracking-wider mb-3 pb-2 border-b ${
                    section.label === 'IDENTIFICATION' ? 'text-purple-700' :
                    section.label === 'COMPANY INFORMATION' ? 'text-orange-700' :
                    section.label === 'PRODUCT & PARTNERSHIPS' ? 'text-green-700' :
                    section.label === 'MARKET INTELLIGENCE' ? 'text-blue-700' :
                    'text-yellow-700'
                  }`}
                >
                  {section.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.keys.map((key) => {
                    const value = distributor[key]
                    if (!value && key === 'S.No.') return null
                    return (
                      <div key={key} className={section.keys.length <= 2 ? '' : ''}>
                        <label className="text-xs font-medium text-gray-500 uppercase">{key}</label>
                        <p className="text-sm text-black mt-1 whitespace-pre-line">
                          {key === 'Email' && value && value !== '' ? (
                            <a href={`mailto:${value}`} className="text-[#168AAD] hover:underline">{value}</a>
                          ) : key === 'LinkedIn' && value && value !== '' ? (
                            <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-[#168AAD] hover:underline">{value}</a>
                          ) : (
                            value || '-'
                          )}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#168AAD] text-white rounded-md hover:bg-[#1A759F] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IndiaDistributorIntelligence({ title, height = 600 }: IndiaDistributorIntelligenceProps) {
  const [data, setData] = useState<DistributorData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistributor, setSelectedDistributor] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const response = await fetch('/data/distributor-intelligence.json')
        if (!response.ok) throw new Error('Failed to load distributor intelligence data')
        const jsonData = await response.json()
        setData(jsonData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredDistributors = useMemo(() => {
    if (!data) return []
    if (!searchQuery.trim()) return data.distributors
    const q = searchQuery.toLowerCase()
    return data.distributors.filter((d) =>
      Object.values(d).some((v) => v && v.toLowerCase().includes(q))
    )
  }, [data, searchQuery])

  // Columns to show in the table (exclude very long text fields for table view)
  const tableHeaders = useMemo(() => {
    if (!data) return []
    return data.headers.filter(h => h !== '')
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#168AAD] mx-auto"></div>
          <p className="mt-4 text-black">Loading distributor intelligence data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center max-w-md px-4">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 font-semibold mb-2">Distributor Data Not Available</p>
          <p className="text-sm text-gray-500">{error || 'Unable to load distributor intelligence data.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-black">
            {title || data.metadata.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.metadata.total_distributors} distributors | Source: {data.metadata.source}
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search distributors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#168AAD] focus:border-[#168AAD] w-64"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-3 text-sm text-gray-600">
        Showing <span className="font-medium">{filteredDistributors.length}</span> of {data.metadata.total_distributors} distributors
        {searchQuery && <span className="ml-1">matching &quot;{searchQuery}&quot;</span>}
      </div>

      {/* Table */}
      <div className="overflow-auto bg-white rounded-lg border border-gray-200" style={{ maxHeight: height }}>
        <table className="min-w-full">
          <thead className="sticky top-0 z-20">
            {/* Section Headers Row */}
            <tr>
              {SECTION_CONFIG.map((section) => (
                <th
                  key={section.label}
                  colSpan={section.keys.length}
                  className={`border-r border-b border-gray-300 text-center text-xs font-bold uppercase tracking-wider py-2 text-gray-900 ${section.headerBgClass}`}
                >
                  {section.label}
                </th>
              ))}
            </tr>
            {/* Column Headers Row */}
            <tr className="bg-gray-100">
              {tableHeaders.map((header) => {
                const section = getSectionForKey(header)
                return (
                  <th
                    key={header}
                    className={`px-3 py-2 text-left text-[11px] font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-300 last:border-r-0 ${section?.bgClass || ''}`}
                  >
                    <div className="whitespace-normal leading-tight">{header}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDistributors.map((distributor, index) => (
              <tr
                key={distributor['S.No.'] || index}
                onClick={() => setSelectedDistributor(distributor)}
                className="hover:bg-[#52B69A]/10 cursor-pointer transition-colors"
              >
                {tableHeaders.map((header) => {
                  const value = distributor[header] || ''
                  const section = getSectionForKey(header)
                  const isIdentification = section?.label === 'IDENTIFICATION'

                  return (
                    <td
                      key={header}
                      className={`px-3 py-2 text-xs text-gray-900 border-r border-gray-200 last:border-r-0 ${isIdentification ? section?.bgClass : ''}`}
                    >
                      {header === 'Distributor Name' ? (
                        <span className="font-medium">{value}</span>
                      ) : header === 'Email' && value ? (
                        <a
                          href={`mailto:${value}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#168AAD] hover:underline"
                        >
                          {value}
                        </a>
                      ) : header === 'LinkedIn' && value ? (
                        <a
                          href={value.startsWith('http') ? value : `https://${value}`}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#168AAD] hover:underline"
                        >
                          View Profile
                        </a>
                      ) : (
                        <div className="max-w-xs whitespace-pre-line line-clamp-3">{value || '-'}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3 text-center text-xs text-gray-500">
        Click on any row to view full distributor details
      </div>

      {/* Detail Modal */}
      {selectedDistributor && (
        <DistributorDetailModal
          isOpen={!!selectedDistributor}
          onClose={() => setSelectedDistributor(null)}
          distributor={selectedDistributor}
        />
      )}
    </div>
  )
}
