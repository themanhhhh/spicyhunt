import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { useCart } from '../../../context/CartContext';
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ', {
          duration: 3000,
          position: "top-center"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB', {
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
      
      toast.success('Ảnh đã được chọn thành công!', {
        duration: 2000,
        position: "top-right"
      });
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.imgUrl;

    setUploadingImage(true);
    try {
      toast.loading("Đang upload ảnh...", { id: "upload-image" });
      
      const imageUrl = await uploadToPinata(selectedImage);
      setFormData(prev => ({ ...prev, imgUrl: imageUrl }));
      
      toast.success("Upload ảnh thành công!", {
        id: "upload-image",
        duration: 2000,
        position: "top-right"
      });
      
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = getErrorMessage(error, 'Không thể upload ảnh. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "upload-image",
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
    
    // Validation
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không đúng định dạng!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      toast.loading("Đang cập nhật thông tin...", { id: "update-profile" });
      
      let imageUrl = formData.imgUrl;
      
      // Upload image if new image is selected
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { fullName, phoneNumber, email } = formData;
      const response = await authService.updateProfile(fullName, phoneNumber, email, imageUrl);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật thông tin");
        toast.error(errorMessage, {
          id: "update-profile",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success('Thông tin đã được cập nhật thành công!', {
        id: "update-profile",
        duration: 3000,
        position: "top-center"
      });
      
      setSelectedImage(null);
      
      if (onProfileUpdated) {
        onProfileUpdated(); // Để fetch lại profile mới từ server
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = getErrorMessage(err, 'Không thể cập nhật thông tin. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "update-profile",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
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
    
    toast.success('Form đã được reset!', {
      duration: 2000,
      position: "top-right"
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Update Your Profile</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Avatar Upload Section */}
        <div className={styles.formGroup}>
          <label>Profile Avatar</label>
          <div className={styles.avatarUpload}>
            <div className={styles.avatarPreview}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <span>No Image</span>
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
                Choose Image
              </label>
              {selectedImage && (
                <span className={styles.fileName}>{selectedImage.name}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={resetForm}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading || uploadingImage}>
            {loading ? 'Saving...' : uploadingImage ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;