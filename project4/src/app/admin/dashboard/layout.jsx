import React from 'react';
import Navbar from '../ui/dashboard/navbar/navbar';
import Sidebar from '../ui/dashboard/sidebar/sidebar';

import Style from "../styles/dashboard.module.css";

const layout = ({children}) => {
  return (
    <div className={Style.container}>
      <div className={Style.menu}>
        <Sidebar />
      </div>
      <div className={Style.content}>
        <Navbar />
        {children }
      </div>
    </div>
  )
}

export default layout