import { supabase } from '@/lib/supabase';

export interface Promotion {
  id: string;
  name: string;
  code?: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_categories?: string[];
  applicable_products?: string[];
  usage_limit?: number;
  usage_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface AppliedPromotion {
  promotion: Promotion;
  discountAmount: number;
}

/**
 * Fetch all promotions from database
 */
export async function fetchPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch active promotions only
 */
export async function fetchActivePromotions(): Promise<Promotion[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('discount_value', { ascending: false });

  if (error) {
    console.error('Error fetching active promotions:', error);
    return [];
  }

  return data || [];
}

/**
 * Save a promotion (create or update)
 */
export async function savePromotion(promotion: Partial<Promotion>): Promise<Promotion | null> {
  const now = new Date().toISOString();
  
  const promotionData = {
    name: promotion.name,
    code: promotion.code?.toUpperCase(),
    description: promotion.description,
    discount_type: promotion.discount_type,
    discount_value: promotion.discount_value,
    start_date: promotion.start_date,
    end_date: promotion.end_date,
    is_active: promotion.is_active ?? true,
    min_purchase_amount: promotion.min_purchase_amount,
    max_discount_amount: promotion.max_discount_amount,
    applicable_categories: promotion.applicable_categories,
    applicable_products: promotion.applicable_products,
    usage_limit: promotion.usage_limit,
    updated_at: now,
  };

  if (promotion.id) {
    // Update existing
    const { data, error } = await supabase
      .from('promotions')
      .update(promotionData)
      .eq('id', promotion.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating promotion:', error);
      throw new Error(error.message);
    }
    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        ...promotionData,
        usage_count: 0,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion:', error);
      throw new Error(error.message);
    }
    return data;
  }
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting promotion:', error);
    throw new Error(error.message);
  }
}

/**
 * Find promotion by code
 */
export async function findPromotionByCode(code: string): Promise<Promotion | null> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .single();

  if (error) {
    console.error('Error finding promotion:', error);
    return null;
  }

  return data;
}

/**
 * Calculate discount for a cart
 */
export function calculatePromotionDiscount(
  promotion: Promotion,
  cartTotal: number,
  cartItems?: Array<{ product: { id: string; category: string }; quantity: number; price: number }>
): number {
  // Check minimum purchase amount
  if (promotion.min_purchase_amount && cartTotal < promotion.min_purchase_amount) {
    return 0;
  }

  // Check usage limit
  if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
    return 0;
  }

  let eligibleAmount = cartTotal;

  // If promotion is category-specific, calculate only eligible items
  if (promotion.applicable_categories && promotion.applicable_categories.length > 0 && cartItems) {
    eligibleAmount = cartItems
      .filter(item => promotion.applicable_categories!.includes(item.product.category))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // If promotion is product-specific, calculate only eligible items
  if (promotion.applicable_products && promotion.applicable_products.length > 0 && cartItems) {
    eligibleAmount = cartItems
      .filter(item => promotion.applicable_products!.includes(item.product.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  if (eligibleAmount <= 0) {
    return 0;
  }

  // Calculate discount
  let discount = 0;
  if (promotion.discount_type === 'percentage') {
    discount = (eligibleAmount * promotion.discount_value) / 100;
  } else {
    discount = promotion.discount_value;
  }

  // Apply max discount cap if set
  if (promotion.max_discount_amount && discount > promotion.max_discount_amount) {
    discount = promotion.max_discount_amount;
  }

  // Discount cannot exceed cart total
  if (discount > cartTotal) {
    discount = cartTotal;
  }

  return Math.round(discount * 100) / 100;
}

/**
 * Get best automatic promotion for cart
 */
export async function getBestAutomaticPromotion(
  cartTotal: number,
  cartItems?: Array<{ product: { id: string; category: string }; quantity: number; price: number }>
): Promise<AppliedPromotion | null> {
  const activePromotions = await fetchActivePromotions();
  
  // Filter promotions without codes (automatic promotions)
  const automaticPromotions = activePromotions.filter(p => !p.code);
  
  let bestPromotion: AppliedPromotion | null = null;
  
  for (const promotion of automaticPromotions) {
    const discount = calculatePromotionDiscount(promotion, cartTotal, cartItems);
    
    if (discount > 0 && (!bestPromotion || discount > bestPromotion.discountAmount)) {
      bestPromotion = {
        promotion,
        discountAmount: discount
      };
    }
  }
  
  return bestPromotion;
}

/**
 * Increment usage count for a promotion
 */
export async function incrementPromotionUsage(promotionId: string): Promise<void> {
  // Try with parameter name p_promotion_id first, then promotion_id
  let { error } = await supabase.rpc('increment_promotion_usage', {
    p_promotion_id: promotionId
  });

  // If function doesn't exist or wrong params, try direct update
  if (error) {
    console.log('RPC failed, trying direct update:', error.message);
    const { error: updateError } = await supabase
      .from('promotions')
      .update({ 
        usage_count: supabase.rpc('coalesce', { value: 'usage_count', default_value: 0 }) 
      })
      .eq('id', promotionId);
    
    // Final fallback: simple increment
    if (updateError) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('usage_count')
        .eq('id', promotionId)
        .single();
      
      if (promo) {
        await supabase
          .from('promotions')
          .update({ usage_count: (promo.usage_count || 0) + 1 })
          .eq('id', promotionId);
      }
    }
  }
}


