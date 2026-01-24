import React from 'react';

const ScrollingBanner: React.FC = () => {
  const messages = [
    "LIVRAISON GRATUITE DEPUIS 69 EURO D'ACHAT",
  ];

  // Duplicate messages multiple times for seamless infinite scroll
  const duplicatedMessages = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="w-full bg-primary-600 text-white h-10 overflow-hidden sticky top-0 z-50 flex items-center">
      <div className="flex whitespace-nowrap animate-scroll">
        {duplicatedMessages.map((message, index) => (
          <div
            key={index}
            className="flex-shrink-0 px-12 text-xs sm:text-sm font-semibold tracking-wide"
          >
            {message}
            <span className="mx-12 text-primary-300">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;

