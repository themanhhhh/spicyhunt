"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Style from "./Register.module.css";
import { Button } from "../../components/componentsindex.js";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Helper function to handle server errors
const handleServerError = (error) => {
  console.error('Registration error:', error);
  
  // Handle different types of server errors
  if (error.message?.includes('409') || error.message?.includes('already exists')) {
    return 'Username or email already exists. Please try with different credentials.';
  } else if (error.message?.includes('400') || error.message?.includes('invalid')) {
    return 'Invalid data provided. Please check your information.';
  } else if (error.message?.includes('422')) {
    return 'Email format is invalid. Please enter a valid email address.';
  } else if (error.message?.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  } else if (error.message?.includes('timeout')) {
    return 'Registration timeout. Please try again.';
  } else if (error.message) {
    // Return the actual error message from server if it's meaningful
    return error.message;
  } else {
    return 'Registration failed. Please try again.';
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation rules during input
    switch(name) {
      case 'username':
        // Check for spaces and special characters
        if (value.includes(' ')) {
          toast.error('Username cannot contain spaces', {
            duration: 3000,
            position: 'top-center'
          });
          return;
        }
        if (/[^a-zA-Z0-9]/.test(value)) {
          toast.error('Only letters and numbers allowed in username', {
            duration: 3000,
            position: 'top-center'
          });
          return;
        }
        if (value.length > 30) {
          toast.error('Username too long (maximum 30 characters)', {
            duration: 3000,
            position: 'top-center'
          });
          return;
        }
        break;
        
      case 'phoneNumber':
        // Allow only numbers and basic phone number characters
        if (/[^0-9+\-\(\) ]/.test(value)) {
          toast.error('Phone number can only contain numbers and basic symbols', {
            duration: 3000,
            position: 'top-center'
          });
          return;
        }
        break;

      
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Username validation
    if (!formData.username.trim()) {
      toast.error('Username is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (formData.username.length > 30) {
      toast.error('Username too long (maximum 30 characters)', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (/[^a-zA-Z0-9]/.test(formData.username)) {
      toast.error('Username can only contain letters and numbers', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      toast.error('Email is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    // Full Name validation
    if (!formData.fullName.trim()) {
      toast.error('Full name is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (formData.fullName.length > 100) {
      toast.error('Full name is too long (maximum 100 characters)', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      toast.error('Phone number is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    // Password validation
    if (!formData.password) {
      toast.error('Password is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      toast.error('Please confirm your password', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    if (formData.password.length > 30) {
      toast.error('Password too long (maximum 30 characters)', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    if(formData.phoneNumber.length !== 10){
      toast.error('Phone number must be 10 digits', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      toast.loading('Creating your account...', { id: 'register' });
      
      await register(
        formData.fullName,
        formData.username,
        formData.password,
        formData.phoneNumber,
        formData.email
      );
      
      toast.success('Account created successfully! Please login to continue.', {
        id: 'register',
        duration: 4000,
        position: 'top-center'
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => {
      router.push('/login');
      }, 2000);
      
    } catch (err) {
      const errorMessage = handleServerError(err);
      toast.error(errorMessage, {
        id: 'register',
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.user}>
      <div className={Style.user_box}>
        <form onSubmit={handleSubmit}>
          <div className={Style.user_box_input}>
            <div className={Style.user_box_input_box}>
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username" 
                required
                disabled={loading}
              />
            </div>

            <div className={Style.user_box_input_box}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.user_box_input_box}>
              <label htmlFor="fullName">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.user_box_input_box}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.user_box_input_box}>
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className={Style.user_box_input_box}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Enter your password again"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            btnName={loading ? "Creating Account..." : "Register"} 
            classStyle={Style.button}
            type="submit"
            disabled={loading}
          />
        </form>
        
        <div className={Style.user_box_back}>
          <a href="/">Back to home</a>
        </div>
      </div>
    </div>
  );
};

export default Register; 