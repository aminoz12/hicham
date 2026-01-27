import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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

      {/* Text Overlay - Lower Left */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute bottom-20 left-8 lg:left-16 z-30 text-white"
      >
        <motion.h1 
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light mb-8 tracking-wide leading-tight font-luxury"
          style={{
            letterSpacing: '0.05em',
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
          {t('hero.title')}
          </span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
        <Link
          to="/products"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-semibold tracking-wider uppercase transition-all duration-300 overflow-hidden"
          >
            {/* Button Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-sm border border-white/30 rounded-sm"></span>
            
            {/* Hover Effect */}
            <span className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            
            {/* Button Text */}
            <span className="relative z-10 text-white flex items-center space-x-2">
              <span>{t('hero.cta')}</span>
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </span>
        </Link>
        </motion.div>
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
