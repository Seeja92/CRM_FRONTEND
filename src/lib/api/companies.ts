const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Token ${getToken()}`,
});

export const getCompanies = async (params?: any) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/${query ? '?' + query : ''}`, {
    headers: headers(),
  });
  return res.json();
};

export const getCompany = async (id: number) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/${id}/`, {
    headers: headers(),
  });
  return res.json();
};

export const createCompany = async (data: any) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateCompany = async (id: number, data: any) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/${id}/`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const patchCompany = async (id: number, data: any) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteCompany = async (id: number) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/${id}/`, {
    method: 'DELETE',
    headers: headers(),
  });
  return res;
};

export const searchCompanies = async (query: string) => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/companies/search/?q=${query}`, {
    headers: headers(),
  });
  return res.json();
};

// ── Users (for company owner dropdown) ───────────────────────────────────────
export const getUsers = async () => {
  const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/auth/users/`, {
    headers: headers(),
  });
  return res.json();
};