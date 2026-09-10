import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    const rules = db.prepare(`SELECT * FROM shipping_rules ORDER BY rule_type, rule_value`).all();
    const freeShipping = db.prepare(`SELECT value FROM store_settings WHERE key = 'free_shipping_threshold'`).get() as any;

    return NextResponse.json({
      rules,
      freeShippingThreshold: freeShipping ? parseFloat(freeShipping.value) : 999,
    });
  } catch (err: any) {
    console.error('Fetch shipping error:', err);
    return NextResponse.json({ error: 'Failed to fetch shipping configuration' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { ruleType, ruleValue, rate, freeShippingThreshold } = await req.json();
    const db = getDb();

    if (freeShippingThreshold !== undefined) {
      db.prepare(`
        INSERT OR REPLACE INTO store_settings (key, value) 
        VALUES ('free_shipping_threshold', ?)
      `).run(String(freeShippingThreshold));
    }

    if (ruleType && ruleValue && rate !== undefined) {
      db.prepare(`
        INSERT INTO shipping_rules (rule_type, rule_value, rate)
        VALUES (?, LOWER(?), ?)
      `).run(ruleType, ruleValue.trim(), parseFloat(rate));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Save shipping error:', err);
    return NextResponse.json({ error: 'Failed to save shipping rule' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`DELETE FROM shipping_rules WHERE id = ?`).run(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete shipping rule error:', err);
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
