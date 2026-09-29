"use client"
import React, { useState } from 'react';

interface CurrencyInputProps {
  name: string;
  required?: boolean;
  placeholder?: string;
  initialValue?: number;
}

export default function CurrencyInput({ name, required = false, placeholder = "Rp 0", initialValue }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (initialValue) {
      return `Rp ${new Intl.NumberFormat('id-ID').format(initialValue)}`;
    }
    return '';
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const rawValue = e.target.value.replace(/\D/g, '');
    
    if (!rawValue) {
      setDisplayValue('');
      return;
    }

    // Format with dot thousand separator
    const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));
    setDisplayValue(`Rp ${formatted}`);
  };

  // The actual raw number to be submitted via FormData
  const rawValue = displayValue.replace(/\D/g, '');

  return (
    <>
      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        required={required}
        style={{ padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)', background: '#ffffff', fontSize: '1.05rem', color: 'var(--text-main)', width: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.02) inset' }}
      />
      {/* Hidden input to pass the raw unformatted numeric value to the server action */}
      <input type="hidden" name={name} value={rawValue} />
    </>
  );
}
