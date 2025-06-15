import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../Services/AuthService";
import styles from "../LoginPage/ResetPassword.module.css";

// Password validation rules
const validatePassword = (password) => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  // Track individual criteria
  const [criteria, setCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const isPasswordValid = Object.values(criteria).every((met) => met);

  const handlePasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);

    const validation = validatePassword(newPasswordValue);
    setCriteria(validation);
  };

  const resetPassword = async () => {
    setError("");

    if (!isPasswordValid) {
      setError("Please make sure your password meets all the requirements.");
      return;
    }

    try {
      await authService.resetPassword(email, otp, newPassword);
      alert("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please try again."
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Reset Password</h2>

        <p className={styles.instruction}>
          Enter a new password for{" "}
          <span className={styles.email}>{email}</span>.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <input
          type="password"
          className={styles.passwordInput}
          placeholder="Enter new password"
          value={newPassword}
          onChange={handlePasswordChange}
        />

        {/* Password Criteria */}
        <ul className={styles.criteriaList}>
          <li className={criteria.minLength ? styles.met : styles.notMet}>
            At least 8 characters
          </li>
          <li className={criteria.hasUpperCase ? styles.met : styles.notMet}>
            At least one uppercase letter
          </li>
          <li className={criteria.hasLowerCase ? styles.met : styles.notMet}>
            At least one lowercase letter
          </li>
          <li className={criteria.hasNumber ? styles.met : styles.notMet}>
            At least one number
          </li>
          <li className={criteria.hasSpecialChar ? styles.met : styles.notMet}>
            At least one special character (!@#$%^&*, etc.)
          </li>
        </ul>

        <button
          className={styles.resetButton}
          onClick={resetPassword}
          disabled={!isPasswordValid}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPasswordPage;