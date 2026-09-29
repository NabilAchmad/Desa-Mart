"use client"
import React, { useState } from 'react';

export default function ModalWrapper({ title, triggerText, children }: { title: string, triggerText: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary" style={{ display: 'inline-block', marginBottom: '24px' }}>
        + {triggerText}
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0 }}>{title}</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'var(--background)', border: '1px solid var(--border)', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>&times;</button>
            </div>
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
