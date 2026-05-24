import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatPanel from './AIChatPanel';
import '../styles/AIMascot.css';

const MASCOT_TIPS = [
  "Need help with your Maths homework? 📐",
  "I can summarize any study materials! 📝",
  "Explain photosynthesis in Hindi! 🌿",
  "Let's practice Telugu grammar together! 🇮🇳",
  "Got science doubts? Ask me! 🧬",
  "Ask me to explain any incorrect quiz answers! 🧠",
  "Check out your study recommendations! 🏆",
  "Let's generate a fun practice quiz! ⚡"
];

export default function AIMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);

  // Set up speech bubble rotating interval
  useEffect(() => {
    // Show first bubble after 5 seconds
    const initialTimeout = setTimeout(() => {
      const randomTip = MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)];
      setBubbleText(randomTip);
      setShowBubble(true);
    }, 5000);

    // Rotate tips every 15 seconds
    const interval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        const randomTip = MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)];
        setBubbleText(randomTip);
        setShowBubble(isOpen ? false : true); // don't show bubble if chat panel is open
      }, 1000);
    }, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Listen to the custom open-ai-chat event dispatched by page integrations
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setShowBubble(false);
    };

    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowBubble(false);
    }
  };

  return (
    <>
      <div className="ai-mascot-container" onClick={toggleChat}>
        {/* Animated Speech Bubble */}
        <AnimatePresence>
          {showBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="ai-mascot-bubble"
            >
              {bubbleText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Floating Mascot */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="ai-mascot-img-wrapper"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Subtle winking/waving animation container */}
          <motion.img
            src="/assets/mascot.png"
            alt="AI Educational Mascot"
            className="ai-mascot-img"
            animate={{
              rotate: [0, -3, 3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Slide-in Chat panel */}
      <AIChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
