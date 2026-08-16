import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTickets, type Ticket } from '../../context/TicketContext'

const ASSIGNEES = ['James Mercado', 'Abigail Barrion', 'Althea Alvarez', 'Denmar Redondo', 'James Orlanes']

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTicketById, updateTicket } = useTickets()

  const [ticket, setTicket] = useState<Ticket | undefined>(() => (id ? getTicketById(id) : undefined))
  const [assigneeForm, setAssigneeForm] = useState('')
  const [statusForm, setStatusForm] = useState<Ticket['status']>('Open')
  const [priorityForm, setPriorityForm] = useState<Ticket['priority']>('High')
  const [resolutionDetailsForm, setResolutionDetailsForm] = useState('')
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      const found = getTicketById(id)
      if (found) {
        setTicket(found)
        setAssigneeForm(found.assignee)
        setStatusForm(found.status)
        setPriorityForm(found.priority)
        setResolutionDetailsForm(
          found.resolutionDetails ||
            'The reported issue has been reviewed and addressed. The necessary actions have been taken to resolve the concern. The issue has been resolved accordingly.'
        )
      }
    }
  }, [id, getTicketById])

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-300">
        <h2 className="text-2xl font-bold text-white mb-2">Ticket Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">The requested ticket #{id} could not be located.</p>
        <button
          onClick={() => navigate('/tickets')}
          className="bg-[#2aa6e0] hover:bg-[#35b3f0] text-white font-medium px-5 py-2.5 rounded-[10px] text-xs transition-colors cursor-pointer"
        >
          Back to Tickets
        </button>
      </div>
    )
  }

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

  const handleOpenUpdateModal = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdateModalOpen(true)
  }

  const handleConfirmUpdateTicket = () => {
    if (!ticket) return

    const updated: Ticket = {
      ...ticket,
      assignee: assigneeForm,
      status: statusForm,
      priority: priorityForm,
      resolutionDetails: statusForm === 'Resolved' ? resolutionDetailsForm : ticket.resolutionDetails,
    }

    updateTicket(updated)
    setTicket(updated)
    setIsUpdateModalOpen(false)
    setUpdateSuccess(true)
    setTimeout(() => setUpdateSuccess(false), 3000)
  }

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm space-y-6 animate-fade-in max-w-[1400px]">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[clamp(1.2rem,2.2vw,2rem)] font-bold">
          <span className="text-gray-300">Tickets</span>
          <span className="text-gray-400 font-normal">&gt;</span>
          <span className="text-[#8ccfed]">Ticket {ticket.id}</span>
        </div>
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors cursor-pointer text-sm font-medium"
        >
          Back
        </button>
      </div>

      {updateSuccess && (
        <div className="bg-[#00c853]/20 border border-[#00c853] text-[#00c853] px-4 py-3 rounded-[12px] text-xs font-semibold flex items-center justify-between">
          <span>Ticket updated successfully!</span>
          <button onClick={() => setUpdateSuccess(false)} className="text-current font-bold">✕</button>
        </div>
      )}

      {/* Section 1: Ticket Details Card */}
      <div className="bg-[#3b3f4d] rounded-[16px] p-6 shadow-xl border border-[rgba(255,255,255,0.05)] text-gray-200">
        <div className="flex items-center gap-2 text-[#8ccfed] font-bold text-base mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Ticket Details
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs mb-4">
          <div>
            <span className="text-gray-400 block mb-1">Ticket ID</span>
            <span className="text-white font-semibold text-sm">{ticket.id}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Status</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  ticket.status === 'Open'
                    ? 'bg-[#ef4444]'
                    : ticket.status === 'Closed'
                    ? 'bg-[#f59e0b]'
                    : ticket.status === 'In progress'
                    ? 'bg-[#4ade80]'
                    : 'bg-[#38bdf8]'
                }`}
              />
              <span className={`font-semibold text-sm ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Priority</span>
            <span className={`font-semibold text-sm ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Date Created</span>
            <span className="text-gray-200 font-medium text-sm">{ticket.createdAt}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-gray-400 block mb-1">Subject</span>
            <span className="text-white font-medium text-sm">{ticket.subject}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Pharmacy</span>
            <span className="text-gray-200 font-medium text-sm">{ticket.pharmacy}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Requester</span>
            <span className="text-gray-200 font-medium text-sm">{ticket.requester}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Assignment and Status Management Card */}
      <div className="bg-[#3b3f4d] rounded-[16px] p-6 shadow-xl border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2 text-[#8ccfed] font-bold text-base mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 11 19 13 23 9" />
          </svg>
          Assignment and Status Management
        </div>

        <form onSubmit={handleOpenUpdateModal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-gray-300 text-xs font-medium block mb-1.5">Assignee</label>
            <div className="relative">
              <select
                value={assigneeForm}
                onChange={(e) => setAssigneeForm(e.target.value)}
                className="w-full bg-[#525766] text-white px-3.5 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] cursor-pointer text-xs appearance-none pr-9"
              >
                {ASSIGNEES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-xs font-medium block mb-1.5">Status</label>
            <div className="relative">
              <select
                value={statusForm}
                onChange={(e) => setStatusForm(e.target.value as Ticket['status'])}
                className="w-full bg-[#525766] text-white px-3.5 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] cursor-pointer text-xs appearance-none pr-9"
              >
                <option value="Open">Open</option>
                <option value="In progress">In progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-xs font-medium block mb-1.5">Priority</label>
            <div className="relative">
              <select
                value={priorityForm}
                onChange={(e) => setPriorityForm(e.target.value as Ticket['priority'])}
                className="w-full bg-[#525766] text-white px-3.5 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:border-[#2aa6e0] cursor-pointer text-xs appearance-none pr-9"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#8ccfed] hover:bg-[#78c4e6] text-[#1c2930] font-semibold py-2.5 px-6 rounded-[10px] text-xs transition-colors cursor-pointer w-full"
          >
            Update ticket
          </button>

          {ticket.status === 'Resolved' && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
              <label className="text-gray-300 text-xs font-semibold block mb-2">Resolution Details</label>
              <textarea
                rows={4}
                value={resolutionDetailsForm}
                onChange={(e) => setResolutionDetailsForm(e.target.value)}
                placeholder="Enter resolution details..."
                className="w-full bg-[#525766] text-gray-100 placeholder-gray-400 p-4 rounded-[14px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors text-xs leading-relaxed resize-none"
              />
            </div>
          )}
        </form>
      </div>

      {/* Section 3: Two Columns Grid (Description & Steps Taken) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Description Card */}
        <div className="bg-[#3b3f4d] rounded-[16px] p-6 shadow-xl border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-[#8ccfed] font-bold text-base mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Description
          </div>
          <p className="text-gray-300 text-xs leading-relaxed m-0">{ticket.description}</p>
        </div>

        {/* Steps Taken Card */}
        <div className="bg-[#3b3f4d] rounded-[16px] p-6 shadow-xl border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-[#8ccfed] font-bold text-base mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Steps Taken
          </div>
          <div className="space-y-1.5 text-gray-300 text-xs">
            {ticket.stepsTaken.map((step, i) => (
              <div key={i} className="leading-relaxed">{step}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Attachments Card */}
      <div className="bg-[#3b3f4d] rounded-[16px] p-6 shadow-xl border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2 text-[#8ccfed] font-bold text-base mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          Attachments
        </div>

        <div className="w-[180px] h-[110px] bg-white rounded-[12px] p-3 flex flex-col items-center justify-center text-center shadow-md relative group cursor-pointer border border-gray-200">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-gray-800 leading-tight">Payment Unsuccessful</span>
        </div>
      </div>

      {/* Section 5: Additional Information Card */}
      <div className="bg-[#3b3f4d] rounded-[16px] p-6 shadow-xl border border-[rgba(255,255,255,0.05)] space-y-4">
        <h3 className="text-[#8ccfed] font-bold text-base m-0">Additional Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
              </svg>
              Category
            </div>
            <div className="text-gray-200 font-medium pl-5">{ticket.category}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
              </svg>
              Subcategory
            </div>
            <div className="text-gray-200 font-medium pl-5">{ticket.subcategory}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Affected Module
            </div>
            <div className="text-gray-200 font-medium pl-5">{ticket.affectedModule}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-1">
          <div>
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Reported By
            </div>
            <div className="text-gray-200 font-medium pl-5">{ticket.requester}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Contact Number
            </div>
            <div className="text-gray-200 font-medium pl-5">{ticket.contactNumber}</div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Preferred Contact Method
            </div>
            <div className="text-gray-200 font-medium pl-5">{ticket.preferredContactMethod}</div>
          </div>
        </div>
      </div>

      {/* Update Ticket Confirmation Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 animate-fade-in">
          <div className="bg-[#292d37] w-full max-w-[380px] rounded-[20px] p-7 shadow-2xl border border-[rgba(255,255,255,0.05)] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center mx-auto mb-4 text-white">
              <span className="text-3xl font-light leading-none">!</span>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Update Ticket</h2>
            <p className="text-gray-300 text-xs mb-7 leading-relaxed">
              Are you sure you want to update this ticket?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-[10px] border border-gray-400/50 text-gray-200 hover:bg-white/5 font-medium transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdateTicket}
                className="w-full py-2.5 px-4 rounded-[10px] bg-[#38bdf8] hover:bg-[#2aa6e0] text-white font-medium shadow transition-colors text-xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketDetailsPage
