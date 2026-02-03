import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, CheckCircle, Loader2, MapPin, User, Phone, Mail, Building, Map } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils';
import { toast } from 'react-hot-toast';
import { 
  generateOrderReference,
  createCheckoutAndRedirect,
} from '@/services/sumupService';
import { createOrder, cartItemsToOrderItems } from '@/services/orderService';
import { Helmet } from 'react-helmet-async';

// European countries for shipping
const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'IT', name: 'Italie' },
  { code: 'ES', name: 'Espagne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AT', name: 'Autriche' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'IE', name: 'Irlande' },
  { code: 'DK', name: 'Danemark' },
  { code: 'SE', name: 'Suède' },
  { code: 'NO', name: 'Norvège' },
  { code: 'FI', name: 'Finlande' },
  { code: 'PL', name: 'Pologne' },
  { code: 'CZ', name: 'République tchèque' },
  { code: 'GR', name: 'Grèce' },
  { code: 'MA', name: 'Maroc' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'DZ', name: 'Algérie' },
];

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  address: string;
  address2: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart, total: cartTotal, getTotalHijabs, getFreeHijabs } = useCartStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [currentOrderRef, setCurrentOrderRef] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<ShippingInfo>>({});
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'FR',
    city: '',
    postalCode: '',
    address: '',
    address2: '',
  });

  // Use cartStore's total which includes the "3 acheté = 1 offert" promotion
  const subtotal = cartTotal;

  // Calculate shipping cost (free over 69€)
  const shippingCost = subtotal >= 69 ? 0 : 5.90;
  
  // Calculate final total
  const total = subtotal + shippingCost;
  
  const totalHijabs = getTotalHijabs();
  const freeHijabs = getFreeHijabs();

  useEffect(() => {
    if (items.length === 0 && paymentStatus !== 'success') {
      navigate('/products');
    }
  }, [items, navigate, paymentStatus]);

  // Listen for payment result from popup
  const handlePaymentMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === 'SUMUP_PAYMENT_RESULT') {
      console.log('Payment result received:', event.data);
      
      if (event.data.status === 'success') {
        handlePaymentSuccess(event.data);
      } else if (event.data.status === 'failed' || event.data.status === 'error') {
        handlePaymentError(event.data);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, [handlePaymentMessage]);

  const updateField = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingInfo> = {};
    
    if (!shippingInfo.firstName.trim()) errors.firstName = 'Prénom requis';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Nom requis';
    if (!shippingInfo.email.trim()) {
      errors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      errors.email = 'Email invalide';
    }
    if (!shippingInfo.phone.trim()) errors.phone = 'Téléphone requis';
    if (!shippingInfo.country) errors.country = 'Pays requis';
    if (!shippingInfo.city.trim()) errors.city = 'Ville requise';
    if (!shippingInfo.postalCode.trim()) errors.postalCode = 'Code postal requis';
    if (!shippingInfo.address.trim()) errors.address = 'Adresse requise';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSuccess = async (result: any) => {
    console.log('Payment success:', result);
    setPaymentStatus('success');
    
    if (result.reference) {
      setCurrentOrderRef(result.reference);
    }
    
    clearCart();
    toast.success('Paiement réussi! Merci pour votre commande.');
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setPaymentStatus('failed');
    setIsProcessing(false);
    toast.error('Le paiement a échoué. Veuillez réessayer.');
  };

  const handlePayment = async () => {
    // Validate form
    if (!validateForm()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      const orderReference = generateOrderReference();
      setCurrentOrderRef(orderReference);
      
      // Create order in database FIRST (pending status)
      const orderItems = cartItemsToOrderItems(items);
      const fullName = `${shippingInfo.firstName} ${shippingInfo.lastName}`;
      const countryName = COUNTRIES.find(c => c.code === shippingInfo.country)?.name || shippingInfo.country;
      
      const shippingAddress = {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        address: shippingInfo.address,
        address2: shippingInfo.address2,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
        countryName: countryName,
      };
      
      await createOrder({
        reference: orderReference,
        customer_email: shippingInfo.email,
        customer_name: fullName,
        customer_phone: shippingInfo.phone,
        shipping_address: shippingAddress,
        items: orderItems,
        subtotal: subtotal,
        discount_amount: 0,
        shipping_cost: shippingCost,
        total: total,
        status: 'pending',
        payment_method: 'sumup_card',
        payment_status: 'pending',
      });

      // Create SumUp checkout and open popup
      const description = `Commande ${orderReference}: ${items.length} article(s)`;
      
      const result = await createCheckoutAndRedirect({
        amount: total,
        currency: 'EUR',
        description: description,
        reference: orderReference,
        customerEmail: shippingInfo.email,
      });

      if (!result.success) {
        throw new Error(result.error || 'Échec de la création du paiement');
      }

      toast.success('Fenêtre de paiement ouverte. Complétez votre paiement.');
      
      // If on mobile, we've been redirected
      if (!result.popup) {
        return;
      }

      // Desktop - popup is open, wait for it to close
      const checkPopupInterval = setInterval(() => {
        if (result.popup && result.popup.closed) {
          clearInterval(checkPopupInterval);
          setIsProcessing(false);
          if (paymentStatus !== 'success') {
            setPaymentStatus('pending');
            toast('Paiement annulé ou fenêtre fermée', { icon: '⚠️' });
          }
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Error creating payment:', error);
      setIsProcessing(false);
      setPaymentStatus('failed');
      toast.error(error.message || 'Erreur lors de la création du paiement. Veuillez réessayer.');
    }
  };

  if (items.length === 0 && paymentStatus !== 'success') {
    return null;
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Commande confirmée - HIJABI NOUR</title>
        </Helmet>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Merci pour votre commande!
            </h1>
            {currentOrderRef && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 inline-block">
                <p className="text-sm text-gray-500">Référence de commande</p>
                <p className="text-xl font-mono font-bold text-primary-600">{currentOrderRef}</p>
              </div>
            )}
            <p className="text-gray-600 mb-8">
              Votre commande a été confirmée. Vous recevrez un email de confirmation à <strong>{shippingInfo.email}</strong>.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Continuer mes achats
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Checkout - HIJABI NOUR</title>
        <meta name="description" content="Finalisez votre commande en quelques étapes simples" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
          <p className="text-gray-500 mt-1">Remplissez vos informations de livraison</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Informations de contact
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                    disabled={isProcessing}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                    disabled={isProcessing}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="votre@email.com"
                    disabled={isProcessing}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+33 6 XX XX XX XX"
                    disabled={isProcessing}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Adresse de livraison
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Map className="h-4 w-4 inline mr-1" />
                    Pays <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isProcessing}
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Numéro et nom de rue"
                    disabled={isProcessing}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complément d'adresse
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address2}
                    onChange={(e) => updateField('address2', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Appartement, étage, bâtiment... (optionnel)"
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        formErrors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="75001"
                      disabled={isProcessing}
                    />
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="h-4 w-4 inline mr-1" />
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        formErrors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Votre ville"
                      disabled={isProcessing}
                    />
                    {formErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Payer {formatPrice(total)}
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Récapitulatif
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor} • {item.selectedSize}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
{formatPrice(
                          item.product.category === 'hijabs' && item.product.price === 13
                            ? (item.quantity >= 2
                                ? Math.floor(item.quantity / 2) * 25 + (item.quantity % 2) * 13
                                : item.quantity * 13)
                            : item.product.price * item.quantity
                        )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Free Hijabs Promotion */}
              {freeHijabs > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 rounded-xl p-4 mb-4 shadow-sm">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                    }}></div>
                  </div>
                  
                  <div className="relative flex items-start gap-3">
                    {/* Gift Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-xl">🎁</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-green-900 font-luxury">
                          Promotion: {freeHijabs} hijab{freeHijabs > 1 ? 's' : ''} gratuit{freeHijabs > 1 ? 's' : ''} !
                        </span>
                      </div>
                      <p className="text-sm text-green-800 font-medium leading-relaxed">
                        Vous recevrez <span className="font-bold text-green-900">{totalHijabs} hijab{totalHijabs > 1 ? 's' : ''}</span> (dont <span className="font-bold text-green-900">{freeHijabs} gratuit{freeHijabs > 1 ? 's' : ''}</span>)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">Gratuite</span>
                  ) : (
                    <span className="text-gray-900">{formatPrice(shippingCost)}</span>
                  )}
                </div>

                {subtotal < 69 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      💡 Plus que <strong>{formatPrice(69 - subtotal)}</strong> pour la livraison gratuite!
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
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
