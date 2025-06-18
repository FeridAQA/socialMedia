// components/layout/Footer.tsx
import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    // footer-ə hündürlüyü 12 (48px) təyin edirik və flex-shrink-0 veririk.
    <footer className={`bg-gray-800 text-white p-4 text-center text-sm flex-shrink-0 h-12 ${className || ''}`}>
      <p>&copy; 2024 My Social Media. Bütün hüquqlar qorunur.</p>
    </footer>
  );
};