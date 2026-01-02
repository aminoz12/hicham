import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';

const TestimonialsFr: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const testimonials = [
    {
      id: 1,
      name: 'Layla',
      role: 'Élégant Hijab en Mousseline',
      location: 'Paris, France',
      content: 'Cette robe est si mignonne et polyvalente. Elle peut être habillée ou portée pour un look décontracté au quotidien, et elle est super confortable. C\'est un classique intemporel qui ne se démode jamais, comme toujours chez Hijabi Inoor.',
      rating: 5,
      image: '/testimonials/layla.jpg'
    },
    {
      id: 2,
      name: 'Fathima Baig',
      role: 'Abaya de Luxe',
      location: 'Lyon, France',
      content: 'L\'Abaya de Luxe est un INCONTOURNABLE dans votre garde-robe ! Je l\'ai portée à un événement professionnel de mon mari, et j\'ai reçu tellement de compliments, c\'était incroyable !',
      rating: 5,
      image: '/testimonials/fathima.jpg'
    },
    {
      id: 3,
      name: 'Ines J.',
      role: 'Ensemble de Foulards en Chiffon',
      location: 'Marseille, France',
      content: 'Élégant et chic. Les hijabs sont bien conçus et le tissu ajoute une touche d\'élégance. On se sent spéciale en portant les tenues Hijabi Inoor. Merci pour la livraison rapide et les petites attentions aussi 🥰',
      rating: 5,
      image: '/testimonials/ines.jpg'
    }
  ];

  const stats = [
    { value: '4.9', label: 'Note Moyenne' },
    { value: '10 000+', label: 'Clients Satisfaits' },
    { value: '99%', label: 'Taux de Satisfaction' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ne vous fiez pas uniquement à nos dires. Voici ce que nos merveilleuses clientes pensent de leur expérience avec nous.
          </p>
        </motion.div>

        {/* Grille des Témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Icône de citation */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Quote className="h-6 w-6 text-primary-600" />
                  </div>
                </div>

                {/* Contenu du témoignage */}
                <div className="flex-grow">
                  <p className="text-gray-600 italic mb-6">"{testimonial.content}"</p>
                </div>

                {/* Note en étoiles */}
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>

                {/* Auteur du témoignage */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-gray-400">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-md"
            >
              <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Appel à l'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Rejoignez nos clientes satisfaites</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Découvrez la qualité et le service que nos clientes adorent. Commencez votre voyage avec nous dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Boutique
            </button>
            <button className="px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
              En savoir plus
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsFr;
