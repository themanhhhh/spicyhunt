'use client';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import styles from './ProfileFetchStatus.module.css';

export const ProfileFetchStatus = ({ showInProduction = false }) => {
  const { profile, user, loading } = useAuth();
  const pathname = usePathname();
  
  // Chỉ hiển thị trong development hoặc khi được yêu cầu
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && !showInProduction) {
    return null;
  }

  return (
    <div className={styles.status}>
      <div className={styles.indicator}>
        <span className={`${styles.dot} ${profile ? styles.success : user ? styles.warning : styles.error}`}></span>
        <span className={styles.text}>
          {loading ? 'Loading...' : profile ? 'Profile Loaded' : user ? 'User Only' : 'No Auth'}
        </span>
      </div>
      <div className={styles.details}>
        Page: {pathname}
      </div>
    </div>
  );
}; 