import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color?: string;
  selected_size?: string;
}

export interface Order {
  id?: string;
  reference: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  promotion_id?: string;
  promotion_code?: string;
  shipping_cost: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new order
 */
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      reference: order.reference,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      items: order.items,
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      promotion_id: order.promotion_id,
      promotion_code: order.promotion_code,
      shipping_cost: order.shipping_cost,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      notes: order.notes,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status'],
  paymentStatus?: Order['payment_status']
): Promise<Order | null> {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (paymentStatus) {
    updateData.payment_status = paymentStatus;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get order by reference
 */
export async function getOrderByReference(reference: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('reference', reference)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

/**
 * Get all orders (for admin)
 */
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

/**
 * Convert cart items to order items
 */
export function cartItemsToOrderItems(
  cartItems: Array<{
    product: Product;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
  }>
): OrderItem[] {
  return cartItems.map(item => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
    selected_color: item.selectedColor,
    selected_size: item.selectedSize,
  }));
}



