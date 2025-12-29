"use client";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import Style from "./LogoutButton.module.css";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button 
      onClick={handleLogout}
      className={Style.logoutButton}
    >
      Logout
    </button>
  );
};

export default LogoutButton; 