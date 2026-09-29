"use client";
import React from 'react';

export default function PrintButton() {
  return (
    <button 
      type="button" 
      onClick={() => window.print()}
      style={{ padding: '8px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
    >
      Cetak Invoice
    </button>
  );
}
