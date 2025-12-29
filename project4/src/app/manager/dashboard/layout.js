"use client";
import React from "react";
import Style from "./dashboard.module.css";
import { Sidebar } from "../ui/dashboard/dashboardindex";

const Layout = ({ children }) => {
  return (
    <div className={Style.container}>
      <div className={Style.menu}>
        <Sidebar />
      </div>
      <div className={Style.content}>{children}</div>
    </div>
  );
};

export default Layout; 