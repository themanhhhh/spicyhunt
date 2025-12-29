"use client";
import React, { useState, useEffect } from "react";

//INTERNAL IMPORT
import Style from "../styles/login.module.css";
import Register from "../login/Register/Register";
import { Loader } from "../components/componentsindex";

const RegisterPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for page initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className={Style.login}>
      <div className={Style.login_box}>
        <h1>Register</h1>
        <Register />
        <p className={Style.login_box_para}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 