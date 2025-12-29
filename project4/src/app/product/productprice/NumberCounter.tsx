"use client";

import React, { useEffect, useState } from 'react';
import styles from './NumberCounter.module.css';

interface NumberCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

const NumberCounter: React.FC<NumberCounterProps> = ({ 
  value, 
  duration = 600,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      
      const startValue = displayValue;
      const endValue = value;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + (endValue - startValue) * easeOut;
        setDisplayValue(Math.round(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, duration, displayValue]);

  // Format number with Vietnamese currency format (no decimal places, comma separator)
  const formatValue = (num: number) => {
    return Math.round(num).toLocaleString('vi-VN');
  };

  // Split the formatted value into individual characters for animation
  const formattedValue = formatValue(displayValue);
  const characters = formattedValue.split('');

  return (
    <div className={`${styles.numberCounter} ${className} ${isAnimating ? styles.animating : ''}`}>
     
      {characters.map((char, index) => (
        <span 
          key={`${index}-${char}`}
          className={`${styles.digit} ${char === ',' ? styles.separator : ''}`}
          style={{
            animationDelay: `${index * 50}ms`
          }}
        >
          {char}
        </span>
      ))}
       <span className={styles.currency}>VNĐ</span>
    </div>
  );
};

export default NumberCounter; 