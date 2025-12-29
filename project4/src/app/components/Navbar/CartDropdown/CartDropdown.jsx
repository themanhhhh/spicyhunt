"use client"

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { createOrder, setOrderId, getOrderId, setCartItemsToCookie, updateFoodOrder } from '../../../api/order/orderService';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './CartDropdown.module.css';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CartDropdown = () => {
  const { cartItems, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const router = useRouter();

  const handleRemoveClick = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCart(itemId);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      toast.error('Please login to continue!');
      router.push('/login');
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      // Kiểm tra xem đã có orderId trong cookies chưa
      const existingOrderId = getOrderId();
      
      if (existingOrderId) {
        // Nếu đã có order trong cookies, gọi updateFoodOrder với cart hiện tại
        console.log('Using existing order ID from cookies:', existingOrderId);
        
        const foodInfo = {
          foodInfo: cartItems.map(item => ({
            foodId: item.id,
            quantity: item.quantity
          }))
        };
        console.log('Updating existing order with current cart:', foodInfo);
        
        try {
          await updateFoodOrder(existingOrderId, foodInfo);
          console.log('Food order updated successfully');
          
          // Cập nhật cart items trong cookie
          setCartItemsToCookie(cartItems);
          
          toast.success('Order updated with current cart!');
          
          // Chuyển đến payment
          router.push('/payment');
        } catch (updateError) {
          console.error('Error updating food order:', updateError);
          toast.error('Failed to update order. Please try again!');
        }
        
        return;
      } else {
        console.log('No existing order ID found in cookies, creating new order');
      }

      // Chuyển đổi cartItems thành foodInfo format
      const foodInfo = cartItems.map(item => ({
        foodId: item.id,
        quantity: item.quantity
      }));

      console.log('Creating new order with foodInfo:', foodInfo);
      
      // Gọi API tạo order mới
      const response = await createOrder(foodInfo);
      
      // Lấy orderId từ response
      const orderId = typeof response === 'number' ? response : response.id || response.data?.id;
      
      console.log('New order created with ID:', orderId);
      
      if (!orderId) {
        throw new Error('Unable to get order ID from response');
      }
      
      // Lưu orderId và cart items vào cookie
      setOrderId(orderId);
      setCartItemsToCookie(cartItems);
      
      toast.success('Order created successfully!');
      
      // Chuyển hướng đến trang payment
      router.push('/payment');
      
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.message || 'Error creating order. Please try again!');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={styles.cartDropdown}
      onClick={handleDropdownClick}
    >
      <div className={styles.cartHeader}>
        <h3>Your Cart</h3>
        <span>{cartItems.length} items</span>
      </div>

      <div className={styles.cartItems}>
        <AnimatePresence>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={styles.cartItem}
              >
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h4>{item.name}</h4>
                  <p>{item.price} VNĐ x {item.quantity}</p>
                </div>
                <button
                  onClick={(e) => handleRemoveClick(e, item.id)}
                  className={styles.removeButton}
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {cartItems.length > 0 && (
        <>
          <div className={styles.cartTotal}>
            <span>Total:</span>
            <span>{getCartTotal()} VNĐ</span>
          </div>
          <div className={styles.cartActions}>
            <Link href="/cart" className={styles.viewCartButton}>
              View Cart
            </Link>
            <button 
              onClick={handleCheckout}
              className={styles.checkoutButton}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CartDropdown; 