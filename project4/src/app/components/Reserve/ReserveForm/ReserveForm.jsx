"use client";
import React, { useState, useEffect } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineHttp, MdOutlineContentCopy } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { CiTimer } from "react-icons/ci";
import { GoPersonAdd } from "react-icons/go";
import {
  TiSocialFacebook,
  TiSocialTwitter,
  TiSocialInstagram
} from "react-icons/ti";
import { FaPhoneAlt } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import { MdTableRestaurant } from "react-icons/md";

import Style from "./ReserveForm.module.css";
import { Button } from "../../componentsindex";
import ordertableService from "../../../api/ordertable/ordertableService";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const Form = () => {
  const t = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    description: '',
    phoneNumber: '',
    periodType: 'LUNCH',
    tableId: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch available tables when component mounts or user changes
  useEffect(() => {
    fetchTables();
  }, [user]);

  const fetchTables = async () => {
    try {
      setTablesLoading(true);

      // Chỉ fetch tables khi người dùng đã đăng nhập
      if (!user) {
        setTables([]);
        return;
      }

      const response = await ordertableService.getActiveTable(0, 100);

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách bàn trống");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setTables([]);
        return;
      }

      if (response && Array.isArray(response)) {
        setTables(response);

      } else if (response && response.data && Array.isArray(response.data)) {
        setTables(response.data);
        console.log("Tables loaded:", response.data.length);
      } else {
        setTables([]);
        toast.error("Không có bàn trống khả dụng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách bàn trống. Vui lòng thử lại!");
      setTables([]);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setTablesLoading(false);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Tên là bắt buộc';
        } else if (value.trim().length < 2) {
          error = 'Tên phải có ít nhất 2 ký tự';
        } else if (value.trim().length > 50) {
          error = 'Tên không được vượt quá 50 ký tự';
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value.trim())) {
          error = 'Tên chỉ được chứa chữ cái và khoảng trắng';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email là bắt buộc';
        } else if (value.trim().length > 100) {
          error = 'Email không được vượt quá 100 ký tự';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Email không hợp lệ (ví dụ: example@gmail.com)';
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          error = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9+\-\s()]+$/.test(value.trim())) {
          error = 'Số điện thoại chỉ được chứa số và các ký tự +, -, (), khoảng trắng';
        } else if (value.replace(/[^0-9]/g, '').length < 10) {
          error = 'Số điện thoại phải có ít nhất 10 chữ số';
        } else if (value.replace(/[^0-9]/g, '').length > 15) {
          error = 'Số điện thoại không được vượt quá 15 chữ số';
        }
        break;

      case 'tableId':
        if (!value) {
          error = 'Vui lòng chọn bàn';
        } else if (tables.length > 0 && !tables.find(table => table.id.toString() === value.toString())) {
          error = 'Bàn được chọn không tồn tại';
        }
        break;

        // orderTime validation removed since the field is no longer in the form
        break;

      case 'description':
        if (!value.trim()) {
          error = 'Mô tả yêu cầu đặc biệt là bắt buộc';
        } else if (value.trim().length < 5) {
          error = 'Mô tả phải có ít nhất 5 ký tự';
        } else if (value.trim().length > 500) {
          error = 'Mô tả không được vượt quá 500 ký tự';
        }
        break;

      case 'periodType':
        const validPeriodTypes = ['MORNING', 'LUNCH', 'EVENING', 'AFTERNOON'];
        if (!validPeriodTypes.includes(value)) {
          error = 'Thời gian phục vụ không hợp lệ';
        }
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Tên phải có ít nhất 2 ký tự';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Tên không được vượt quá 50 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (formData.email.trim().length > 100) {
      newErrors.email = 'Email không được vượt quá 100 ký tự';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ (ví dụ: example@gmail.com)';
    }

    // Validate phoneNumber
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại chỉ được chứa số và các ký tự +, -, (), khoảng trắng';
    } else if (formData.phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      newErrors.phoneNumber = 'Số điện thoại phải có ít nhất 10 chữ số';
    } else if (formData.phoneNumber.replace(/[^0-9]/g, '').length > 15) {
      newErrors.phoneNumber = 'Số điện thoại không được vượt quá 15 chữ số';
    }

    // Validate tableId
    if (!formData.tableId) {
      newErrors.tableId = 'Vui lòng chọn bàn';
    } else if (tables.length > 0 && !tables.find(table => table.id.toString() === formData.tableId.toString())) {
      newErrors.tableId = 'Bàn được chọn không tồn tại';
    }

    // orderTime validation removed since the field is no longer in the form

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả yêu cầu đặc biệt là bắt buộc';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Mô tả phải có ít nhất 5 ký tự';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    // Validate periodType (should always be valid from select, but just in case)
    const validPeriodTypes = ['MORNING', 'LUNCH', 'EVENING', 'AFTERNOON'];
    if (!validPeriodTypes.includes(formData.periodType)) {
      newErrors.periodType = 'Thời gian phục vụ không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is complete and valid
  const isFormComplete = () => {
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'tableId', 'description', 'periodType'];
    const allFieldsFilled = requiredFields.every(field => formData[field] && formData[field].toString().trim());
    const noErrors = Object.values(errors).every(error => !error);
    return allFieldsFilled && noErrors;
  };

  // Format datetime for API
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
    try {
      setLoading(true);

      // Kiểm tra authentication trước khi tạo order
      if (!user) {
        toast.error('Vui lòng đăng nhập để đặt bàn!', {
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      toast.loading("Đang tạo đơn đặt bàn...", { id: "create-reservation" });

      // Use current datetime for API since orderTime field is removed
      const currentDateTime = new Date();
      const formattedDateTime = formatDateTimeForAPI(currentDateTime.toISOString().slice(0, 16));

      // Call ordertableService.createOrder with individual parameters
      const response = await ordertableService.createOrder(
        formData.email,
        formData.fullName,
        formData.description,
        formData.phoneNumber,
        formData.periodType,
        parseInt(formData.tableId),
        formattedDateTime,
        orderTableState
      );

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tạo đơn đặt bàn");
        toast.error(errorMessage, {
          id: "create-reservation",
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      if (response) {
        const statusMessage = orderTableState === 'SUCCESS'
          ? `Đã tạo đơn đặt bàn cho ${formData.fullName} thành công! Chúng tôi sẽ liên hệ để xác nhận.`
          : `Đã hủy đơn đặt bàn cho ${formData.fullName}!`;

        toast.success(statusMessage, {
          id: "create-reservation",
          duration: 4000,
          position: "top-center"
        });

        // Reset form
        setFormData({
          email: '',
          fullName: '',
          description: '',
          phoneNumber: '',
          periodType: 'LUNCH',
          tableId: ''
        });
        // Refresh tables
        fetchTables();
      } else {
        throw new Error('Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      const errorMessage = getErrorMessage(error, 'Không thể tạo đơn đặt bàn. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "create-reservation",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  // getCurrentDateTime function removed since orderTime field is no longer needed

  return (
    <div className={Style.Form}>
      <div className={Style.Form_box}>
        {!user && (
          <div className={Style.loginNotice}>
            <p> Vui lòng đăng nhập để có thể đặt bàn và xem danh sách bàn trống.</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={Style.Form_box_input}>
            <label htmlFor="fullName">{t('reserve.form.fullName')} *</label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              placeholder={t('reserve.form.fullName')}
              className={Style.Form_box_input_userName}
              maxLength={50}
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            {errors.fullName && <span className={Style.error}>{errors.fullName}</span>}
            {!errors.fullName && formData.fullName && <small className={Style.helper}>✓ Tên hợp lệ</small>}
          </div>

          <div className={Style.Form_box_contact}>
            <div className={Style.Form_box_contact_input}>
              <label htmlFor="email">{t('reserve.form.email')} *</label>
              <div className={Style.Form_box_contact_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <HiOutlineMail />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder={t('reserve.form.email')}
                  className={Style.Form_box_input_Email}
                  maxLength={100}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.email && <span className={Style.error}>{errors.email}</span>}
              {!errors.email && formData.email && <small className={Style.helper}>✓ Email hợp lệ</small>}
            </div>
            <div className={Style.Form_box_contact_input}>
              <label htmlFor="phoneNumber">{t('reserve.form.phone')} *</label>
              <div className={Style.Form_box_contact_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <FaPhoneAlt />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder={t('reserve.form.phone')}
                  className={Style.Form_box_input_Email}
                  maxLength={20}
                  pattern="[0-9+\-\s()]*"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {errors.phoneNumber && <span className={Style.error}>{errors.phoneNumber}</span>}
              {!errors.phoneNumber && formData.phoneNumber && <small className={Style.helper}>✓ Số điện thoại hợp lệ</small>}
            </div>
          </div>

          <div className={Style.Form_box_input_social}>
            <div className={Style.Form_box_input}>
              <label htmlFor="periodType">{t('reserve.form.periodType')} *</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <CiTimer />
                </div>
                <select
                  name="periodType"
                  id="periodType"
                  value={formData.periodType}
                  onChange={handleInputChange}
                  className={Style.select}
                  required
                >
                  <option value="MORNING">{t('reserve.form.breakfast')}</option>
                  <option value="LUNCH">{t('reserve.form.lunch')}</option>
                  <option value="AFTERNOON">{t('reserve.form.afternoon')}</option>
                  <option value="EVENING">{t('reserve.form.dinner')}</option>

                </select>
              </div>
              {errors.periodType && <span className={Style.error}>{errors.periodType}</span>}
              {!errors.periodType && formData.periodType && <small className={Style.helper}>✓ Thời gian phục vụ hợp lệ</small>}
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="tableId">{t('reserve.form.selectTable')} *</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <MdTableRestaurant />
                </div>
                <select
                  name="tableId"
                  id="tableId"
                  value={formData.tableId}
                  onChange={handleInputChange}
                  className={Style.select}
                  required
                  disabled={tablesLoading}
                >
                  <option value="">
                    {tablesLoading ? t('reserve.form.loading') : t('reserve.form.chooseTable')}
                  </option>
                  {!tablesLoading && tables.length > 0 &&
                    tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} - {table.numberOfChair} {t('reserve.form.seats')}
                      </option>
                    ))
                  }
                </select>
              </div>
              {errors.tableId && <span className={Style.error}>{errors.tableId}</span>}
              {!errors.tableId && formData.tableId && <small className={Style.helper}>✓ Đã chọn bàn</small>}

            </div>
          </div>

          <div className={Style.Form_box_input}>
            <label htmlFor="description">{t('reserve.form.specialRequests')} *</label>
            <textarea
              name="description"
              id="description"
              placeholder={t('reserve.form.placeholder')}
              className={Style.Form_box_input_textarea}
              rows="3"
              maxLength={500}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            {errors.description && <span className={Style.error}>{errors.description}</span>}
            {!errors.description && formData.description && formData.description.length >= 5 && <small className={Style.helper}>✓ Mô tả hợp lệ</small>}
            <small className={Style.charCount}>
              {formData.description.length}/500 ký tự
              {formData.description.length < 5 && ` (tối thiểu 5 ký tự)`}
              {formData.description.length >= 450 && formData.description.length < 500 && ` (còn ${500 - formData.description.length} ký tự)`}
              {formData.description.length >= 500 && ' (đã đạt giới hạn)'}
            </small>
          </div>

          <div className={Style.Form_box_btn}>
            <button
              type="submit"
              className={Style.button}
              disabled={loading || tablesLoading || !isFormComplete()}
            >
              {loading ? (
                <>
                  <FaSpinner className={Style.spinning} />
                  <span className={Style.btnText}>{t('reserve.form.processing')}</span>
                </>
              ) : (
                <span className={Style.btnText}>{t('reserve.form.reserveNow')}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h3 className={Style.modalTitle}>{t('reserve.form.confirmReservation')}</h3>
            <p className={Style.modalMessage}>
              {t('reserve.form.confirmMessage')} <strong>{formData.fullName}</strong>?
            </p>
            <div className={Style.modalButtons}>
              <button
                className={Style.cancelButton}
                onClick={() => handleConfirmOrder(false)}
              >
                {t('reserve.form.cancel')}
              </button>
              <button
                className={Style.confirmButton}
                onClick={() => handleConfirmOrder(true)}
              >
                {t('reserve.form.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default Form;