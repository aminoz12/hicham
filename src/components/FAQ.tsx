import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

const faqData: FAQItem[] = [
  {
    question: "Quels sont les délais de livraison ?",
    questionEn: "What are the delivery times?",
    answer: "Les commandes sont expédiées sous 24-48h. La livraison en France métropolitaine prend généralement 3-5 jours ouvrables. Pour l'Europe, comptez 5-10 jours ouvrables selon le pays de destination.",
    answerEn: "Orders are shipped within 24-48 hours. Delivery to mainland France typically takes 3-5 business days. For Europe, expect 5-10 business days depending on the destination country."
  },
  {
    question: "La livraison est-elle gratuite ?",
    questionEn: "Is shipping free?",
    answer: "Oui ! La livraison est gratuite pour toutes les commandes de 69€ ou plus. Pour les commandes inférieures à 69€, des frais de livraison de 5,90€ s'appliquent.",
    answerEn: "Yes! Shipping is free for all orders of €69 or more. For orders under €69, a shipping fee of €5.90 applies."
  },
  {
    question: "Puis-je retourner ou échanger un article ?",
    questionEn: "Can I return or exchange an item?",
    answer: "Absolument ! Vous disposez de 14 jours après réception pour retourner ou échanger votre article. Les produits doivent être non portés, non lavés et dans leur emballage d'origine. Contactez-nous via WhatsApp ou email pour initier un retour.",
    answerEn: "Absolutely! You have 14 days after receipt to return or exchange your item. Products must be unworn, unwashed, and in their original packaging. Contact us via WhatsApp or email to initiate a return."
  },
  {
    question: "Comment choisir ma taille de hijab ?",
    questionEn: "How do I choose my hijab size?",
    answer: "Nos hijabs sont disponibles en taille unique standard qui convient à la plupart des styles de port. Le tissu stretch premium s'adapte facilement. Si vous avez des doutes, n'hésitez pas à nous contacter pour des conseils personnalisés.",
    answerEn: "Our hijabs come in a standard one-size that fits most wearing styles. The premium stretch fabric adapts easily. If you have any doubts, don't hesitate to contact us for personalized advice."
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    questionEn: "What payment methods do you accept?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), Apple Pay et Google Pay. Tous les paiements sont sécurisés et cryptés via notre partenaire SumUp.",
    answerEn: "We accept credit cards (Visa, Mastercard), Apple Pay, and Google Pay. All payments are secure and encrypted through our partner SumUp."
  },
  {
    question: "Comment entretenir mes hijabs et abayas ?",
    questionEn: "How do I care for my hijabs and abayas?",
    answer: "Pour préserver la qualité de vos articles, nous recommandons un lavage à la main ou en machine à 30°C en cycle délicat. Évitez le sèche-linge et repassez à basse température. Nos tissus premium gardent leur beauté longtemps avec un entretien approprié.",
    answerEn: "To preserve the quality of your items, we recommend hand washing or machine washing at 30°C on a delicate cycle. Avoid tumble drying and iron at low temperature. Our premium fabrics maintain their beauty for a long time with proper care."
  },
  {
    question: "Comment vous contacter ?",
    questionEn: "How can I contact you?",
    answer: "Vous pouvez nous joindre via WhatsApp au +33 7 66 04 33 75 pour une réponse rapide, ou par email. Nous sommes disponibles 7j/7 pour répondre à toutes vos questions et vous accompagner dans vos achats.",
    answerEn: "You can reach us via WhatsApp at +33 7 66 04 33 75 for a quick response, or by email. We are available 7 days a week to answer all your questions and assist you with your purchases."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // For now, always use French. You can add language detection later.
  const isFrench = true;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4">
            {isFrench ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isFrench 
              ? 'Tout ce que vous devez savoir sur nos produits et services'
              : 'Everything you need to know about our products and services'
            }
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
              >
                <span className="text-base sm:text-lg font-medium text-gray-900 pr-4">
                  {isFrench ? faq.question : faq.questionEn}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${
                    openIndex === index ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-5">
                      <div className="h-px bg-gray-100 mb-4" />
                      <p className="text-gray-600 leading-relaxed">
                        {isFrench ? faq.answer : faq.answerEn}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            {isFrench 
              ? "Vous ne trouvez pas la réponse que vous cherchez ?"
              : "Can't find the answer you're looking for?"
            }
          </p>
          <a
            href="https://wa.me/33766043375"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {isFrench ? 'Contactez-nous sur WhatsApp' : 'Contact us on WhatsApp'}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;

