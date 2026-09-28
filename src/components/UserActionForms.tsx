"use client"

import { updateUserRole, deleteUser } from '@/app/actions/admin';
import { useState, useTransition } from 'react';

export default function UserActionForms({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateUserRole(formData);
        alert('Role berhasil diperbarui!');
      } catch (err) {
        alert('Gagal memperbarui role.');
      }
    });
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm('Yakin ingin menghapus pengguna ini secara permanen?')) return;
    
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await deleteUser(formData);
        alert('Pengguna berhasil dihapus!');
      } catch (err) {
        alert('Gagal menghapus pengguna.');
      }
    });
  };

  return (
    <>
      <td>
        <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '8px' }}>
          <input type="hidden" name="id" value={user.id} />
          <select 
            name="role" 
            defaultValue={user.role} 
            disabled={isPending}
            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="USER">User</option>
            <option value="VILLAGE_HEAD">Kepala Desa</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button 
            type="submit" 
            className="action-btn" 
            style={{ background: '#3b82f6', color: 'white', opacity: isPending ? 0.7 : 1 }}
            disabled={isPending}
          >
            {isPending ? '...' : 'Update'}
          </button>
        </form>
      </td>
      <td style={{ color: '#64748b', fontSize: '0.9rem' }}>
        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </td>
      <td>
        <form onSubmit={handleDelete}>
          <input type="hidden" name="id" value={user.id} />
          <button 
            type="submit" 
            className="action-btn btn-delete" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: isPending ? 0.7 : 1 }}
            disabled={isPending}
          >
            🗑️ Hapus
          </button>
        </form>
      </td>
    </>
  );
}
