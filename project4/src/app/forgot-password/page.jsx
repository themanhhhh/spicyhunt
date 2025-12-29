"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../api/auth/authService';
import toast from 'react-hot-toast';
import styles from './forgot-password.module.css';


// Helper function to handle server errors
const handleServerError = (error, operation = 'operation') => {
  console.error(`Error during ${operation}:`, error);
  
  if (error.message?.includes('404')) {
    return 'Email address not found. Please check your email.';
  } else if (error.message?.includes('400')) {
    return 'Invalid request. Please check your information.';
  } else if (error.message?.includes('429')) {
    return 'Too many attempts. Please try again later.';
  } else if (error.message?.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  } else if (error.message) {
    return error.message;
  } else {
    return `Failed to ${operation}. Please try again.`;
  }
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const router = useRouter();

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Email is required', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    setLoading(true);
    try {
      toast.loading('Sending reset code to your email...', { id: 'send-otp' });
      
      const response = await authService.forgotPassword(email);
      
      toast.success('Reset code sent successfully! Please check your email.', {
        id: 'send-otp',
        duration: 4000,
        position: 'top-center'
      });
      
      // Move to step 2
      setStep(2);
      
      // Store token if provided in response
      if (response.token) {
        setResetToken(response.token);
      }
      
    } catch (error) {
      const errorMessage = handleServerError(error, 'send reset code');
      toast.error(errorMessage, {
        id: 'send-otp',
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Verification code is required', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (otp.length < 4) {
      toast.error('Please enter a valid verification code', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    setLoading(true);
    try {
      toast.loading('Verifying code...', { id: 'verify-otp' });
      
      const response = await authService.verifyOtp(email, otp);
      
      toast.success('Code verified successfully!', {
        id: 'verify-otp',
        duration: 2000,
        position: 'top-center'
      });
      
      // Store token from verification response
      if (response.token) {
        setResetToken(response.token);
      }
      
      // Move to step 3
      setStep(3);
      
    } catch (error) {
      const errorMessage = handleServerError(error, 'verify code');
      toast.error(errorMessage, {
        id: 'verify-otp',
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast.error('New password is required', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password confirmation does not match', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    setLoading(true);
    try {
      toast.loading('Resetting password...', { id: 'reset-password' });
      
      await authService.resetPassword(email, newPassword, confirmPassword, resetToken);
      
      toast.success('Password reset successfully! You can now login with your new password.', {
        id: 'reset-password',
        duration: 4000,
        position: 'top-center'
      });
      
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      const errorMessage = handleServerError(error, 'reset password');
      toast.error(errorMessage, {
        id: 'reset-password',
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>Reset Password</h2>
        <p>Enter your email address and we'll send you a verification code</p>
      </div>
      
      <form onSubmit={handleSendOTP}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={loading}
          />
        </div>
        
        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>Enter Verification Code</h2>
        <p>We've sent a verification code to <strong>{email}</strong></p>
      </div>
      
      <form onSubmit={handleVerifyOTP}>
        <div className={styles.inputGroup}>
          <label htmlFor="otp">Verification Code</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter verification code"
            required
            disabled={loading}
            maxLength={6}
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.backButton}
            onClick={goBack}
            disabled={loading}
          >
            Back
          </button>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </form>
      
      <div className={styles.resendSection}>
        <p>Didn't receive the code?</p>
        <button
          type="button"
          className={styles.resendButton}
          onClick={() => {
            setStep(1);
            setOtp('');
          }}
          disabled={loading}
        >
          Resend Code
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2>Set New Password</h2>
        <p>Create a strong password for your account</p>
      </div>
      
      <form onSubmit={handleResetPassword}>
        <div className={styles.inputGroup}>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            disabled={loading}
            minLength={6}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            disabled={loading}
            minLength={6}
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.backButton}
            onClick={goBack}
            disabled={loading}
          >
            Back
          </button>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className={styles.forgotPassword}>
      <div className={styles.container}>
        {/* Progress indicator */}
        <div className={styles.progressIndicator}>
          <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
            <span>1</span>
            <label>Email</label>
          </div>
          <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
            <span>2</span>
            <label>Verify</label>
          </div>
          <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>
            <span>3</span>
            <label>Reset</label>
          </div>
        </div>

        {/* Render current step */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Back to login link */}
        <div className={styles.backToLogin}>
          <p>Remember your password? <a href="/login">Back to Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;