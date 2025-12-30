"use client"
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { authService } from '@/app/api/auth/authService';
import { MdPersonOutline, MdLockOutline, MdInfoOutline, MdLocationOn, MdHistory, MdTableRestaurant } from 'react-icons/md';
import ChangePassword from './ChangePassword';
import LogoutButton from '@/app/components/LogoutButton/LogoutButton';
import UpdateProfile from './UpdateProfile';
import UserInfoCard from './UserInfoCard';
import AddressManager from './AddressManager';
import OrderHistory from './OrderHistory';
import TableReservationHistory from './TableReservationHistory';
import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer/Footer';
import { usePageProfileFetch } from '@/app/hooks/usePageProfileFetch';
import { Loader } from '@/app/components/componentsindex';
import toast from 'react-hot-toast';

const menu = [
  { label: 'Thông tin cá nhân', desc: 'Xem thông tin hồ sơ chi tiết của bạn', icon: <MdInfoOutline className={styles.menuIcon} /> },
  { label: 'Tài khoản', desc: 'Quản lý hồ sơ công khai và thông tin cá nhân', icon: <MdPersonOutline className={styles.menuIcon} /> },
  { label: 'Bảo mật', desc: 'Quản lý mật khẩu và xác thực 2 bước', icon: <MdLockOutline className={styles.menuIcon} /> },
  { label: 'Địa chỉ', desc: 'Lưu và quản lý địa chỉ giao hàng', icon: <MdLocationOn className={styles.menuIcon} /> },
  { label: 'Lịch sử đơn hàng', desc: 'Xem tất cả đơn hàng và trạng thái', icon: <MdHistory className={styles.menuIcon} /> },
  { label: 'Lịch sử đặt bàn', desc: 'Xem tất cả đặt bàn và lịch sử đặt chỗ', icon: <MdTableRestaurant className={styles.menuIcon} /> },
];

const Profile = () => {
  // Use hook to fetch profile
  const { profile: contextProfile } = usePageProfileFetch('Profile Page');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Only sync profile from context, no fallback fetch
  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile);
      setLoading(false);
    } else {
      // If no contextProfile yet, wait for hook to fetch
      setLoading(true);
    }
  }, [contextProfile]);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      toast.success('Đã tải lại hồ sơ thành công!', {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error('Error refreshing profile:', err);
      toast.error('Không thể tải thông tin người dùng. Vui lòng thử lại.', {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <Loader />;
  }

  // Handle avatar: if imgUrl is 'admin' then use default icon
  const avatar = profile.imgUrl && profile.imgUrl !== 'admin'
    ? profile.imgUrl
    : null;

  // Format date
  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  const isAdmin = profile.role === 'ADMIN';
  const isManager = profile.role === 'MANAGER';
  const isUser = profile.role === 'CUSTOMER';


  return (
    <div className={styles.settings}>
      <Navbar />
      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.menuTitle}>Cài đặt</div>
          <ul className={styles.menuList}>
            {menu.map((item, idx) => {
              // Show all items except Order History and Table Reservations for admin/manager
              if ((isAdmin || isManager) && (item.label === 'Lịch sử đơn hàng' || item.label === 'Lịch sử đặt bàn')) {
                return null;
              }
              // Show all items for regular users
              return (
                <li
                  key={item.label}
                  className={activeTab === idx ? styles.active : ''}
                  onClick={() => setActiveTab(idx)}
                >
                  {item.icon}
                  <div>
                    <div className={styles.menuLabel}>{item.label}</div>
                    <div className={styles.menuDesc}>{item.desc}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main content */}
        <main className={styles.content}>
          {activeTab === 0 && (
            <UserInfoCard profile={profile} />
          )}
          {activeTab === 1 && (
            <UpdateProfile profile={profile} onProfileUpdated={refreshProfile} />
          )}
          {activeTab === 2 && (
            <ChangePassword />
          )}
          {activeTab === 3 && (
            <AddressManager />
          )}
          {activeTab === 4 && isUser && (
            <OrderHistory />
          )}
          {activeTab === 5 && isUser && (
            <TableReservationHistory />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;