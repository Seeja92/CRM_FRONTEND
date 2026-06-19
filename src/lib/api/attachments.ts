const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getToken = () => localStorage.getItem('access');

export const attachmentsApi = {
  getAll: async (entityType: string, entityId: number) => {
    const res = await fetch(
      `${BASE_URL}/attachments/?entity_type=${entityType}&entity_id=${entityId}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    if (!res.ok) throw new Error('Failed to fetch attachments');
    return res.json();
  },

  upload: async (entityType: string, entityId: number, file: File) => {
    const formData = new FormData();
    formData.append('entity_type', entityType);
    formData.append('entity_id',   String(entityId));
    formData.append('file',        file);

    const res = await fetch(`${BASE_URL}/attachments/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload attachment');
    return res.json();
  },

  delete: async (id: number) => {
    const res = await fetch(`${BASE_URL}/attachments/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error('Failed to delete attachment');
  },
};