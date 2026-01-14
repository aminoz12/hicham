import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils';
import { toast } from 'react-hot-toast';
import { 
  generateCheckoutReference,
  redirectToSumUpCheckout,
  parseSumUpReturnParams
} from '@/services/sumupService';
import { Helmet } from 'react-helmet-async';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, total, clearCart } = useCartStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  
  // Check if returning from SumUp Checkout Link
  const sumUpParams = parseSumUpReturnParams(searchParams);
  const isReturningFromSumUp = !!sumUpParams.status;

  useEffect(() => {
    if (items.length === 0 && !isReturningFromSumUp) {
      navigate('/products');
      return;
    }

    // If returning from SumUp Checkout Link
    if (isReturningFromSumUp) {
      handleCheckoutReturn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReturningFromSumUp]);

  const initializeCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }

    setIsProcessing(true);
    setCheckoutStatus('processing');
    
    try {
      const checkoutReference = generateCheckoutReference();
      const description = `Order: ${items.length} item(s) - ${items.map(i => i.product.name).join(', ')}`;
      const returnUrl = `${window.location.origin}/checkout?status={status}&transaction_code={transaction_code}&amount={amount}&currency={currency}&reference={reference}`;
      
      // Redirect directly to SumUp Checkout Link - no API calls needed!
      redirectToSumUpCheckout(
        total,
        'EUR',
        description,
        returnUrl,
        checkoutReference
      );
    } catch (error: any) {
      console.error('Error initializing checkout:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      setCheckoutStatus('failed');
      setIsProcessing(false);
    }
  };

  const handleCheckoutReturn = () => {
    setIsProcessing(false);
    
    // Parse SumUp return parameters
    const status = sumUpParams.status?.toUpperCase();
    
    if (status === 'SUCCESSFUL' || status === 'PAID') {
      setCheckoutStatus('success');
      toast.success('Payment successful! Your order has been confirmed.');
      
      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
        navigate('/checkout/success');
      }, 2000);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      setCheckoutStatus('failed');
      toast.error('Payment was not completed. Please try again.');
    } else {
      setCheckoutStatus('pending');
    }
  };

  const handleRetry = () => {
    setCheckoutStatus('pending');
    // Clear URL parameters and retry
    window.history.replaceState({}, '', '/checkout');
    initializeCheckout();
  };

  if (items.length === 0 && !isReturningFromSumUp) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Checkout - Hijabi Inoor</title>
        <meta name="description" content="Complete your order securely with SumUp payment" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {/* Payment Status */}
              {checkoutStatus === 'processing' && (
                <div className="text-center py-12">
                  <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Redirecting to Payment...
                  </h2>
                  <p className="text-gray-600">
                    You will be redirected to SumUp to complete your payment securely.
                  </p>
                </div>
              )}

              {checkoutStatus === 'success' && (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your order has been confirmed. You will receive a confirmation email shortly.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="btn-primary"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}

              {checkoutStatus === 'failed' && (
                <div className="text-center py-12">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Payment Failed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your payment could not be processed. Please try again.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {checkoutStatus === 'pending' && !isProcessing && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      <div className="border-2 border-primary-500 rounded-lg p-4 bg-primary-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-6 w-6 text-primary-600" />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Credit Card, Apple Pay & Google Pay
                              </h3>
                              <p className="text-sm text-gray-600">
                                Secure payment powered by SumUp
                              </p>
                            </div>
                          </div>
                          <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={initializeCheckout}
                    disabled={isProcessing}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Proceed to Payment</span>
                      </>
                    )}
                  </button>

                  <div className="text-xs text-gray-500 text-center">
                    🔒 Your payment is secured by SumUp. We accept Visa, Mastercard, Apple Pay, and Google Pay.
                  </div>
                </div>
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
                Order Summary
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
                        {item.selectedColor} • {item.selectedSize} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
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

