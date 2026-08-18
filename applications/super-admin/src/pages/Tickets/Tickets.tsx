import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTickets, type Ticket } from '../../context/TicketContext'

const Tickets: React.FC = () => {
  const navigate = useNavigate()
  const { tickets } = useTickets()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedPharmacy, setSelectedPharmacy] = useState('All')

  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'Open').length
  const inProgressTickets = tickets.filter((t) => t.status === 'In progress').length
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length
  const closedTickets = tickets.filter((t) => t.status === 'Closed').length

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
        return 'text-[#f87171]' 
      case 'Closed':
        return 'text-[#f59e0b]' 
      case 'In progress':
        return 'text-[#4ade80]' 
      case 'Resolved':
        return 'text-[#38bdf8]' 
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

  const handleViewTicket = (ticketId: string) => {
    const cleanId = ticketId.replace('#', '')
    navigate(`/tickets/${cleanId}`)
  }

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm">
      {}
      <div className="mb-6">
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.8rem)] font-normal leading-[1.05] text-white">Tickets</h1>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {}
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

        {}
        <div className="bg-[#3e4350] rounded-[14px] p-4 flex items-center gap-4 shadow-lg border border-[rgba(255,255,255,0.04)]">
          <div className="w-12 h-12 rounded-full bg-[#ef4444] flex items-center justify-center text-white flex-shrink-0 text-xl font-bold">
            !
          </div>
          <div>
            <div className="text-gray-300 text-xs font-semibold">Open</div>
            <div className="text-white text-2xl font-bold">{openTickets}</div>
          </div>
        </div>

        {}
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

        {}
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

        {}
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

      {}
      <div className="bg-[#3e4350] rounded-[14px] p-5 mb-6 shadow-lg border border-[rgba(255,255,255,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {}
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

          {}
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

          {}
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

          {}
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

      {}
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
                        onClick={() => handleViewTicket(ticket.id)}
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
    </div>
  )
}

export default Tickets
