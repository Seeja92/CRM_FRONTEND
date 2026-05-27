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
    owner?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search)   params.append('search',   filters.search);
    if (filters?.status)   params.append('status',   filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.source)   params.append('source',   filters.source);
    if (filters?.owner)    params.append('owner',    filters.owner);

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