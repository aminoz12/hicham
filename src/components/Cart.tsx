import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice, calculateItemPrice } from '@/utils';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';

const Cart: React.FC = () => {
  const { 
    items, 
    total, 
    itemCount, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCartStore();
  
  const { toggleCart } = useUIStore();
  const { t } = useTranslation('products');
  const { t: tCommon } = useTranslation('common');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    removeItem(itemId);
    toast.success(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleWhatsAppOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Create short order message
    let message = `🛍️ *${tCommon('newOrder')}*\n\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   ${item.selectedColor} • ${item.selectedSize} • Qty: ${item.quantity}\n`;
      message += `   ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });
    
    message += `💰 *${tCommon('totalAmount')}: ${formatPrice(total)}*\n\n`;
    message += `📞 ${tCommon('pleaseConfirm')}.`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/33626157421?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    toast.success('Opening WhatsApp to place your order!');
    
    // Close cart
    toggleCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleCart}
      />

      {/* Cart Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full p-6 text-center"
              >
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Add some beautiful items to get started
                </p>
                <Link
                  to="/products"
                  onClick={toggleCart}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              <div className="p-6 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor} • {item.selectedSize}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(calculateItemPrice(item.product, item.quantity))}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.product.name)}
                      className="p-1 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-gray-200 p-6 space-y-4"
          >
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="text-gray-900">Total:</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppOrder}
                className="btn-primary w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t('orderViaWhatsApp')}</span>
              </button>
              
              <div className="flex space-x-2">
                <Link
                  to="/products"
                  onClick={toggleCart}
                  className="btn-secondary flex-1 text-center"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleClearCart}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Info */}
            <div className="text-xs text-gray-500 text-center">
              📱 Order via WhatsApp • Free shipping on orders over $75
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Cart;
