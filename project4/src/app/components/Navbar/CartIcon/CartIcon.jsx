"use client"

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './CartIcon.module.css';
import { FaShoppingCart } from 'react-icons/fa';
import CartDropdown from '../CartDropdown/CartDropdown';

const CartIcon = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCartIconClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/cart');
  };

  const handleMouseEnter = () => {
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent cart navigation when clicking inside dropdown
  };

  return (
    <div 
      className={styles.cartIcon}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{zIndex: 10000000}}
    >
      <FaShoppingCart 
        className={styles.icon} 
        onClick={handleCartIconClick}
        style={{ cursor: 'pointer' }}
      />
      {user && cartItems.length > 0 && (
        <span className={styles.badge}>{cartItems.length}</span>
      )}
      {user && showDropdown && (
        <div onClick={handleDropdownClick}>
          <CartDropdown />
        </div>
      )}
    </div>
  );
};

export default CartIcon; 