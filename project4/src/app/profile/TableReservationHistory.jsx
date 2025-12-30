"use client"
import React, { useEffect, useState } from 'react';
import ordertableService from '@/app/api/ordertable/ordertableService';
import { authService } from '@/app/api/auth/authService';
import styles from './TableReservationHistory.module.css';
import { Loader } from '@/app/components/componentsindex';
import toast from 'react-hot-toast';

const TableReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [metadata, setMetadata] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const reservationsPerPage = 10;

  const fetchReservations = async (page = 1) => {
    try {
      // Use pageLoading for subsequent page changes, loading for initial load
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }
      setError(null);

      // Get current user profile to get userId
      const profile = await authService.getProfile();
      const userId = profile?._id || profile?.id;
      if (!userId) {
        throw new Error('Unable to get user information');
      }

      // Convert from 1-based to 0-based page for API
      const apiPage = page - 1;

      // Fetch table reservations by current user with pagination
      const response = await ordertableService.getOrderTableByUser(userId, apiPage, reservationsPerPage);

      // Handle response structure with data array and metadata
      if (response && response.data && Array.isArray(response.data)) {
        setReservations(response.data);
        setMetadata(response.metadata || null);
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setReservations(response);
        setMetadata(null);
      } else {
        setReservations([]);
        setMetadata(null);
      }
    } catch (err) {
      console.error('Error fetching table reservations:', err);
      setError(err.message);
      toast.error('Không thể tải lịch sử đặt bàn', {
        duration: 3000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(currentPage);
  }, [currentPage]);

  const getReservationStateColor = (state) => {
    switch (state) {
      case 'SUCCESS':
        return styles.success;
      case 'CONFIRMED':
        return styles.confirmed;
      case 'PENDING':
        return styles.pending;
      case 'CANCELLED':
        return styles.cancelled;
      case 'COMPLETED':
        return styles.completed;
      default:
        return styles.default;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    // Handle both ISO string and timestamp
    const date = typeof dateTime === 'number' ? new Date(dateTime) : new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination logic - use server-side pagination
  const totalPages = metadata?.totalPages || 1;
  const totalElements = metadata?.totalElements || reservations.length;
  const currentPageSize = metadata?.pageSize || reservationsPerPage;
  const currentPageNumber = metadata?.page || (currentPage - 1);

  // For display purposes - show all reservations since they're already paginated by server
  const currentReservations = reservations;
  const startIndex = currentPageNumber * currentPageSize;
  const endIndex = Math.min(startIndex + currentReservations.length, totalElements);

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
          disabled={pageLoading}
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
          disabled={pageLoading}
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
          disabled={pageLoading}
        >
          {pageLoading && currentPage === i ? '...' : i}
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
          disabled={pageLoading}
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
          disabled={pageLoading}
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
          <h2>Lịch Sử Đặt Bàn</h2>
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Lịch Sử Đặt Bàn</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🪑</div>
          <h3>Chưa Có Đặt Bàn Nào</h3>
          <p>Bạn chưa đặt bàn nào. Hãy đặt bàn để trải nghiệm dịch vụ của chúng tôi!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lịch Sử Đặt Bàn</h2>
        <div className={styles.headerInfo}>
          <p>Xem tất cả lịch sử đặt bàn của bạn</p>
          <div className={styles.reservationCount}>
            Hiển thị {startIndex + 1}-{endIndex} trong tổng số {totalElements} đặt bàn
          </div>
        </div>
      </div>

      <div className={styles.reservationsList}>
        {currentReservations.map((reservation) => (
          <div key={reservation.id} className={styles.reservationCard}>
            <div className={styles.reservationHeader}>
              <div className={styles.reservationInfo}>
                <h3 className={styles.reservationName}>
                  {reservation.fullName || 'Đặt bàn'}
                </h3>
                <p className={styles.reservationId}>Mã đặt bàn: #{reservation.id}</p>
                {reservation.tableName && (
                  <p className={styles.tableName}>{reservation.tableName}</p>
                )}
              </div>
              <div className={`${styles.reservationStatus} ${getReservationStateColor(reservation.orderTableState)}`}>
                {reservation.orderTableState || 'PENDING'}
              </div>
            </div>

            <div className={styles.reservationDetails}>
              {reservation.description && (
                <div className={styles.reservationDescription}>
                  <span className={styles.label}>Mô tả:</span>
                  <span>{reservation.description}</span>
                </div>
              )}

              <div className={styles.reservationMeta}>
                {reservation.tableName && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Bàn:</span>
                    <span>{reservation.tableName}</span>
                  </div>
                )}

                {reservation.orderTime && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Thời gian đặt:</span>
                    <span>{formatDateTime(reservation.orderTime)}</span>
                  </div>
                )}

                {reservation.periodType && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Khung giờ:</span>
                    <span>{reservation.periodType}</span>
                  </div>
                )}

                {reservation.phoneNumber && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Điện thoại:</span>
                    <span>{reservation.phoneNumber}</span>
                  </div>
                )}

                {reservation.email && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Email:</span>
                    <span>{reservation.email}</span>
                  </div>
                )}

                {reservation.createdAt && (
                  <div className={styles.metaItem}>
                    <span className={styles.label}>Ngày đặt:</span>
                    <span>{formatDateTime(reservation.createdAt)}</span>
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
            Trang {currentPage} / {totalPages}
            {metadata && (
              <span className={styles.apiInfo}>
                (API: Page {metadata.page + 1} of {metadata.totalPages})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReservationHistory; 