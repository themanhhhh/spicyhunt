"use client"

import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import styles from './CartIcon.module.css';

const CartIcon = () => {
  const { cartItems } = useCart();
  
  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className={styles.cartIcon}>
      <FaShoppingCart className={styles.cartIcon_icon} />
      {totalItems > 0 && (
        <span className={styles.cartIcon_badge}>{totalItems}</span>
      )}
    </div>
  );
};

export default CartIcon; 