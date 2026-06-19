const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getToken = () => localStorage.getItem('access');

export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any
) => {
   
 console.log("TOKEN:", getToken);
  const res = await fetch(`${NEXT_PUBLIC_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
};
