import React, { createContext, useContext, useState, useEffect } from 'react'

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

export const INITIAL_TICKETS: Ticket[] = [
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
    resolutionDetails:
      'The reported issue has been reviewed and addressed. The necessary actions have been taken to resolve the concern. The issue has been resolved accordingly.',
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

interface TicketContextType {
  tickets: Ticket[]
  updateTicket: (ticket: Ticket) => void
  getTicketById: (id: string) => Ticket | undefined
}

const TicketContext = createContext<TicketContextType | undefined>(undefined)

const STORAGE_KEY = 'pharmadali_tickets'

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading tickets from localStorage:', error)
    }
    return INITIAL_TICKETS
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
    } catch (error) {
      console.error('Error saving tickets to localStorage:', error)
    }
  }, [tickets])

  const updateTicket = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const getTicketById = (id: string) => {
    const formattedId = id.startsWith('#') ? id : `#${id}`
    return tickets.find((t) => t.id === formattedId || t.id.replace('#', '') === id)
  }

  return (
    <TicketContext.Provider
      value={{
        tickets,
        updateTicket,
        getTicketById,
      }}
    >
      {children}
    </TicketContext.Provider>
  )
}

const DEFAULT_FALLBACK: TicketContextType = {
  tickets: INITIAL_TICKETS,
  updateTicket: () => {},
  getTicketById: (id: string) => {
    const formattedId = id.startsWith('#') ? id : `#${id}`
    return INITIAL_TICKETS.find((t) => t.id === formattedId || t.id.replace('#', '') === id)
  },
}

export const useTickets = () => {
  const context = useContext(TicketContext)
  if (!context) {
    return DEFAULT_FALLBACK
  }
  return context
}
