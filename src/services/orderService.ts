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

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  countryName?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface Order {
  id?: string;
  reference: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  promotion_id?: string;
  promotion_code?: string;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  sumup_checkout_id?: string;
  sumup_transaction_code?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Status labels in French
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
  cancelled: 'Annulé',
};

// Status colors for UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

/**
 * Create a new order
 */
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
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
      discount_amount: order.discount_amount || 0,
      promotion_id: order.promotion_id,
      promotion_code: order.promotion_code,
      shipping_cost: order.shipping_cost,
      total: order.total,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      notes: order.notes,
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
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  additionalData?: Partial<Order>
): Promise<Order | null> {
  const updateData: Record<string, unknown> = {
    status,
    ...additionalData,
  };

  if (paymentStatus) {
    updateData.payment_status = paymentStatus;
  }

  // Auto-set timestamps
  if (status === 'shipped' && !additionalData?.shipped_at) {
    updateData.shipped_at = new Date().toISOString();
  }
  if (status === 'delivered' && !additionalData?.delivered_at) {
    updateData.delivered_at = new Date().toISOString();
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
 * Update order (general update)
 */
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
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
export async function getAllOrders(filters?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  if (filters?.search) {
    query = query.or(`reference.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

/**
 * Get orders statistics
 */
export async function getOrdersStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}> {
  const { data, error } = await supabase
    .from('orders')
    .select('status, total, payment_status');

  if (error) {
    console.error('Error fetching orders stats:', error);
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0,
    };
  }

  const orders = data || [];
  const paidOrders = orders.filter(o => o.payment_status === 'paid');

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: paidOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  };
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
