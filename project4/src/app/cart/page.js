"use client"

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '../styles/cart.module.css';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaTag } from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { createOrder, setOrderId, getOrderId, setCartItemsToCookie, updateFoodOrder } from '../api/order/orderService';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Nếu người dùng chưa đăng nhập, không hiển thị nội dung trang
  if (!user) {
    return <div className={styles.loading}>Đang chuyển hướng đến trang đăng nhập...</div>;
  }

  const handleApplyDiscount = () => {
    // Mock discount codes - in real app, these would be validated against a backend
    const validCodes = {
      'WELCOME10': 0.1,
      'SUMMER20': 0.2,
      'SPECIAL15': 0.15
    };

    if (validCodes[discountCode]) {
      setDiscountApplied(true);
      setDiscountError('');
      toast.success('Đã áp dụng mã giảm giá thành công!');
    } else {
      setDiscountError('Mã giảm giá không hợp lệ');
      setDiscountApplied(false);
      toast.error('Mã giảm giá không hợp lệ');
    }
  };

  const calculateDiscount = () => {
    if (!discountApplied) return 0;
    const validCodes = {
      'WELCOME10': 0.1,
      'SUMMER20': 0.2,
      'SPECIAL15': 0.15
    };
    return getCartTotal() * validCodes[discountCode];
  };

  const finalTotal = getCartTotal() - calculateDiscount();

  // Xử lý checkout - kiểm tra order trong cookies và gọi updateFoodOrder nếu cần
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống!');
      return;
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục!');
      router.push('/login');
      return;
    }

    setIsCheckingOut(true);
    try {
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

          toast.success('Đơn hàng đã được cập nhật!');

          // Chuyển đến payment
          router.push('/payment');
        } catch (updateError) {
          console.error('Error updating food order:', updateError);
          toast.error('Không thể cập nhật đơn hàng. Vui lòng thử lại!');
        }

        return;
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
        throw new Error('Không thể lấy mã đơn hàng từ phản hồi');
      }

      // Lưu orderId và cart items vào cookie
      setOrderId(orderId);
      setCartItemsToCookie(cartItems);

      toast.success('Đã tạo đơn hàng thành công!');

      // Chuyển hướng đến payment
      router.push('/payment');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsCheckingOut(false);
    }
  };


  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.cart}
      >
        <div className={styles.cartHeader}>
          <h1>Giỏ Hàng</h1>
          <span className={styles.itemCount}>{cartItems.length} sản phẩm</span>
        </div>

        <div className={styles.cartContainer}>
          <div className={styles.cartItems}>
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={styles.cartItem}
                >
                  <div className={styles.itemImageContainer}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemPrice}>{item.price.toLocaleString()} VNĐ</p>
                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={styles.quantityButton}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    <span>{(item.price * item.quantity).toLocaleString()} VNĐ</span>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.cartSummary}
          >
            <h3>Tóm Tắt Đơn Hàng</h3>
            <div className={styles.summaryContent}>


              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Tổng cộng</span>
                <span>{finalTotal.toLocaleString()} VNĐ</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={styles.checkoutButton}
              >
                {isCheckingOut ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
              </button>
              <Link href="/menu" className={styles.continueShopping}>
                <FaArrowLeft /> Tiếp tục mua sắm
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default CartPage; 