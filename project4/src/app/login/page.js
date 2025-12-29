"use client";
import React, { useState, useEffect } from "react";

//INTERNAL IMPORT
import Style from "../styles/login.module.css";
import LoginAndSignUp from "./LoginAndSignUp/LoginAndSignUp";
import { Loader } from "../components/componentsindex";

const login = () => {
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
        <h1>Login</h1>
        <LoginAndSignUp />
        <p className={Style.login_box_para}>
          New user? <a href="/register">Create an account</a>
        </p>
      </div>
    </div>
  );
};

export default login;