import React, { useState } from 'react'

export interface Ticket {
  id: string
  subject: string
  requester: string
  pharmacy: string
  status: 'Open' | 'Closed' | 'In progress' | 'Resolved'
  priority: 'High' | 'Medium' | 'Low'
  createdAt?: string
  description?: string
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: '#1234',
    subject: 'Cannot Process Sale',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Open',
    priority: 'High',
    createdAt: '2026-08-15 10:30 AM',
    description: 'System freezes when submitting a sales transaction at checkout.',
  },
  {
    id: '#1235',
    subject: 'Inventory not updating',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Closed',
    priority: 'High',
    createdAt: '2026-08-14 02:15 PM',
    description: 'Stock count does not deduct automatically after completing orders.',
  },
  {
    id: '#1236',
    subject: 'Unable to login',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'In progress',
    priority: 'High',
    createdAt: '2026-08-15 08:45 AM',
    description: 'Pharmacist account gets invalid credentials error on valid password.',
  },
  {
    id: '#1237',
    subject: 'Report not generating',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Resolved',
    priority: 'High',
    createdAt: '2026-08-13 11:20 AM',
    description: 'Monthly sales PDF export fails with 500 server error response.',
  },
  {
    id: '#1238',
    subject: 'System slow',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Open',
    priority: 'High',
    createdAt: '2026-08-15 04:00 PM',
    description: 'Dashboard takes over 10 seconds to load during peak hours.',
  },
]

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedPharmacy, setSelectedPharmacy] = useState('All')
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null)

  // Calculate dynamic counts for KPI cards
  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'Open').length
  const inProgressTickets = tickets.filter((t) => t.status === 'In progress').length
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length
  const closedTickets = tickets.filter((t) => t.status === 'Closed').length

  // Filter tickets based on search and dropdown selections
  const filteredTickets = tickets.filter((t) => {
    const query = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !query ||
      t.id.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.requester.toLowerCase().includes(query)

    const matchesStatus =
      selectedStatus === 'All' ||
      selectedStatus === 'Status' ||
      t.status.toLowerCase() === selectedStatus.toLowerCase()

    const matchesPriority =
      selectedPriority === 'All' ||
      selectedPriority === 'Priority' ||
      t.priority.toLowerCase() === selectedPriority.toLowerCase()

    const matchesPharmacy =
      selectedPharmacy === 'All' ||
      selectedPharmacy === 'Pharmacy' ||
      t.pharmacy.toLowerCase() === selectedPharmacy.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority && matchesPharmacy
  })

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Open':
        return 'text-[#f87171]' // Red
      case 'Closed':
        return 'text-[#f59e0b]' // Yellow / Amber
      case 'In progress':
        return 'text-[#4ade80]' // Green
      case 'Resolved':
        return 'text-[#38bdf8]' // Blue / Cyan
      default:
        return 'text-gray-300'
    }
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'High':
        return 'text-[#f87171]'
      case 'Medium':
        return 'text-[#f59e0b]'
      case 'Low':
        return 'text-[#4ade80]'
      default:
        return 'text-gray-300'
    }
  }

  const handleUpdateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    )
    if (viewingTicket?.id === ticketId) {
      setViewingTicket((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
  }

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm">
      {/* Header */}
      <div className="mb-6">
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.8rem)] font-bold leading-[1.05] text-white">Tickets</h1>
      </div>

      {/* KPI Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* All Tickets */}
        <div className="bg-[#3e4350] rounded-[14px] p-4 flex items-center gap-4 shadow-lg border border-[rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#2aa6e0] flex items-center justify-center text-white flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 12h.01" />
            </svg>
          </div>
          <div>
            <div className="text-gray-300 text-xs font-semibold">All Tickets</div>
            <div className="text-white text-2xl font-bold">{totalTickets}</div>
          </div>
        </div>

        {/* Open */}
        <div className="bg-[#3e4350] rounded-[14px] p-4 flex items-center gap-4 shadow-lg border border-[rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#ef4444] flex items-center justify-center text-white flex-shrink-0 text-xl font-bold">
            !
          </div>
          <div>
            <div className="text-gray-300 text-xs font-semibold">Open</div>
            <div className="text-white text-2xl font-bold">{openTickets}</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#3e4350] rounded-[14px] p-4 flex items-center gap-4 shadow-lg border border-[rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center text-white flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <div>
            <div className="text-gray-300 text-xs font-semibold">In Progress</div>
            <div className="text-white text-2xl font-bold">{inProgressTickets}</div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-[#3e4350] rounded-[14px] p-4 flex items-center gap-4 shadow-lg border border-[rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#0284c7] flex items-center justify-center text-white flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="text-gray-300 text-xs font-semibold">Resolved</div>
            <div className="text-white text-2xl font-bold">{resolvedTickets}</div>
          </div>
        </div>

        {/* Closed */}
        <div className="bg-[#3e4350] rounded-[14px] p-4 flex items-center gap-4 shadow-lg border border-[rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <div>
            <div className="text-gray-300 text-xs font-semibold">Closed</div>
            <div className="text-white text-2xl font-bold">{closedTickets}</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-[#3e4350] rounded-[14px] p-5 mb-6 shadow-lg border border-[rgba(255,255,255,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-200 text-xs font-medium">Search by ticket ID, subject, or requester</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder=""
                className="w-full bg-[#585e6e] text-white pl-10 pr-4 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors text-sm"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-200 text-xs font-medium">Status</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#585e6e] text-white px-4 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] cursor-pointer text-sm appearance-none pr-10"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In progress">In progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Priority Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-200 text-xs font-medium">Priority</label>
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-[#585e6e] text-white px-4 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] cursor-pointer text-sm appearance-none pr-10"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pharmacy Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-200 text-xs font-medium">Pharmacy</label>
            <div className="relative">
              <select
                value={selectedPharmacy}
                onChange={(e) => setSelectedPharmacy(e.target.value)}
                className="w-full bg-[#585e6e] text-white px-4 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] cursor-pointer text-sm appearance-none pr-10"
              >
                <option value="All">All Pharmacies</option>
                <option value="PureMed Pharmacy">PureMed Pharmacy</option>
                <option value="Landicho Drugstore">Landicho Drugstore</option>
                <option value="Generika Drugstore">Generika Drugstore</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tickets Table */}
      <div className="bg-[#424754] rounded-[14px] overflow-hidden shadow-xl border border-[rgba(255,255,255,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#8ccfed] text-[#22313b]">
                <th className="py-3.5 px-6 font-semibold text-xs rounded-tl-[14px] w-[12%]">Ticket ID</th>
                <th className="py-3.5 px-6 font-semibold text-xs w-[25%]">Subject</th>
                <th className="py-3.5 px-6 font-semibold text-xs w-[20%]">Requester</th>
                <th className="py-3.5 px-6 font-semibold text-xs w-[20%]">Pharmacy</th>
                <th className="py-3.5 px-6 font-semibold text-xs w-[12%]">Status</th>
                <th className="py-3.5 px-6 font-semibold text-xs w-[11%]">Priority</th>
                <th className="py-3.5 px-6 font-semibold text-xs text-center rounded-tr-[14px] w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors align-middle">
                    <td className="py-4 px-6 text-gray-100 font-medium text-sm">{ticket.id}</td>
                    <td className="py-4 px-6 text-gray-200 text-sm font-medium">{ticket.subject}</td>
                    <td className="py-4 px-6 text-gray-300 text-sm">{ticket.requester}</td>
                    <td className="py-4 px-6 text-gray-300 text-sm">{ticket.pharmacy}</td>
                    <td className={`py-4 px-6 text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </td>
                    <td className={`py-4 px-6 text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setViewingTicket(ticket)}
                        className="px-4 py-1.5 rounded-[6px] border border-[#2aa6e0] text-[#38bdf8] hover:bg-[#2aa6e0]/10 text-xs font-medium transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No tickets found matching your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 animate-fade-in">
          <div className="bg-[#292d37] w-full max-w-[540px] rounded-[20px] p-7 shadow-2xl border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-[#38bdf8] font-bold text-xs uppercase tracking-wider block">{viewingTicket.id}</span>
                <h2 className="text-white text-xl font-bold m-0">{viewingTicket.subject}</h2>
              </div>
              <button
                onClick={() => setViewingTicket(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 bg-[#3d424e] p-4 rounded-[12px]">
                <div>
                  <span className="text-gray-400 text-xs block">Requester</span>
                  <span className="text-white text-sm font-medium">{viewingTicket.requester}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Pharmacy</span>
                  <span className="text-white text-sm font-medium">{viewingTicket.pharmacy}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#3d424e] p-4 rounded-[12px]">
                <div>
                  <span className="text-gray-400 text-xs block mb-1">Status</span>
                  <select
                    value={viewingTicket.status}
                    onChange={(e) => handleUpdateTicketStatus(viewingTicket.id, e.target.value as Ticket['status'])}
                    className="bg-[#292d37] text-white px-3 py-1.5 rounded-[8px] border border-white/10 text-xs focus:outline-none focus:border-[#2aa6e0] cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In progress">In progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block mb-1">Priority</span>
                  <span className={`text-xs font-semibold ${getPriorityColor(viewingTicket.priority)}`}>
                    {viewingTicket.priority}
                  </span>
                </div>
              </div>

              {viewingTicket.description && (
                <div className="bg-[#3d424e] p-4 rounded-[12px]">
                  <span className="text-gray-400 text-xs block mb-1">Description</span>
                  <p className="text-gray-200 text-xs leading-relaxed m-0">{viewingTicket.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingTicket(null)}
                className="bg-[#2aa6e0] hover:bg-[#35b3f0] text-white font-medium px-5 py-2.5 rounded-[10px] text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tickets
