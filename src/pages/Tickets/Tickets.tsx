import React, { useState } from 'react'

export interface Ticket {
  id: string
  subject: string
  requester: string
  pharmacy: string
  status: 'Open' | 'Closed' | 'In progress' | 'Resolved'
  priority: 'High' | 'Medium' | 'Low'
  createdAt: string
  description: string
  assignee: string
  stepsTaken: string[]
  category: string
  subcategory: string
  affectedModule: string
  contactNumber: string
  preferredContactMethod: string
  resolutionDetails?: string
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: '#1234',
    subject: 'Cannot Process Sale',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Open',
    priority: 'High',
    createdAt: '2026-08-12 10:00',
    description:
      'We are unable to complete a sale transaction in the POS. After clicking "Continue" to confirm customer payment, it shows "payment unsuccessful." This happens to all sales, even if the inputs are correct.',
    assignee: 'James Mercado',
    stepsTaken: [
      '1. Go to POS',
      '2. Go to Pickup Orders',
      '3. View order details',
      '4. Select Payment Method',
      '5. Enter details',
      '6. System shows payment unsuccessful',
      '7. Transaction does not proceed',
    ],
    category: 'POS',
    subcategory: 'Transaction Error',
    affectedModule: 'Point of Sale',
    contactNumber: '09123456789',
    preferredContactMethod: 'Email',
  },
  {
    id: '#1235',
    subject: 'Inventory not updating',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Closed',
    priority: 'High',
    createdAt: '2026-08-14 14:15',
    description:
      'Stock count does not deduct automatically after completing orders in the inventory management module.',
    assignee: 'Abigail Barrion',
    stepsTaken: [
      '1. Open Inventory',
      '2. Process checkout sale',
      '3. Check stock count',
      '4. Observe stock remains unchanged',
    ],
    category: 'Inventory',
    subcategory: 'Sync Error',
    affectedModule: 'Stock Management',
    contactNumber: '09541790778',
    preferredContactMethod: 'Phone Call',
  },
  {
    id: '#1236',
    subject: 'Unable to login',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'In progress',
    priority: 'High',
    createdAt: '2026-08-15 08:45',
    description:
      'Pharmacist account receives an unexpected invalid credentials error despite using correct password.',
    assignee: 'Althea Alvarez',
    stepsTaken: [
      '1. Go to Login page',
      '2. Enter email and password',
      '3. Click Sign In',
      '4. Error message appears',
    ],
    category: 'Authentication',
    subcategory: 'Login Failure',
    affectedModule: 'User Login',
    contactNumber: '09171234567',
    preferredContactMethod: 'Email',
  },
  {
    id: '#1237',
    subject: 'Report not generating',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Resolved',
    priority: 'High',
    createdAt: '2026-08-13 11:20',
    description:
      'Monthly sales PDF export fails with 500 server error response when date range spans multiple months.',
    assignee: 'James Mercado',
    stepsTaken: [
      '1. Open Reports module',
      '2. Select date range',
      '3. Click Export PDF',
      '4. Page crashes with error 500',
    ],
    category: 'Reports',
    subcategory: 'Export Error',
    affectedModule: 'Analytics & Reports',
    contactNumber: '09987654321',
    preferredContactMethod: 'Email',
  },
  {
    id: '#1238',
    subject: 'System slow',
    requester: 'Denmar Redondo',
    pharmacy: 'PureMed Pharmacy',
    status: 'Open',
    priority: 'High',
    createdAt: '2026-08-15 16:00',
    description:
      'Dashboard takes over 10 seconds to load during peak store hours.',
    assignee: 'James Mercado',
    stepsTaken: [
      '1. Navigate to Dashboard',
      '2. Wait for cards and map to render',
      '3. Notice high loading latency',
    ],
    category: 'Performance',
    subcategory: 'Latency',
    affectedModule: 'Dashboard Overview',
    contactNumber: '09223334444',
    preferredContactMethod: 'SMS',
  },
]

const ASSIGNEES = ['James Mercado', 'Abigail Barrion', 'Althea Alvarez', 'Denmar Redondo', 'James Orlanes']

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedPharmacy, setSelectedPharmacy] = useState('All')

  // State for displaying the dedicated Ticket Details Page
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null)

  // Edit form state inside Ticket Details Page
  const [assigneeForm, setAssigneeForm] = useState('')
  const [statusForm, setStatusForm] = useState<Ticket['status']>('Open')
  const [priorityForm, setPriorityForm] = useState<Ticket['priority']>('High')
  const [resolutionDetailsForm, setResolutionDetailsForm] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Calculate dynamic counts for KPI cards
  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'Open').length
  const inProgressTickets = tickets.filter((t) => t.status === 'In progress').length
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length
  const closedTickets = tickets.filter((t) => t.status === 'Closed').length

  const handleOpenDetails = (ticket: Ticket) => {
    setSelectedTicketForDetails(ticket)
    setAssigneeForm(ticket.assignee)
    setStatusForm(ticket.status)
    setPriorityForm(ticket.priority)
    setResolutionDetailsForm(
      ticket.resolutionDetails ||
        'The reported issue has been reviewed and addressed. The necessary actions have been taken to resolve the concern. The issue has been resolved accordingly.'
    )
    setUpdateSuccess(false)
  }

  const handleSaveTicketManagement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicketForDetails) return

    const updated: Ticket = {
      ...selectedTicketForDetails,
      assignee: assigneeForm,
      status: statusForm,
      priority: priorityForm,
      resolutionDetails: statusForm === 'Resolved' ? resolutionDetailsForm : selectedTicketForDetails.resolutionDetails,
    }

    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelectedTicketForDetails(updated)
    setUpdateSuccess(true)
    setTimeout(() => setUpdateSuccess(false), 3000)
  }

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

  /* ========================================================================= */
  /* DETAILED TICKET PAGE VIEW (When View button is clicked)                     */
  /* ========================================================================= */
  if (selectedTicketForDetails) {
    const t = selectedTicketForDetails

    return (
      <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm space-y-6 animate-fade-in max-w-[1400px]">
        {/* Top Header & Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[clamp(1.2rem,2.2vw,2rem)] font-bold">
            <span className="text-gray-300">Tickets</span>
            <span className="text-gray-400 font-normal">&gt;</span>
            <span className="text-[#8ccfed]">Ticket {t.id}</span>
          </div>
          <button
            onClick={() => setSelectedTicketForDetails(null)}
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
              <span className="text-white font-semibold text-sm">{t.id}</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    t.status === 'Open'
                      ? 'bg-[#ef4444]'
                      : t.status === 'Closed'
                      ? 'bg-[#f59e0b]'
                      : t.status === 'In progress'
                      ? 'bg-[#4ade80]'
                      : 'bg-[#38bdf8]'
                  }`}
                />
                <span className={`font-semibold text-sm ${getStatusColor(t.status)}`}>{t.status}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Priority</span>
              <span className={`font-semibold text-sm ${getPriorityColor(t.priority)}`}>{t.priority}</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Date Created</span>
              <span className="text-gray-200 font-medium text-sm">{t.createdAt}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Subject</span>
              <span className="text-white font-medium text-sm">{t.subject}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Pharmacy</span>
              <span className="text-gray-200 font-medium text-sm">{t.pharmacy}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Requester</span>
              <span className="text-gray-200 font-medium text-sm">{t.requester}</span>
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

          <form onSubmit={handleSaveTicketManagement} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

            {t.status === 'Resolved' && (
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
            <p className="text-gray-300 text-xs leading-relaxed m-0">{t.description}</p>
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
              {t.stepsTaken.map((step, i) => (
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
              <div className="text-gray-200 font-medium pl-5">{t.category}</div>
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
              <div className="text-gray-200 font-medium pl-5">{t.subcategory}</div>
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
              <div className="text-gray-200 font-medium pl-5">{t.affectedModule}</div>
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
              <div className="text-gray-200 font-medium pl-5">{t.requester}</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Contact Number
              </div>
              <div className="text-gray-200 font-medium pl-5">{t.contactNumber}</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Preferred Contact Method
              </div>
              <div className="text-gray-200 font-medium pl-5">{t.preferredContactMethod}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ========================================================================= */
  /* MAIN TICKETS LIST PAGE VIEW                                               */
  /* ========================================================================= */
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
                        onClick={() => handleOpenDetails(ticket)}
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
