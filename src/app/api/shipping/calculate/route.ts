import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shipping';

export async function POST(req: NextRequest) {
  try {
    const { state, city, pincode, subtotal } = await req.json();

    const numericSubtotal = typeof subtotal === 'number' ? subtotal : parseFloat(subtotal || '0');

    const result = calculateShipping(state || '', city || '', pincode || '', numericSubtotal);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Shipping calculation error:', err);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
