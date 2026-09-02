import { useState, useCallback } from 'react';
import * as ticketService from '../services/ticketService';

export const useTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTickets(params);
      setTickets(data?.data?.data || data?.data || []); 
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicket = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTicket(id);
      setTicket(data.data || data); // handle standard successResponse wrapper
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (id: string | number, status: string) => {
    try {
      await ticketService.updateTicketStatus(id, status);
      if (ticket) setTicket({ ...ticket, status });
    } catch (err) {
      throw err;
    }
  };

  const sendMessage = async (id: string | number, formData: FormData) => {
    try {
      const res = await ticketService.sendTicketMessage(id, formData);
      const newMessage = res.data || res;
      if (ticket) {
        setTicket({
          ...ticket,
          messages: [...(ticket.messages || []), newMessage]
        });
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    tickets,
    ticket,
    loading,
    error,
    fetchTickets,
    fetchTicket,
    updateStatus,
    sendMessage,
  };
};