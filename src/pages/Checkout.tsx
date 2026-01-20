import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Tag, X, CheckCircle, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils';
import { toast } from 'react-hot-toast';
import { 
  generateOrderReference,
  redirectToSumUpCheckout
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [orderCreated, setOrderCreated] = useState(false);
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
    if (items.length === 0 && !orderCreated) {
      navigate('/products');
    }
  }, [items, navigate, orderCreated]);

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

  const handleProceedToPayment = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      navigate('/products');
      return;
    }

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
        payment_method: 'sumup',
        payment_status: 'pending',
      });

      // Increment promotion usage if used
      if (appliedPromotion?.promotion.id) {
        await incrementPromotionUsage(appliedPromotion.promotion.id);
      }

      // Mark order as created
      setOrderCreated(true);
      
      // Generate description for SumUp
      const description = `Commande ${orderReference} - ${items.length} article(s)`;
      
      // Clear cart before redirect
      clearCart();
      
      toast.success('Commande créée! Redirection vers le paiement...');
      
      // Redirect to SumUp Checkout (customers pay with Card, Apple Pay, Google Pay)
      const redirected = await redirectToSumUpCheckout({
        amount: total,
        currency: 'EUR',
        description: description,
        reference: orderReference,
        redirectUrl: `${window.location.origin}/checkout/success?reference=${orderReference}`,
      });

      if (!redirected) {
        toast.error('Erreur lors de la création du paiement. Veuillez réessayer.');
        setIsProcessing(false);
        setOrderCreated(false);
      }

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Erreur lors de la création de la commande');
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
    return null;
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Paiement - Hijabi Inoor</title>
        </Helmet>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Redirection vers le paiement...
          </h1>
          <p className="text-gray-600 mb-2">
            Référence: <strong>{currentOrderRef}</strong>
          </p>
          <p className="text-gray-600 mb-8">
            Vous allez être redirigé vers la page de paiement sécurisée.
            <br />
            Vous pourrez payer par carte bancaire, Apple Pay ou Google Pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={async () => {
                setIsProcessing(true);
                await redirectToSumUpCheckout({
                  amount: total,
                  currency: 'EUR',
                  description: `Commande ${currentOrderRef}`,
                  reference: currentOrderRef || undefined,
                  redirectUrl: `${window.location.origin}/checkout/success?reference=${currentOrderRef}`,
                });
                setIsProcessing(false);
              }}
              disabled={isProcessing}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              {isProcessing ? 'Chargement...' : 'Aller au paiement'}
            </button>
            <button
              onClick={() => navigate('/products')}
              className="btn-secondary"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Checkout - Hijabi Inoor</title>
        <meta name="description" content="Finalisez votre commande avec paiement sécurisé SumUp" />
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
            {/* Customer Info (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations (optionnel)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+33 6 XX XX XX XX"
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

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Méthode de paiement
              </h2>
              <div className="border-2 border-primary-500 rounded-lg p-4 bg-primary-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Carte bancaire, Apple Pay & Google Pay
                      </h3>
                      <p className="text-sm text-gray-600">
                        Paiement sécurisé par SumUp
                      </p>
                    </div>
                  </div>
                  <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="btn-primary w-full mt-6 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span>Création de la commande...</span>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Procéder au paiement - {formatPrice(total)}</span>
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 text-center mt-4">
                🔒 Paiement sécurisé par SumUp. Visa, Mastercard, Apple Pay et Google Pay acceptés.
              </div>
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
                    <span>Réduction ({appliedPromotion.promotion.name})</span>
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
