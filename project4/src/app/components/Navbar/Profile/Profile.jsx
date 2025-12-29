import React from "react";
import Image from "next/image";
import {FaUserAlt,FaRegImage,FaUserEdit} from "react-icons/fa";
import { MdHelpCenter, MdPerson } from "react-icons/md";
import { TbDownloadOff, TbDownload} from "react-icons/tb";
import { TbInvoice } from "react-icons/tb";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import Style from "./Profile.module.css";
import images from "../../../img";
import Link from "next/link";

const Profile = () => {
  const { profile, logout } = useAuth();
  const { clearCart } = useCart();
  const handleLogout = () => {
    clearCart();
    logout();
  };

  // Check if user is ADMIN to hide orders menu
  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div className={Style.profile}>
      <div className={Style.profile_account}>
        {profile?.imgUrl && profile.imgUrl !== 'admin' ? (
          <img 
            src={profile.imgUrl} 
            alt="user profile" 
            width={50} 
            height={50}
            className={Style.profile_account_img}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div 
            className={Style.profile_account_img}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MdPerson size={30} color="#666" />
          </div>
        )}
        <div  className={Style.profile_account_info}>
            <p>{profile?.fullName || 'User'}</p>
        </div>
      </div>
      <div className={Style.profile_menu}>
        <div className={Style.profile_menu_one}>
          <div className={Style.profile_menu_one_item}>
            <FaUserAlt/>
            <p>
              <Link href={{pathname: '/profile'}}>My Profile</Link>
            </p>
          </div>
        </div>


        <div className={Style.profile_menu_two}>
          
          <div className={Style.profile_menu_one_item}>
            <TbDownload/>
            <p onClick={handleLogout}>
                Logout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Profile;