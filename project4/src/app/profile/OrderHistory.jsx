"use client"
import React, { useEffect, useState } from 'react';
import { getOrderByCustomerId } from '@/app/api/order/orderService';
import { authService } from '@/app/api/auth/authService';
import styles from './OrderHistory.module.css';
import { Loader } from '@/app/components/componentsindex';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user profile to get userId
        const profile = await authService.getProfile();
        const userId = profile?._id || profile?.id;
        if (!userId) {
          throw new Error('Unable to get user information');
        }

        // Fetch orders by customer ID
        const ordersData = await getOrderByCustomerId(userId);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        toast.error('Failed to load order history', {
          duration: 3000,
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getOrderStateColor = (state) => {
    switch (state) {
      case 'COMPLETED':
        return styles.completed;
      case 'PROCESSING':
        return styles.processing;
      case 'PENDING':
        return styles.pending;
      case 'CANCELLED':
        return styles.cancelled;
      case 'PAID':
        return styles.paid;
      default:
        return styles.default;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className={styles.paginationButton}
        >
          ‹
        </button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={styles.paginationButton}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className={styles.paginationEllipsis}>
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.paginationButton} ${currentPage === i ? styles.paginationActive : ''
            }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className={styles.paginationEllipsis}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={styles.paginationButton}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className={styles.paginationButton}
        >
          ›
        </button>
      );
    }

    return pages;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Order History</h2>
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Order History</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Start exploring our menu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Order History</h2>
        <div className={styles.headerInfo}>
          <p>View all your past orders</p>
          <div className={styles.orderCount}>
            Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
          </div>
        </div>
      </div>

      <div className={styles.ordersList}>
        {currentOrders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <h3 className={styles.orderName}>{order.name}</h3>
                <p className={styles.orderId}>Order ID: #{order.id}</p>
              </div>
              <div className={`${styles.orderStatus} ${getOrderStateColor(order.orderState)}`}>
                {order.orderState}
              </div>
            </div>

            <div className={styles.orderDetails}>
              {order.description && (
                <div className={styles.orderDescription}>
                  <span className={styles.label}>Description:</span>
                  <span>{order.description}</span>
                </div>
              )}

              <div className={styles.orderMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.label}>Total Price:</span>
                  <span className={styles.price}>{formatPrice(order.totalPrice)}</span>
                </div>

                {order.totalPriceAfterDiscount !== order.totalPrice && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Final Price:</span>
                    <span className={styles.finalPrice}>{formatPrice(order.totalPriceAfterDiscount)}</span>
                  </div>
                )}

                {order.phoneNumber && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Phone:</span>
                    <span>{order.phoneNumber}</span>
                  </div>
                )}

                {order.paymentMethod && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Payment:</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                )}

                {order.takingMethod && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Delivery:</span>
                    <span>{order.takingMethod}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.pagination}>
            {renderPagination()}
          </div>
          <div className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 