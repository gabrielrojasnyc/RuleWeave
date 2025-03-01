import React from 'react';

const Logo = ({ size = 'default', color = 'default', className = '' }) => {
  // Get color values based on the color prop
  const getColors = () => {
    switch (color) {
      case 'light':
        return {
          primary: '#4FD1C5', // brand-teal-light
          secondary: '#FFA69E', // brand-coral-light
          text: '#FFFFFF' // white
        };
      case 'dark':
        return {
          primary: '#05746A', // brand-teal-dark
          secondary: '#D84C4C', // brand-coral-dark
          text: '#3E4C59' // brand-charcoal
        };
      default:
        return {
          primary: '#0B9E8E', // brand-teal
          secondary: '#FF6B6B', // brand-coral
          text: '#3E4C59' // brand-charcoal
        };
    }
  };

  // Get width and height based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24 };
      case 'large':
        return { width: 48, height: 48 };
      default:
        return { width: 36, height: 36 };
    }
  };

  const { primary, secondary, text } = getColors();
  const { width, height } = getDimensions();

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
        role="img"
        aria-label="RuleWeave Logo"
      >
        {/* Abstract geometric logo - woven threads forming an "R" */}
        <rect width="36" height="36" rx="8" fill="white" />
        <path d="M8 8H19C22.866 8 26 11.134 26 15C26 18.866 22.866 22 19 22H15L24 32H18L9 22V8Z" fill={primary} />
        <path d="M15 18H19C20.6569 18 22 16.6569 22 15C22 13.3431 20.6569 12 19 12H12V18H15Z" fill="white" />
        <path d="M28 8C28 8 26 14 28 20C30 26 28 28 28 28" stroke={secondary} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="font-heading font-bold text-xl" style={{ color: text }}>RuleWeave</span>
    </div>
  );
};

export default Logo;