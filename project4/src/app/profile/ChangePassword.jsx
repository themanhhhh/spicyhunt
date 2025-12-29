import React, { useState, useRef, useEffect } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const { logout } = useAuth();
  const countdownIntervalRef = useRef(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    current: '',
    next: '',
    confirm: ''
  });

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Validation function
  const validateForm = () => {
    const newErrors = {
      current: '',
      next: '',
      confirm: ''
    };

    // Current password validation
    if (!current.trim()) {
      newErrors.current = 'Mật khẩu hiện tại là bắt buộc';
    } else if (current.length < 6) {
      newErrors.current = 'Mật khẩu hiện tại phải có ít nhất 6 ký tự';
    }

    // New password validation
    if (!next.trim()) {
      newErrors.next = 'Mật khẩu mới là bắt buộc';
    } else if (next.length < 8) {
      newErrors.next = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    } else if (next.length > 30) {
      newErrors.next = 'Mật khẩu mới không được vượt quá 30 ký tự';
    } else if (next === current) {
      newErrors.next = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    // Confirm password validation
    if (!confirm.trim()) {
      newErrors.confirm = 'Xác nhận mật khẩu là bắt buộc';
    } else if (confirm !== next) {
      newErrors.confirm = 'Xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return !newErrors.current && !newErrors.next && !newErrors.confirm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dismiss any existing toasts
    toast.dismiss();

    // Validation
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin nhập vào!', {
        duration: 3000,
        position: "top-center",
        style: {
          background: '#dc3545',
          color: 'white',
          fontWeight: '500',
        }
      });
      return;
    }

    setLoading(true);

    try {
      toast.loading('Đang thay đổi mật khẩu...', {
        id: 'change-password',
        duration: 10000, // Longer duration for loading
        style: {
          background: '#2563eb',
          color: 'white',
          fontWeight: '500',
        }
      });

      const result = await authService.changePassword(current, next, confirm);
      console.log('Password change result:', result);

      toast.success('🎉 Đổi mật khẩu thành công! Sẽ tự động đăng xuất để bảo mật.', {
        id: 'change-password',
        duration: 3000,
        position: "top-center",
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: '500',
        }
      });

      // Clear form and errors
      setCurrent('');
      setNext('');
      setConfirm('');
      setErrors({
        current: '',
        next: '',
        confirm: ''
      });

      // Show logout notification and then logout
      setTimeout(() => {
        toast.loading('🔐 Đang đăng xuất để bảo mật... (3 giây)', {
          id: 'logout-notice',
          duration: 3000,
          style: {
            background: '#f59e0b',
            color: 'white',
            fontWeight: '500',
          }
        });

        // Countdown and logout
        let countdown = 3;
        countdownIntervalRef.current = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            toast.loading(`🔐 Đang đăng xuất để bảo mật... (${countdown} giây)`, {
              id: 'logout-notice',
              style: {
                background: '#f59e0b',
                color: 'white',
                fontWeight: '500',
              }
            });
          } else {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            toast.loading('🔐 Đang chuyển hướng...', {
              id: 'logout-notice',
              style: {
                background: '#ef4444',
                color: 'white',
                fontWeight: '500',
              }
            });
            setTimeout(() => {
              logout();
            }, 500);
          }
        }, 1000);
      }, 2000);

    } catch (err) {
      console.error('Error changing password:', err);

      // Handle different error types
      let errorMessage = 'Đổi mật khẩu thất bại. Vui lòng thử lại!';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Mật khẩu hiện tại không đúng!';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này!';
        } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
          errorMessage = 'Thông tin mật khẩu không hợp lệ!';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối!';
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage, {
        id: 'change-password',
        duration: 5000,
        position: "top-center",
        style: {
          background: '#dc3545',
          color: 'white',
          fontWeight: '500',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setErrors({
      current: '',
      next: '',
      confirm: ''
    });
    toast.dismiss(); // Dismiss any active toasts

    toast.success('🧹 Đã xóa form', {
      duration: 1500,
      position: "top-right",
      style: {
        background: '#10b981',
        color: 'white',
        fontWeight: '500',
      }
    });
  };

  // Real-time validation
  const handleInputChange = (field, value) => {
    switch (field) {
      case 'current':
        setCurrent(value);
        break;
      case 'next':
        setNext(value);
        break;
      case 'confirm':
        setConfirm(value);
        break;
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}> Đổi mật khẩu</div>
      <div className={styles.securityNotice}>
        <span>🛡️ Lưu ý: Sau khi đổi mật khẩu thành công, bạn sẽ được tự động đăng xuất để đảm bảo bảo mật.</span>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.formGroup}>
          <label>Mật khẩu hiện tại *</label>
          <input
            type="password"
            value={current}
            onChange={e => handleInputChange('current', e.target.value)}
            required
            minLength={6}
            placeholder="Nhập mật khẩu hiện tại"
            autoComplete="current-password"
            className={errors.current ? styles.errorInput : ''}
            disabled={loading}
          />
          {errors.current && <span className={styles.errorMessage}>{errors.current}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Mật khẩu mới *</label>
          <input
            type="password"
            value={next}
            onChange={e => handleInputChange('next', e.target.value)}
            required
            minLength={8}
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
            className={errors.next ? styles.errorInput : ''}
            disabled={loading}
          />
          {errors.next && <span className={styles.errorMessage}>{errors.next}</span>}
          {!errors.next && next && (
            <span className={styles.inputHint}>
              💡 Tối thiểu 8 ký tự, tối đa 30 ký tự
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Xác nhận mật khẩu mới *</label>
          <input
            type="password"
            value={confirm}
            onChange={e => handleInputChange('confirm', e.target.value)}
            required
            minLength={8}
            placeholder="Xác nhận mật khẩu mới"
            autoComplete="new-password"
            className={errors.confirm ? styles.errorInput : ''}
            disabled={loading}
          />
          {errors.confirm && <span className={styles.errorMessage}>{errors.confirm}</span>}
          {!errors.confirm && confirm && next && confirm === next && (
            <span className={styles.successMessage}>✅ Mật khẩu khớp</span>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={resetForm} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xóa'}
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? '🔄 Đang đổi...' : ' Đổi mật khẩu & Đăng xuất'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 