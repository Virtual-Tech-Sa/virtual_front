import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../Services/AuthService";
import styles from '../LoginPage/ForgotPasswd.module.css';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    // Validate email
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);

      /**
       * Some APIs may return 200 OK even if no email was found,
       * but with a body like: { success: false, message: "User not found" }
       */
      if (response?.success === false) {
        setError("No account found with this email address.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Verification code sent successfully!");
      localStorage.setItem("resetEmail", email);

      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 1500);

    } catch (err) {
      console.error("Error sending OTP:", err);

      let errorMessage = "Failed to send verification code. Please try again later.";

      if (err.response) {
        switch (err.response.status) {
          case 404:
            errorMessage = "No account found with this email address.";
            break;
          case 429:
            errorMessage = "Too many attempts. Please try again later.";
            break;
          case 400:
            errorMessage = "Invalid request. Please check your input.";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
            break;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please try again later.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendOTP(e);
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordCard}>
        <h2>Forgot Password</h2>
        
        <p className={styles.instructionText}>
          Enter your email address below and we'll send you a verification code to reset your password.
        </p>
        
        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}
        
        <form onSubmit={sendOTP}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              className={styles.input}
              placeholder="example@example.com"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
        
        <div className={styles.additionalLinks}>
          <p>
            Remember your password? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;