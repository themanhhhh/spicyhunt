"use client";
import React, { useState, useEffect, useRef } from "react";
import ordertableService from "../../../api/ordertable/ordertableService";
import styles from "./order_table.module.css";
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const Page = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [successFadeOut, setSuccessFadeOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const successTimeoutRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    description: '',
    phoneNumber: '',
    periodType: 'LUNCH',
    tableId: '',
  });

  // Fetch available tables for selection
  const fetchTables = async () => {
    try {
      setTablesLoading(true);
      console.log('Fetching active tables...');
      const response = await ordertableService.getActiveTable(0, 100);
      console.log('API Response:', response);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách bàn");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setTables([]);
        return;
      }
      
      // API returns array directly, not in response.data
      if (response && Array.isArray(response)) {
        setTables(response);
        console.log('Tables loaded:', response.length);
        
      } else if (response && response.data && Array.isArray(response.data)) {
        // Fallback in case API structure changes
        setTables(response.data);
        console.log('Tables loaded from data field:', response.data.length);
        
      } else {
        console.log('Invalid response format:', response);
        setTables([]);
        toast.error("Dữ liệu bàn trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách bàn. Vui lòng thử lại!");
      setTables([]);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // Auto-hide success message after 3 seconds with fade animation
  const setSuccessWithAutoHide = (message) => {
    setSuccess(message);
    setSuccessFadeOut(false);
    
    // Clear any existing timeouts
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    
    // Start fade out after 2.5 seconds
    successTimeoutRef.current = setTimeout(() => {
      setSuccessFadeOut(true);
      
      // Completely hide after fade animation (0.5s)
      fadeTimeoutRef.current = setTimeout(() => {
        setSuccess(null);
        setSuccessFadeOut(false);
      }, 500);
    }, 2500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user types
    if (success) {
      setSuccess(null);
      setSuccessFadeOut(false);
      // Clear timeout if user starts typing
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Vui lòng nhập email hợp lệ', {
        duration: 3000,
        position: "top-center"
      });
      return false;
    }
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên đầy đủ', {
        duration: 3000,
        position: "top-center"
      });
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error('Vui lòng nhập số điện thoại', {
        duration: 3000,
        position: "top-center"
      });
      return false;
    }
    if (!formData.tableId) {
      toast.error('Vui lòng chọn bàn', {
        duration: 3000,
        position: "top-center"
      });
      return false;
    }
    
    if (formData.description.trim().length < 5) {
      toast.error('Mô tả phải có ít nhất 5 ký tự', {
        duration: 3000,
        position: "top-center"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Show confirmation modal instead of directly creating order
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async (confirmed) => {
    setShowConfirmModal(false);
    
    if (!confirmed) {
      // User cancelled - create order with CANCELLED status
      await createOrder('CANCELLED');
      return;
    }

    // User confirmed - create order with SUCCESS status
    await createOrder('SUCCESS');
  };

  const createOrder = async (orderTableState) => {
    setLoading(true);
    setSuccess(null);

    try {
      toast.loading("Đang tạo đơn đặt bàn...", { id: "create-order" });
      
      
      
      const response = await ordertableService.createOrder(
        formData.email,
        formData.fullName,
        formData.description,
        formData.phoneNumber,
        formData.periodType,
        parseInt(formData.tableId),
       
        orderTableState
      );

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tạo đơn đặt bàn");
        toast.error(errorMessage, {
          id: "create-order",
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      if (response) {
        const statusMessage = orderTableState === 'SUCCESS' 
          ? `Đã tạo đơn đặt bàn cho ${formData.fullName} thành công!`
          : `Đã hủy đơn đặt bàn cho ${formData.fullName}!`;
        
        toast.success(statusMessage, {
          id: "create-order",
          duration: 3000,
          position: "top-center"
        });
        
        // Reset form
        setFormData({
          email: '',
          fullName: '',
          description: '',
          phoneNumber: '',
          periodType: 'LUNCH',
          tableId: '',
       
        });
        // Refresh tables
        fetchTables();
      }
    } catch (err) {
      console.error("Error creating order:", err);
      const errorMessage = getErrorMessage(err, 'Không thể tạo đơn đặt bàn. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "create-order",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  
  const formatDateTimeForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return '';
    
   
    const date = new Date(dateTimeLocal);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Order Table</h1>
      
      {success && (
        <div className={`${styles.success} ${successFadeOut ? styles.fadeOut : ''}`}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.orderForm}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter customer email"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="fullName" className={styles.label}>Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter customer full name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>Phone Number *</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tableId" className={styles.label}>Select Table *</label>
          <select
            id="tableId"
            name="tableId"
            value={formData.tableId}
            onChange={handleInputChange}
            className={styles.select}
            required
            disabled={tablesLoading}
          >
            <option value="">
              {tablesLoading ? 'Loading tables...' : 'Choose a table'}
            </option>
            {!tablesLoading && tables.length > 0 ? (
              tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} - {table.numberOfChair} chairs ({table.state})
                </option>
              ))
            ) : !tablesLoading && tables.length === 0 ? (
              <option value="" disabled>No available tables</option>
            ) : null}
          </select>
          {tablesLoading && (
            <small className={styles.loadingText}>Loading available tables...</small>
          )}
          {!tablesLoading && tables.length === 0 && (
            <small className={styles.warningText}>No available tables found</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="periodType" className={styles.label}>Period Type</label>
          <select
            id="periodType"
            name="periodType"
            value={formData.periodType}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="MORNING">Morning (08:00 - 11:00)</option>
            <option value="LUNCH">Lunch (11:00 - 14:00)</option>
            <option value="AFTERNOON">Afternoon (14:00 - 17:00)</option>
            <option value="EVENING">Evening (17:00 - 22:00)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Description (minimum 5 characters) *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Enter any special requirements or notes (minimum 5 characters)"
            rows={4}
            required
          />
          <small className={`${styles.helperText} ${formData.description.trim().length >= 5 ? styles.valid : ''}`}>
            {formData.description.length}/5 characters minimum
          </small>
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Create Order'}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Order Creation</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to create this order for <strong>{formData.fullName}</strong>?
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => handleConfirmOrder(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={() => handleConfirmOrder(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
