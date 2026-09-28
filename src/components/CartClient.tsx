"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { updateCartQuantity, removeFromCart } from '@/app/actions/cart';

type CartItemType = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    store: {
      id: string;
      name: string;
    }
  }
}

export default function CartClient({ initialCartItems }: { initialCartItems: CartItemType[] }) {
  // Store selected cartItem IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // By default, select all items
    setSelectedIds(initialCartItems.map(i => i.id));
  }, [initialCartItems]);

  const handleSelectStore = (storeId: string, isChecked: boolean) => {
    const storeItemIds = initialCartItems.filter(i => i.product.store.id === storeId).map(i => i.id);
    if (isChecked) {
      setSelectedIds(prev => Array.from(new Set([...prev, ...storeItemIds])));
    } else {
      setSelectedIds(prev => prev.filter(id => !storeItemIds.includes(id)));
    }
  };

  const handleSelectItem = (itemId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds(prev => [...prev, itemId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== itemId));
    }
  };

  // Group items by store
  const groupedItems = initialCartItems.reduce((acc, item) => {
    const storeId = item.product.store.id;
    if (!acc[storeId]) acc[storeId] = { store: item.product.store, items: [] };
    acc[storeId].items.push(item);
    return acc;
  }, {} as Record<string, { store: any, items: CartItemType[] }>);

  const selectedItems = initialCartItems.filter(i => selectedIds.includes(i.id));
  const total = selectedItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const allSelected = selectedIds.length > 0 && selectedIds.length === initialCartItems.length;
  
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds(initialCartItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginTop: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Pilih Semua Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <input 
            type="checkbox" 
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }} 
          />
          <strong style={{ fontSize: '1.1rem' }}>Pilih Semua Barang</strong>
        </div>

        {Object.values(groupedItems).map(group => {
          const storeItemIds = group.items.map(i => i.id);
          const isStoreSelected = storeItemIds.every(id => selectedIds.includes(id));

          return (
            <div key={group.store.id} style={{ background: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              
              {/* Store Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                 <input 
                   type="checkbox" 
                   checked={isStoreSelected}
                   onChange={(e) => handleSelectStore(group.store.id, e.target.checked)}
                   style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} 
                 />
                 <span style={{ fontSize: '1.2rem' }}>🏪</span>
                 <strong style={{ fontSize: '1.1rem' }}>{group.store.name}</strong>
                 <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>Toko Desa</span>
              </div>

              {/* Items */}
              <div style={{ padding: '0 24px' }}>
                {group.items.map((item, index) => (
                  <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '24px 0', borderBottom: index === group.items.length - 1 ? 'none' : '1px solid var(--border)', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} 
                    />
                    <img src={item.product.imageUrl || ''} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>{item.product.name}</h4>
                      <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '1.1rem' }}>Rp {item.product.price.toLocaleString('id-ID')}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', height: '40px' }}>
                        <form action={updateCartQuantity} style={{ margin: 0, display: 'flex', height: '100%' }}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <input type="hidden" name="action" value="decrease" />
                          <button type="submit" disabled={item.quantity <= 1} style={{ width: '40px', background: 'var(--background)', border: 'none', borderRight: '1px solid var(--border)', cursor: item.quantity > 1 ? 'pointer' : 'not-allowed', fontSize: '1.2rem', color: item.quantity > 1 ? 'inherit' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                        </form>
                        <span style={{ width: '40px', textAlign: 'center', fontWeight: '600', fontSize: '1.1rem' }}>{item.quantity}</span>
                        <form action={updateCartQuantity} style={{ margin: 0, display: 'flex', height: '100%' }}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <input type="hidden" name="action" value="increase" />
                          <button type="submit" style={{ width: '40px', background: 'var(--background)', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </form>
                      </div>
                      
                      <form action={removeFromCart} style={{ margin: 0, display: 'flex' }}>
                        <input type="hidden" name="cartItemId" value={item.id} />
                        <button type="submit" style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: '8px', transition: '0.2s' }} title="Hapus">🗑️</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="form-card" style={{ padding: '32px', height: 'fit-content', position: 'sticky', top: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Ringkasan Belanja</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Harga ({selectedItems.length} barang)</span>
          <strong style={{ fontSize: '1.2rem' }}>Rp {total.toLocaleString('id-ID')}</strong>
        </div>
        
        {selectedItems.length > 0 ? (
          <Link href={`/checkout?items=${selectedIds.join(',')}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
            Beli ({selectedItems.length})
          </Link>
        ) : (
          <button disabled className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>
            Pilih Barang Dulu
          </button>
        )}
      </div>
    </div>
  );
}
