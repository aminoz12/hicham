import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Volume2, VolumeX, Maximize2, Sparkles, Zap, Star } from 'lucide-react';

const VideoSection: React.FC = () => {
  // const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const isInView = useInView(containerRef);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.15, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.1, 1, 1, 0.1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 2]);
  
  // Mouse tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // Mouse tracking effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x * 100);
      mouseY.set(y * 100);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // const togglePlay = () => {
  //   const video = videoRef.current;
  //   if (!video) return;
  //   
  //   if (isPlaying) {
  //     video.pause();
  //   } else {
  //     video.play();
  //   }
  //   setIsPlaying(!isPlaying);
  // };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickTime = (clickX / width) * duration;
    
    video.currentTime = clickTime;
    setCurrentTime(clickTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
    >
      {/* Enhanced Animated Background */}
      <motion.div
        style={{ y, scale, opacity, rotate }}
        className="absolute inset-0 w-full h-full"
      >
        {/* Dynamic Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, 200, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/20 via-cyan-500/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, -150, 0],
            y: [0, 200, 0],
            scale: [1, 0.8, 1],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-to-tr from-yellow-500/20 via-orange-500/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, 300, 0],
            y: [0, -150, 0],
            scale: [1, 1.4, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-green-500/20 via-teal-500/15 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, -200, 0],
            y: [0, 100, 0],
            scale: [1, 0.9, 1],
            rotate: [360, 0, -360]
          }}
          transition={{ 
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 9
          }}
        />

        {/* Interactive Mouse Following Elements */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-2xl"
          style={{
            x: useTransform(springX, [0, 100], [-200, 200]),
            y: useTransform(springY, [0, 100], [-200, 200]),
          }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl"
          style={{
            x: useTransform(springX, [0, 100], [100, -100]),
            y: useTransform(springY, [0, 100], [100, -100]),
          }}
        />
      </motion.div>

      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Video Container */}
      <div className="relative z-10 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 100 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative"
        >
          {/* Glowing Border Effect */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl blur-sm opacity-75"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Video Wrapper with Premium Styling */}
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-black group border border-white/10"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Video */}
            <video
              ref={videoRef}
              className="w-full h-auto min-h-[500px] max-h-[650px] object-cover"
              poster="/vid2.mp4"
              muted={isMuted}
              loop
              playsInline
              autoPlay
            >
              <source src="/vid2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Dynamic Overlay with Mouse Interaction */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/50 transition-all duration-700"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0,0,0,0.3) 70%)`
              }}
            />

            {/* Animated Corner Decorations */}
            <motion.div
              className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-pink-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />

            {/* Volume Control Button - Top Right */}
            <motion.button
              onClick={toggleMute}
              className="absolute top-6 right-6 z-20"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="relative w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 hover:bg-white/20 transition-all duration-500"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 0 30px rgba(255, 255, 255, 0.4)"
                }}
              >
                {/* Pulsing Ring Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/40"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Volume Icon */}
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  {isMuted ? (
                    <VolumeX className="h-8 w-8 text-white drop-shadow-lg" />
                  ) : (
                    <Volume2 className="h-8 w-8 text-white drop-shadow-lg" />
                  )}
                </motion.div>
              </motion.div>
            </motion.button>

            {/* Premium Video Controls */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent backdrop-blur-sm"
              initial={{ opacity: 0, y: 40 }}
              animate={showControls ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Enhanced Progress Bar */}
              <div
                ref={progressRef}
                className="w-full h-3 bg-white/20 rounded-full cursor-pointer mb-6 hover:h-4 transition-all duration-300 group"
                onClick={handleProgressClick}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full relative"
                  style={{ width: `${progressPercentage}%` }}
                  whileHover={{ height: '100%' }}
                >
                  {/* Progress Bar Glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-sm opacity-50"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              {/* Enhanced Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-8">
                  <motion.button 
                    onClick={toggleMute} 
                    className="hover:text-purple-400 transition-all duration-300 p-4 rounded-full hover:bg-white/10 backdrop-blur-sm border border-white/20"
                    whileHover={{ scale: 1.2, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isMuted ? <VolumeX className="h-10 w-10" /> : <Volume2 className="h-10 w-10" />}
                  </motion.button>
                  
                  <motion.span 
                    className="text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </motion.span>
                </div>
                
                <motion.button 
                  className="hover:text-blue-400 transition-all duration-300 p-3 rounded-full hover:bg-white/10 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Maximize2 className="h-7 w-7" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Premium Floating Elements with Icons */}
          <motion.div
            className="absolute -top-12 -right-12 w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full shadow-2xl flex items-center justify-center"
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.2 }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute -bottom-12 -left-12 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center"
            animate={{ 
              y: [0, 25, 0],
              rotate: [360, 180, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            whileHover={{ scale: 1.15 }}
          >
            <Zap className="h-6 w-6 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full shadow-xl flex items-center justify-center"
            animate={{ 
              x: [0, 40, 0],
              y: [0, -20, 0],
              scale: [1, 1.4, 1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            whileHover={{ scale: 1.3 }}
          >
            <Star className="h-5 w-5 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute top-1/3 -right-8 w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-full shadow-xl flex items-center justify-center"
            animate={{ 
              x: [0, -35, 0],
              y: [0, 25, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            whileHover={{ scale: 1.25 }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Premium Decorative Elements */}
      <motion.div
        className="absolute top-1/4 right-20 w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full shadow-lg"
        animate={{ 
          scale: [1, 1.8, 1],
          opacity: [0.4, 1, 0.4],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 2 }}
      />
      <motion.div
        className="absolute bottom-1/3 left-20 w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-lg"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.9, 0.2],
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        whileHover={{ scale: 1.8 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg"
        animate={{ 
          y: [0, -25, 0],
          scale: [1, 1.4, 1],
          x: [0, 10, 0]
        }}
        transition={{ 
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        whileHover={{ scale: 1.6 }}
      />
      <motion.div
        className="absolute top-3/4 left-1/4 w-4 h-4 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full shadow-lg"
        animate={{ 
          scale: [1, 1.6, 1],
          opacity: [0.3, 1, 0.3],
          rotate: [0, -180, -360]
        }}
        transition={{ 
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        whileHover={{ scale: 1.8 }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/2 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.3, 1],
          x: [0, -15, 0]
        }}
        transition={{ 
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        whileHover={{ scale: 1.5 }}
      />
    </section>
  );
};

export default VideoSection;
