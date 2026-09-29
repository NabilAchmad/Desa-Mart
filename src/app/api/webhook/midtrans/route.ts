import { NextResponse } from 'next/server';
import { syncOrderPayment } from '@/lib/order-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, transaction_status } = body;
    
    if (!order_id || !transaction_status) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    await syncOrderPayment(order_id, transaction_status);

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Error processing webhook' }, { status: 500 });
  }
}
