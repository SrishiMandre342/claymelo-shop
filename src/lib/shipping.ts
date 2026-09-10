import { getDb } from './db';

export interface ShippingCalculationResult {
  shippingFee: number;
  freeShippingApplied: boolean;
  freeShippingThreshold: number | null;
  ruleMatched: string;
}

export function calculateShipping(
  state: string,
  city: string,
  pincode: string,
  subtotal: number
): ShippingCalculationResult {
  const db = getDb();

  // Normalize inputs
  const normState = (state || '').trim().toLowerCase();
  const normCity = (city || '').trim().toLowerCase();
  const normPincode = (pincode || '').trim();

  // Check store settings for global free shipping threshold
  const freeShipSetting = db.prepare(`SELECT value FROM store_settings WHERE key = 'free_shipping_threshold'`).get() as { value: string } | undefined;
  const freeThreshold = freeShipSetting ? parseFloat(freeShipSetting.value) : 999;

  if (freeThreshold > 0 && subtotal >= freeThreshold) {
    return {
      shippingFee: 0,
      freeShippingApplied: true,
      freeShippingThreshold: freeThreshold,
      ruleMatched: `Free shipping on orders above ₹${freeThreshold}`,
    };
  }

  // 1. Check exact pincode rule
  if (normPincode) {
    const pinRule = db.prepare(`
      SELECT rate FROM shipping_rules 
      WHERE rule_type = 'pincode' AND rule_value = ? 
      LIMIT 1
    `).get(normPincode) as { rate: number } | undefined;

    if (pinRule) {
      return {
        shippingFee: pinRule.rate,
        freeShippingApplied: false,
        freeShippingThreshold: freeThreshold,
        ruleMatched: `Pincode rate (${normPincode})`,
      };
    }
  }

  // 2. Check city rule
  if (normCity) {
    const cityRule = db.prepare(`
      SELECT rate FROM shipping_rules 
      WHERE rule_type = 'city' AND LOWER(rule_value) = ? 
      LIMIT 1
    `).get(normCity) as { rate: number } | undefined;

    if (cityRule) {
      return {
        shippingFee: cityRule.rate,
        freeShippingApplied: false,
        freeShippingThreshold: freeThreshold,
        ruleMatched: `City rate (${city})`,
      };
    }
  }

  // 3. Check state rule
  if (normState) {
    const stateRule = db.prepare(`
      SELECT rate FROM shipping_rules 
      WHERE rule_type = 'state' AND LOWER(rule_value) = ? 
      LIMIT 1
    `).get(normState) as { rate: number } | undefined;

    if (stateRule) {
      return {
        shippingFee: stateRule.rate,
        freeShippingApplied: false,
        freeShippingThreshold: freeThreshold,
        ruleMatched: `State rate (${state})`,
      };
    }
  }

  // 4. Default fallback shipping charge
  const defaultRule = db.prepare(`
    SELECT rate FROM shipping_rules 
    WHERE rule_type = 'default' 
    LIMIT 1
  `).get() as { rate: number } | undefined;

  const defaultFee = defaultRule ? defaultRule.rate : 79;

  return {
    shippingFee: defaultFee,
    freeShippingApplied: false,
    freeShippingThreshold: freeThreshold,
    ruleMatched: 'Standard Flat Rate',
  };
}
