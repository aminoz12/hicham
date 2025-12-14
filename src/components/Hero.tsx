import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from '@/hooks/useTranslation';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation('home');
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark Brown Wood-Grained Background Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: '#3a2f1f',
          backgroundImage: `
            linear-gradient(90deg, transparent 79px, rgba(0,0,0,0.03) 81px, rgba(0,0,0,0.03) 82px, transparent 84px),
            linear-gradient(90deg, transparent 159px, rgba(0,0,0,0.05) 161px, rgba(0,0,0,0.05) 162px, transparent 164px),
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.02) 0px,
              rgba(0,0,0,0.02) 1px,
              transparent 1px,
              transparent 3px
            ),
            linear-gradient(180deg, #3a2f1f 0%, #2a1f14 100%)
          `
        }}
      />
      
      {/* Video Background */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 z-10"
      >
        <video
          ref={videoRef}
          src="/vid.mp4"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      {/* Centered Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30"
      >
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Hijabi Inoor Logo"
            className="h-8 lg:h-10 w-auto object-contain"
          />
        </Link>
      </motion.div>

      {/* Text Overlay - Lower Left */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute bottom-20 left-8 lg:left-16 z-30 text-white"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
          {t('hero.title')}
        </h1>
        <Link
          to="/products"
          className="text-lg sm:text-xl font-medium underline hover:no-underline transition-all inline-block"
        >
          {t('hero.cta')}
        </Link>
      </motion.div>

      {/* Chat/Support Icon - Bottom Right */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-8 right-8 z-30 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Chat support"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </motion.button>
    </section>
  );
};

export default Hero;
