const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getToken = () => localStorage.getItem('token');

export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any
) => {
   
 
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
};
