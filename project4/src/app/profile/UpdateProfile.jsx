import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const UpdateProfile = ({ profile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    imgUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    imgUrl: ''
  });

  const { uploadToPinata } = useCart();

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        imgUrl: profile.imgUrl || ''
      });
      setImagePreview(profile.imgUrl || '');
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field immediately
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Họ tên là bắt buộc';
        } else if (value.trim().split(' ').length < 2) {
          error = 'Vui lòng nhập đầy đủ họ và tên';
        } else if (/[\d!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = 'Họ tên không được chứa số hoặc ký tự đặc biệt';
        }
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!value.trim()) {
          error = 'Email là bắt buộc';
        } else if (!emailRegex.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;

      case 'phoneNumber':
        if (value.trim()) {
          const phoneRegex = /^(0|\+84)([1-9][0-9]{8}|[1-9][0-9]{8})$/;
          if (!phoneRegex.test(value)) {
            error = 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)';
          }
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  };

  const validateForm = () => {
    // Validate all fields
    const isFullNameValid = validateField('fullName', formData.fullName);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phoneNumber', formData.phoneNumber);

    return isFullNameValid && isEmailValid && isPhoneValid;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file', {
          duration: 3000,
          position: "top-center"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must not exceed 5MB', {
          duration: 3000,
          position: "top-center"
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
      
      toast.success('Image selected successfully!', {
        duration: 2000,
        position: "top-right"
      });
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.imgUrl;

    setUploadingImage(true);
    try {
      toast.loading('Uploading image...', { id: 'upload-image' });
      
      const imageUrl = await uploadToPinata(selectedImage);
      setFormData(prev => ({ ...prev, imgUrl: imageUrl }));
      
      toast.success('Image uploaded successfully!', {
        id: 'upload-image',
        duration: 2000,
        position: "top-right"
      });
      
      return imageUrl;
    } catch (error) {
      toast.error('Failed to upload image. Please try again.', {
        id: 'upload-image',
        duration: 4000,
        position: "top-center"
      });
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    setLoading(true);
    
    try {
      toast.loading('Đang cập nhật thông tin...', { id: 'update-profile' });
      
      let imageUrl = formData.imgUrl;
      
      // Upload image if new image is selected
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { fullName, phoneNumber, email } = formData;
      await authService.updateProfile(fullName, phoneNumber, email, imageUrl);
      
      toast.success('Cập nhật thông tin thành công!', {
        id: 'update-profile',
        duration: 3000,
        position: "top-center"
      });
      
      setSelectedImage(null);
      
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại sau.', {
        id: 'update-profile',
        duration: 4000,
        position: "top-center"
      });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      email: profile.email || '',
      imgUrl: profile.imgUrl || ''
    });
    setSelectedImage(null);
    setImagePreview(profile.imgUrl || '');
    toast.dismiss(); // Dismiss any active toasts
    
    toast.success('Form reset successfully', {
      duration: 2000,
      position: "top-right"
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Cập nhật thông tin</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Avatar Upload Section */}
        <div className={styles.formGroup}>
          <label>Ảnh đại diện</label>
          <div className={styles.avatarUpload}>
            <div className={styles.avatarPreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <span>Chưa có ảnh</span>
                </div>
              )}
            </div>
            <div className={styles.avatarUploadControls}>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="avatar" className={styles.uploadBtn}>
                Chọn ảnh
              </label>
              {selectedImage && (
                <span className={styles.fileName}>{selectedImage.name}</span>
              )}
            </div>
          </div>
          {errors.imgUrl && <span className={styles.errorMessage}>{errors.imgUrl}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={(e) => validateField('fullName', e.target.value)}
            required
            placeholder="Nhập họ và tên"
            className={errors.fullName ? styles.errorInput : ''}
          />
          {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={(e) => validateField('email', e.target.value)}
            required
            placeholder="Nhập địa chỉ email"
            className={errors.email ? styles.errorInput : ''}
          />
          {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={(e) => validateField('phoneNumber', e.target.value)}
            placeholder="Nhập số điện thoại"
            className={errors.phoneNumber ? styles.errorInput : ''}
          />
          {errors.phoneNumber && <span className={styles.errorMessage}>{errors.phoneNumber}</span>}
          {!errors.phoneNumber && formData.phoneNumber && (
            <span className={styles.successMessage}>✓ Số điện thoại hợp lệ</span>
          )}
        </div>
        
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={resetForm}>
            Hủy
          </button>
          <button 
            type="submit" 
            className={styles.saveBtn} 
            disabled={loading || uploadingImage || Object.values(errors).some(error => error !== '')}
          >
            {loading ? 'Đang lưu...' : uploadingImage ? 'Đang tải ảnh...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;