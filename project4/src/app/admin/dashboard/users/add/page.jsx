'use client';
import React, { useState } from "react";
import styles from "./add.module.css";
import { userService } from "../../../../api/user/userService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AddUserPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    phoneNumber: '',
    email: '',
    role: '',
    state: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateFullName = (value) => {
    if (!value.trim()) return 'Full name is required';
    if (value.trim().length < 2) return 'Full name must be at least 2 characters';
    return '';
  };

  const validateUsername = (value) => {
    if (!value.trim()) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers and underscore';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const validatePhoneNumber = (value) => {
    if (!value.trim()) return 'Phone number is required';
    // Vietnamese phone number pattern
    const phoneRegex = /^(\+84|84|0)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Invalid Vietnamese phone number format';
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return '';
  };

  const validateRole = (value) => {
    if (!value) return 'Role is required';
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'username':
        return validateUsername(value);
      case 'password':
        return validatePassword(value);
      case 'phoneNumber':
        return validatePhoneNumber(value);
      case 'email':
        return validateEmail(value);
      case 'role':
        return validateRole(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'state') { // state has default value, no need to validate
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await userService.addUser(
        formData.fullName,
        formData.username,
        formData.password,
        formData.phoneNumber,
        formData.email,
        formData.role,
        formData.state
      );
      
      // Check if API response contains error
      if (result.code && result.code !== 200) {
        // API returned error with code
        const errorMessage = result.message || 'Failed to add user. Please try again.';
        toast.error(errorMessage);
        return;
      }
      
      // Check if response has error field or unsuccessful structure
      if (result.error || (result.code && result.code >= 1000)) {
        const errorMessage = result.message || result.error || 'Failed to add user. Please try again.';
        toast.error(errorMessage);
        return;
      }
      
      // Success case
      toast.success("User added successfully!");
      router.push('/admin/dashboard/users');
    } catch (error) {
      console.error('Error adding user:', error);
      
      // Parse error response to get message from API
      let errorMessage = 'Failed to add user. Please try again.';
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        // Check if response has the expected format with message field
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            className={errors['fullName'] ? styles.errorInput : ''}
          />
          {errors['fullName'] && <span className={styles.errorText}>{errors['fullName']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            className={errors['username'] ? styles.errorInput : ''}
          />
          {errors['username'] && <span className={styles.errorText}>{errors['username']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password (min 8 characters)"
            className={errors['password'] ? styles.errorInput : ''}
          />
          {errors['password'] && <span className={styles.errorText}>{errors['password']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number (e.g: 0901234567)"
            className={errors['phoneNumber'] ? styles.errorInput : ''}
          />
          {errors['phoneNumber'] && <span className={styles.errorText}>{errors['phoneNumber']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className={errors['email'] ? styles.errorInput : ''}
          />
          {errors['email'] && <span className={styles.errorText}>{errors['email']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={errors['role'] ? styles.errorInput : ''}
          >
            <option value="">Select Role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="MANAGER">MANAGER</option>
          </select>
          {errors['role'] && <span className={styles.errorText}>{errors['role']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Status:</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add User'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/admin/dashboard/users')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;