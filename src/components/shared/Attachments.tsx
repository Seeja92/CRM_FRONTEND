
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import { attachmentsApi } from '@/lib/api/attachments';

interface Attachment {
  id: number;
  file_name: string;
  file: string;
  uploaded_at: string;
}

interface AttachmentsProps {
  entityType: string;
  entityId: number;
}

export default function Attachments({ entityType, entityId }: AttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading]         = useState(true);

  // ── Fetch Attachments ─────────────────────────────────────────────────────
  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const data = await attachmentsApi.getAll(entityType, entityId);
      setAttachments(data);
    } catch (err) {
      console.error('Failed to fetch attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityType && entityId) fetchAttachments();
  }, [entityType, entityId]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleAddAttachment = () => {
    const input = document.createElement('input');
    input.type  = 'file';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await attachmentsApi.upload(entityType, entityId, file);
        await fetchAttachments();
      } catch (err) {
        console.error('Failed to upload attachment:', err);
      }
    };
    input.click();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await attachmentsApi.delete(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #eee', p: 2 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardArrowRightIcon sx={{ fontSize: 16, color: '#555' }} />
          <AttachFileOutlinedIcon sx={{ fontSize: 16, color: '#555' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Attachments</Typography>
        </Box>
        <Box onClick={handleAddAttachment} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
          <AddIcon sx={{ fontSize: 15, color: '#6c63ff' }} />
          <Typography sx={{ fontSize: 12, color: '#6c63ff', fontWeight: 500 }}>Add</Typography>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} sx={{ color: '#6c63ff' }} />
        </Box>
      ) : attachments.length === 0 ? (
        <Typography sx={{ fontSize: 12, color: '#aaa' }}>
          See the files attached to your activities or uploaded to this record.
        </Typography>
      ) : (
        <Box>
          <Typography sx={{ fontSize: 11, color: '#aaa', mb: 1 }}>Recently uploaded</Typography>
          {attachments.map((file) => (
            <Box key={file.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #eee', borderRadius: 1.5, p: 1, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AttachFileOutlinedIcon sx={{ fontSize: 18, color: '#aaa' }} />
                </Box>
                <Box>
                  <Typography
                    component="a"
                    href={`http://localhost:8000${file.file}`}
                    target="_blank"
                    sx={{ fontSize: 12, fontWeight: 500, color: '#6c63ff', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {file.file_name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#aaa' }}>
                    {new Date(file.uploaded_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => handleDelete(file.id)}
                sx={{ p: 0.3, color: '#aaa', '&:hover': { color: '#e53935' } }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}