"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

//INTERNALIMPORT
import Style from "./LoginAndSignUp.module.css";
import images from "../../img";
import { Button } from "../../components/componentsindex.js";
import Link from "next/link";

// Helper function to handle server errors
const handleServerError = (error) => {
  console.error('Login error:', error);
  
  // Handle different types of server errors
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    return 'Invalid username or password. Please try again.';
  } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
    return 'Your account has been suspended. Please contact support.';
  } else if (error.message?.includes('404')) {
    return 'User not found. Please check your username.';
  } else if (error.message?.includes('429')) {
    return 'Too many login attempts. Please try again later.';
  } else if (error.message?.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  } else if (error.message?.includes('timeout')) {
    return 'Login timeout. Please try again.';
  } else if (error.message) {
    // Return the actual error message from server if it's meaningful
    return error.message;
  } else {
    return 'Login failed. Please try again.';
  }
};

const LoginAndSignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Prevent whitespace in username
    if (name === 'username' && value.includes(' ')) {
      toast.error('Username cannot contain spaces', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('Username is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }

    // Check for whitespace in username
    if (formData.username.includes(' ')) {
      toast.error('Username cannot contain spaces', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    if (!formData.password.trim()) {
      toast.error('Password is required', {
        duration: 3000,
        position: 'top-center'
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long', {
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
      toast.loading('Signing in...', { id: 'login' });
      
      // Use login function from AuthContext
      await login(formData.username, formData.password, formData.rememberMe);
      
      toast.success('Login successful! Welcome back.', {
        id: 'login',
        duration: 2000,
        position: 'top-center'
      });
      
      // No need to handle redirect here as it's handled in AuthContext
    } catch (err) {
      const errorMessage = handleServerError(err);
      toast.error(errorMessage, {
        id: 'login',
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
              <p>
                <Link href="/forgot-password">Forget password</Link>
              </p>
            </div>

            <div className={Style.remember_me}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                id="rememberMe"
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            btnName={loading ? "Signing in..." : "Continue"} 
            classStyle={Style.button}
            type="submit"
            disabled={loading}
          />
        </form>
        <div className={Style.user_box_back}>
          <Link href="/">Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginAndSignUp;