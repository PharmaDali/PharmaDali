import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTickets as useApiTickets } from '../hooks/useTickets';

export interface Ticket {
  id: string
  subject: string
  requester: string
  pharmacy: string
  status: 'Open' | 'Closed' | 'In progress' | 'Resolved'
  priority: 'High' | 'Medium' | 'Low' | 'Urgent'
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
  messages?: any[]
  originalId?: string | number
}

interface TicketContextType {
  tickets: Ticket[]
  updateTicket: (ticket: Ticket) => void
  getTicketById: (id: string) => Ticket | undefined
  fetchTickets: () => void
  fetchTicket: (id: string | number) => void
  sendMessage: (id: string | number, formData: FormData) => Promise<void>
  updateStatus: (id: string | number, status: string) => Promise<void>
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    tickets: apiTickets, 
    ticket: apiTicketDetail, 
    fetchTickets: loadTickets, 
    fetchTicket: loadTicket,
    updateStatus: apiUpdateStatus,
    sendMessage: apiSendMessage
  } = useApiTickets();

  const [formattedTickets, setFormattedTickets] = useState<Ticket[]>([]);

  const mapApiTicket = (apiTicket: any): Ticket => {
    return {
      id: `#${apiTicket.id}`,
      subject: apiTicket.title,
      requester: apiTicket.user ? `${apiTicket.user.first_name} ${apiTicket.user.last_name}` : 'Unknown',
      pharmacy: 'Pharmacy',
      status: apiTicket.status === 'in_progress' ? 'In progress' : (apiTicket.status.charAt(0).toUpperCase() + apiTicket.status.slice(1)) as any,
      priority: apiTicket.priority.charAt(0).toUpperCase() + apiTicket.priority.slice(1) as any,
      createdAt: new Date(apiTicket.created_at).toLocaleString(),
      description: apiTicket.description,
      assignee: apiTicket.assignee ? `${apiTicket.assignee.first_name} ${apiTicket.assignee.last_name}` : 'Unassigned',
      stepsTaken: apiTicket.steps_taken || [],
      category: apiTicket.category,
      subcategory: apiTicket.subcategory || '',
      affectedModule: apiTicket.affected_module || '',
      contactNumber: apiTicket.contact_number || '',
      preferredContactMethod: apiTicket.preferred_contact_method || 'Email',
      resolutionDetails: apiTicket.resolution_details,
      messages: apiTicket.messages || [],
      originalId: apiTicket.id
    };
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      loadTickets();
    }
  }, [loadTickets]);

  useEffect(() => {
    if (apiTickets) {
      setFormattedTickets(apiTickets.map(mapApiTicket));
    }
  }, [apiTickets]);

  const updateTicket = async (_updated: Ticket) => {
    // Optimistic local update not fully needed since we have api integration now,
    // but we can support it if the UI relies on it synchronously.
  };

  const getTicketById = (id: string) => {
    if (apiTicketDetail && `#${apiTicketDetail.id}` === (id.startsWith('#') ? id : `#${id}`)) {
      return mapApiTicket(apiTicketDetail);
    }
    const formattedId = id.startsWith('#') ? id : `#${id}`;
    return formattedTickets.find((t) => t.id === formattedId || t.id.replace('#', '') === id);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets: formattedTickets,
        updateTicket,
        getTicketById,
        fetchTickets: loadTickets,
        fetchTicket: loadTicket,
        sendMessage: apiSendMessage,
        updateStatus: apiUpdateStatus
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within TicketProvider');
  }
  return context;
};