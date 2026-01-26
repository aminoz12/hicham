import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Truck, Package, Globe, Clock, CheckCircle } from 'lucide-react';

const Shipping: React.FC = () => {
  const shippingInfo = [
    {
      icon: Truck,
      title: 'Livraison en France',
      description: 'Livraison standard gratuite pour les commandes de 69€ et plus. Délai de livraison : 3-5 jours ouvrables.',
      price: 'Gratuite dès 69€ d\'achat',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Globe,
      title: 'Livraison Internationale',
      description: 'Livraison disponible dans toute l\'Europe et au-delà. Délai de livraison : 5-15 jours ouvrables selon la destination.',
      price: 'À partir de 9,90€',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Expédition Rapide',
      description: 'Toutes les commandes sont expédiées sous 24-48h après confirmation de paiement.',
      price: 'Sous 24-48h',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Package,
      title: 'Suivi de Commande',
      description: 'Vous recevrez un email de confirmation avec un numéro de suivi dès l\'expédition de votre commande.',
      price: 'Inclus',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const shippingZones = [
    {
      zone: 'France Métropolitaine',
      price: 'Gratuite dès 69€',
      priceUnder: '5,90€',
      delivery: '3-5 jours ouvrables'
    },
    {
      zone: 'Europe (UE)',
      price: '9,90€',
      delivery: '5-10 jours ouvrables'
    },
    {
      zone: 'Europe (Hors UE)',
      price: '14,90€',
      delivery: '7-15 jours ouvrables'
    },
    {
      zone: 'Reste du monde',
      price: '19,90€',
      delivery: '10-20 jours ouvrables'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Informations de Livraison - HIJABI NOUR</title>
        <meta name="description" content="Découvrez nos options de livraison, délais et tarifs pour la France et l'international." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <Truck className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Informations de Livraison
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos options de livraison rapide et sécurisée en France et dans le monde entier
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Shipping Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {shippingInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4`}>
                <info.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{info.description}</p>
              <p className="text-sm font-semibold text-primary-600">{info.price}</p>
            </motion.div>
          ))}
        </div>

        {/* Shipping Zones Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-16"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Tarifs de Livraison par Zone</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Zone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tarif (commande &lt; 69€)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tarif (commande ≥ 69€)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Délai de livraison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shippingZones.map((zone, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{zone.zone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{zone.priceUnder || zone.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {zone.zone === 'France Métropolitaine' ? 'Gratuite' : zone.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{zone.delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-primary-50 rounded-2xl p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations Importantes</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Expédition</h3>
                <p className="text-gray-600">Toutes les commandes sont expédiées sous 24-48h après confirmation de paiement (hors weekends et jours fériés).</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Suivi de Commande</h3>
                <p className="text-gray-600">Vous recevrez un email de confirmation avec un numéro de suivi dès l'expédition de votre commande. Vous pourrez suivre votre colis en temps réel.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Livraison Gratuite</h3>
                <p className="text-gray-600">La livraison est gratuite pour toutes les commandes de 69€ et plus en France métropolitaine. Cette offre s'applique automatiquement lors du checkout.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Délais de Livraison</h3>
                <p className="text-gray-600">Les délais indiqués sont des estimations. Ils peuvent varier selon les conditions météorologiques, les jours fériés ou les événements exceptionnels.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Frais Douaniers</h3>
                <p className="text-gray-600">Pour les commandes hors UE, des frais de douane peuvent s'appliquer selon la législation du pays de destination. Ces frais sont à la charge du client.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center bg-gray-50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Des Questions sur la Livraison ?</h2>
          <p className="text-gray-600 mb-6">Notre équipe est là pour vous aider</p>
          <a
            href="https://wa.me/33766043375"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contactez-nous sur WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Shipping;

