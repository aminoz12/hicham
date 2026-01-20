import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Tag, X, CheckCircle, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils';
import { toast } from 'react-hot-toast';
import { 
  generateOrderReference,
  initSumUpCardWidget,
  openWhatsAppOrder,
  loadSumUpSDK
} from '@/services/sumupService';
import { 
  findPromotionByCode, 
  calculatePromotionDiscount, 
  getBestAutomaticPromotion,
  incrementPromotionUsage,
  type AppliedPromotion
} from '@/services/promotionService';
import { createOrder, cartItemsToOrderItems } from '@/services/orderService';
import { Helmet } from 'react-helmet-async';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const cardWidgetRef = useRef<any>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'whatsapp'>('card');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [currentOrderRef, setCurrentOrderRef] = useState<string | null>(null);

  // Calculate subtotal (with special hijab pricing)
  const subtotal = items.reduce((sum, item) => {
    if (item.product.category === 'hijabs') {
      if (item.quantity >= 2) {
        const pairs = Math.floor(item.quantity / 2);
        const remaining = item.quantity % 2;
        return sum + (pairs * 25) + (remaining * 13);
      } else {
        return sum + (item.quantity * 13);
      }
    } else {
      return sum + (item.product.price * item.quantity);
    }
  }, 0);

  // Calculate discount
  const discountAmount = appliedPromotion?.discountAmount || 0;
  
  // Calculate final total
  const total = Math.max(0, subtotal - discountAmount);

  // Load SumUp SDK on mount
  useEffect(() => {
    loadSumUpSDK()
      .then(() => setSdkLoaded(true))
      .catch((err) => console.error('Failed to load SumUp SDK:', err));
  }, []);

  // Check for automatic promotions on load
  useEffect(() => {
    const checkAutomaticPromotions = async () => {
      if (items.length === 0) return;
      
      const cartItems = items.map(item => ({
        product: { id: item.product.id, category: item.product.category },
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const bestPromo = await getBestAutomaticPromotion(subtotal, cartItems);
      if (bestPromo && !appliedPromotion) {
        setAppliedPromotion(bestPromo);
        toast.success(`Promotion "${bestPromo.promotion.name}" appliquée automatiquement!`);
      }
    };
    
    checkAutomaticPromotions();
  }, [items, subtotal]);

  useEffect(() => {
    if (items.length === 0 && paymentStatus !== 'success') {
      navigate('/products');
    }
  }, [items, navigate, paymentStatus]);

  // Initialize card widget when SDK is loaded and payment method is card
  useEffect(() => {
    if (sdkLoaded && paymentMethod === 'card' && total > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => {
        initSumUpCardWidget(
          'sumup-card-widget',
          {
            amount: total,
            currency: 'EUR',
            reference: currentOrderRef || generateOrderReference(),
          },
          handlePaymentSuccess,
          handlePaymentError
        ).then(widget => {
          cardWidgetRef.current = widget;
        }).catch(err => {
          console.error('Failed to init card widget:', err);
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [sdkLoaded, paymentMethod, total, paymentStatus]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Veuillez entrer un code promo');
      return;
    }

    setIsApplyingPromo(true);
    
    try {
      const promotion = await findPromotionByCode(promoCode);
      
      if (!promotion) {
        toast.error('Code promo invalide ou expiré');
        return;
      }

      const cartItems = items.map(item => ({
        product: { id: item.product.id, category: item.product.category },
        quantity: item.quantity,
        price: item.product.price
      }));

      const discount = calculatePromotionDiscount(promotion, subtotal, cartItems);
      
      if (discount <= 0) {
        toast.error('Ce code promo ne s\'applique pas à votre panier');
        return;
      }

      setAppliedPromotion({
        promotion,
        discountAmount: discount
      });
      
      toast.success(`Code promo appliqué: -${formatPrice(discount)}`);
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Erreur lors de l\'application du code promo');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    setPromoCode('');
    toast.success('Promotion retirée');
  };

  const handlePaymentSuccess = async (result: any) => {
    console.log('Payment success:', result);
    setPaymentStatus('success');
    
    try {
      const orderReference = currentOrderRef || generateOrderReference();
      
      // Create order in database
      const orderItems = cartItemsToOrderItems(items);
      
      await createOrder({
        reference: orderReference,
        customer_email: customerInfo.email || undefined,
        customer_name: customerInfo.name || undefined,
        customer_phone: customerInfo.phone || undefined,
        items: orderItems,
        subtotal: subtotal,
        discount_amount: discountAmount,
        promotion_id: appliedPromotion?.promotion.id,
        promotion_code: appliedPromotion?.promotion.code,
        shipping_cost: 0,
        total: total,
        status: 'paid',
        payment_method: 'sumup_card',
        payment_status: 'completed',
        notes: `Transaction: ${result?.transaction_code || 'N/A'}`,
      });

      // Increment promotion usage if used
      if (appliedPromotion?.promotion.id) {
        await incrementPromotionUsage(appliedPromotion.promotion.id);
      }
      
      // Clear cart
      clearCart();
      
      toast.success('Paiement réussi! Merci pour votre commande.');
      
    } catch (error) {
      console.error('Error saving order:', error);
      // Payment succeeded but order save failed - still show success
      clearCart();
      toast.success('Paiement réussi!');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setPaymentStatus('failed');
    toast.error('Le paiement a échoué. Veuillez réessayer.');
  };

  const handleWhatsAppOrder = async () => {
    setIsProcessing(true);
    
    try {
      const orderReference = generateOrderReference();
      setCurrentOrderRef(orderReference);
      
      // Create order in database
      const orderItems = cartItemsToOrderItems(items);
      
      await createOrder({
        reference: orderReference,
        customer_email: customerInfo.email || undefined,
        customer_name: customerInfo.name || undefined,
        customer_phone: customerInfo.phone || undefined,
        items: orderItems,
        subtotal: subtotal,
        discount_amount: discountAmount,
        promotion_id: appliedPromotion?.promotion.id,
        promotion_code: appliedPromotion?.promotion.code,
        shipping_cost: 0,
        total: total,
        status: 'pending',
        payment_method: 'whatsapp',
        payment_status: 'pending',
      });

      // Increment promotion usage if used
      if (appliedPromotion?.promotion.id) {
        await incrementPromotionUsage(appliedPromotion.promotion.id);
      }
      
      // Open WhatsApp
      const itemsList = items.map(item => 
        `- ${item.product.name} x${item.quantity} (${formatPrice(item.product.price * item.quantity)})`
      ).join('\n');
      
      openWhatsAppOrder({
        amount: total,
        reference: orderReference,
        items: itemsList,
      });
      
      // Clear cart
      clearCart();
      setPaymentStatus('success');
      toast.success('Commande envoyée via WhatsApp!');
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && paymentStatus !== 'success') {
    return null;
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Commande confirmée - Hijabi Inoor</title>
        </Helmet>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Merci pour votre commande!
          </h1>
          {currentOrderRef && (
            <p className="text-gray-600 mb-2">
              Référence: <strong>{currentOrderRef}</strong>
            </p>
          )}
          <p className="text-gray-600 mb-8">
            Votre commande a été confirmée. Vous recevrez bientôt un email de confirmation.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Checkout - Hijabi Inoor</title>
        <meta name="description" content="Finalisez votre commande avec paiement sécurisé" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vos informations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre nom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+33 6 XX XX XX XX"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Promo Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Code Promo
              </h2>
              
              {appliedPromotion ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">
                        {appliedPromotion.promotion.name}
                      </p>
                      <p className="text-sm text-green-600">
                        -{formatPrice(appliedPromotion.discountAmount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemovePromotion}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Entrez votre code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo}
                    className="btn-secondary px-6"
                  >
                    {isApplyingPromo ? 'Vérification...' : 'Appliquer'}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Méthode de paiement
              </h2>
              
              <div className="space-y-3 mb-6">
                {/* Card Payment Option */}
                <label 
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <CreditCard className={`h-6 w-6 mr-3 ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">Carte bancaire</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, Apple Pay, Google Pay</p>
                  </div>
                </label>

                {/* WhatsApp Option */}
                <label 
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'whatsapp' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="whatsapp"
                    checked={paymentMethod === 'whatsapp'}
                    onChange={() => setPaymentMethod('whatsapp')}
                    className="sr-only"
                  />
                  <MessageCircle className={`h-6 w-6 mr-3 ${paymentMethod === 'whatsapp' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">Commander via WhatsApp</p>
                    <p className="text-sm text-gray-500">Paiement à la livraison</p>
                  </div>
                </label>
              </div>

              {/* Card Payment Widget */}
              {paymentMethod === 'card' && (
                <div className="mt-6">
                  <div 
                    id="sumup-card-widget" 
                    className="min-h-[300px] border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    {!sdkLoaded && (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                          <p className="text-gray-500">Chargement du formulaire de paiement...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Paiement sécurisé par SumUp
                  </p>
                </div>
              )}

              {/* WhatsApp Button */}
              {paymentMethod === 'whatsapp' && (
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={isProcessing || !customerInfo.name || !customerInfo.phone}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MessageCircle className="h-5 w-5" />
                  {isProcessing ? 'Envoi...' : `Commander via WhatsApp - ${formatPrice(total)}`}
                </button>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Résumé de la commande
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor} • {item.selectedSize} • Qté: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(
                          item.product.category === 'hijabs'
                            ? (item.quantity >= 2
                                ? Math.floor(item.quantity / 2) * 25 + (item.quantity % 2) * 13
                                : item.quantity * 13)
                            : item.product.price * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {appliedPromotion && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
