import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { verifyPayment } from '@/services/sumupService';
import { Helmet } from 'react-helmet-async';

/**
 * Payment Return Page
 * Handles the redirect from SumUp after payment completion
 */
const PaymentReturn: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification du paiement...');
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      // Get parameters from URL
      const checkoutId = searchParams.get('checkout_id') || searchParams.get('id');
      const urlStatus = searchParams.get('status');
      const urlReference = searchParams.get('reference');
      const transactionCode = searchParams.get('transaction_code');

      console.log('Payment return params:', { checkoutId, urlStatus, urlReference, transactionCode });

      setReference(urlReference);

      // If SumUp already told us the status via URL
      if (urlStatus === 'success' || urlStatus === 'PAID') {
        setStatus('success');
        setMessage('Paiement réussi !');
        notifyParentWindow('success', urlReference);
        return;
      }

      if (urlStatus === 'failed' || urlStatus === 'FAILED') {
        setStatus('failed');
        setMessage('Le paiement a échoué. Veuillez réessayer.');
        notifyParentWindow('failed', urlReference);
        return;
      }

      if (urlStatus === 'cancel' || urlStatus === 'CANCELLED') {
        setStatus('failed');
        setMessage('Paiement annulé.');
        notifyParentWindow('cancelled', urlReference);
        return;
      }

      // If we have a checkout ID, verify with our backend
      if (checkoutId) {
        try {
          const result = await verifyPayment(checkoutId);
          
          if (result.success) {
            switch (result.status) {
              case 'success':
                setStatus('success');
                setMessage('Paiement réussi !');
                notifyParentWindow('success', result.reference || urlReference);
                break;
              case 'pending':
                setStatus('pending');
                setMessage('Paiement en cours de traitement...');
                notifyParentWindow('pending', result.reference || urlReference);
                break;
              case 'failed':
                setStatus('failed');
                setMessage('Le paiement a échoué. Veuillez réessayer.');
                notifyParentWindow('failed', result.reference || urlReference);
                break;
              case 'expired':
                setStatus('failed');
                setMessage('La session de paiement a expiré.');
                notifyParentWindow('expired', result.reference || urlReference);
                break;
              default:
                setStatus('error');
                setMessage('Statut de paiement inconnu.');
                notifyParentWindow('unknown', result.reference || urlReference);
            }
          } else {
            setStatus('error');
            setMessage(result.error || 'Erreur lors de la vérification du paiement.');
            notifyParentWindow('error', urlReference);
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setStatus('error');
          setMessage('Erreur lors de la vérification du paiement.');
          notifyParentWindow('error', urlReference);
        }
      } else {
        // No checkout ID and no status - something went wrong
        setStatus('error');
        setMessage('Paramètres de paiement manquants.');
        notifyParentWindow('error', urlReference);
      }
    };

    verifyPaymentStatus();
  }, [searchParams]);

  // Notify parent window (if opened as popup) and handle close
  const notifyParentWindow = (paymentStatus: string, ref: string | null) => {
    try {
      // If this is a popup, send message to parent
      if (window.opener) {
        window.opener.postMessage({
          type: 'SUMUP_PAYMENT_RESULT',
          status: paymentStatus,
          reference: ref,
        }, '*');
        
        // Close popup after a delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } catch (error) {
      console.error('Error notifying parent:', error);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-primary-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-orange-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Vérification du paiement';
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'pending':
        return 'Paiement en cours';
      case 'error':
        return 'Erreur';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>{getTitle()} - Hijabi Inoor</title>
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getTitle()}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {reference && (
          <p className="text-sm text-gray-500 mb-6">
            Référence: <strong>{reference}</strong>
          </p>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              ✨ Merci pour votre commande ! Vous recevrez une confirmation par email.
            </p>
          </div>
        )}

        {status === 'loading' && (
          <p className="text-sm text-gray-500">
            Cette fenêtre se fermera automatiquement...
          </p>
        )}

        {(status === 'success' || status === 'failed' || status === 'error') && (
          <div className="space-y-3">
            {!window.opener && (
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Retour à la boutique
              </button>
            )}
            
            {status === 'failed' && !window.opener && (
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Réessayer le paiement
              </button>
            )}
          </div>
        )}

        {window.opener && (status === 'success' || status === 'failed' || status === 'error') && (
          <p className="text-sm text-gray-500 mt-4">
            Cette fenêtre va se fermer automatiquement...
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;


