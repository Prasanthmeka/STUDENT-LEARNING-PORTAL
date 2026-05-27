import React from 'react';

const LearnoQubeLogo = ({ className = "w-8 h-8" }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cubeTop" x1="100" y1="30" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E879F9" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.95"/>
        </linearGradient>
        <linearGradient id="cubeLeft" x1="40" y1="75" x2="100" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.95"/>
        </linearGradient>
        <linearGradient id="cubeRight" x1="160" y1="75" x2="100" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.95"/>
        </linearGradient>
        <linearGradient id="capGrad" x1="100" y1="55" x2="100" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#F1F5F9"/>
        </linearGradient>
      </defs>

      <path d="M100 30 L160 65 L100 100 L40 65 Z" fill="url(#cubeTop)"/>
      <path d="M40 65 L100 100 L100 170 L40 135 Z" fill="url(#cubeLeft)"/>
      <path d="M100 100 L160 65 L160 135 L100 170 Z" fill="url(#cubeRight)"/>

      <path d="M40 65 L100 100 L160 65" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M100 100 L100 170" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round"/>

      <path d="M100 58 L142 75 L100 92 L58 75 Z" fill="url(#capGrad)" stroke="#E2E8F0" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M78 80 C78 92 122 92 122 80 C122 98 78 98 78 80 Z" fill="#E2E8F0"/>
      <path d="M82 82 C82 94 118 94 118 82 C118 97 82 97 82 82 Z" fill="#FFFFFF"/>

      <path d="M100 75 Q75 80 72 98" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="72" cy="100" r="4.5" fill="#F59E0B" stroke="#EAB308" strokeWidth="1"/>
    </svg>
  );
};

export default LearnoQubeLogo;
