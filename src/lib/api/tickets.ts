const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Token ${getToken()}`,
});

export const ticketsApi = {
  getAll: async (filters?: {
    search?: string;
    status?: string;
    priority?: string;
    source?: string;
    owner?: number;
    date_from?: string;
    date_to?: string;
    city?: string; 
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.owner !== undefined) {
      params.append('owner', String(filters.owner));
    }
     if (filters?.city) params.append("city", filters.city);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
   

    const res = await fetch(
      `${NEXT_PUBLIC_API_BASE_URL}/tickets/${params.toString() ? `?${params.toString()}` : ''}`,
      { headers: headers() }
    );
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/tickets/${id}/`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch ticket');
    return res.json();
  },

  create: async (data: object) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/tickets/`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    return res.json();
  },

  update: async (id: string, data: object) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/tickets/${id}/`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/tickets/${id}/`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to delete ticket');
  },
};