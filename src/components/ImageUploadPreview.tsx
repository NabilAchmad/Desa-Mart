"use client"
import React, { useState } from 'react';

interface ImageUploadPreviewProps {
  name: string;
  defaultImageUrl?: string;
}

export default function ImageUploadPreview({ name, defaultImageUrl }: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(defaultImageUrl || null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {previewUrl ? (
        <img 
          src={previewUrl} 
          alt="Preview" 
          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }} 
        />
      ) : (
        <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed var(--border)', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
          Belum ada foto
        </div>
      )}
      <input 
        type="file" 
        name={name} 
        accept="image/*" 
        onChange={handleFileChange}
        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', flex: 1 }} 
      />
    </div>
  );
}
