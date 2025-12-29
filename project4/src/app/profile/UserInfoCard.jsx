import React from 'react';
import styles from './profile.module.css';
import { MdPerson, MdAccessTime, MdUpdate, MdSecurity, MdVerified } from 'react-icons/md';

const UserInfoCard = ({ profile }) => {
  if (!profile) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.userInfoCard}>
      <div className={styles.userInfoHeader}>
        <div className={styles.avatarContainer}>
          {profile.imgUrl && profile.imgUrl !== 'admin' ? (
            <img src={profile.imgUrl} alt="User avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <MdPerson size={40} />
            </div>
          )}
        </div>
        <div className={styles.userInfoBasic}>
          <h2>{profile.fullName || 'User'}</h2>
          <div className={styles.userInfoUsername}>@{profile.username}</div>
          <div className={styles.userInfoBadge}>
            <MdSecurity className={styles.badgeIcon} />
            {profile.role}
          </div>
        </div>
      </div>

      <div className={styles.userInfoDetails}>
        <div className={styles.userInfoDetailItem}>
          <span className={styles.userInfoDetailLabel}>ID:</span>
          <span className={styles.userInfoDetailValue}>{profile.id}</span>
        </div>
        <div className={styles.userInfoDetailItem}>
          <span className={styles.userInfoDetailLabel}>Email:</span>
          <span className={styles.userInfoDetailValue}>{profile.email || 'N/A'}</span>
        </div>
        <div className={styles.userInfoDetailItem}>
          <span className={styles.userInfoDetailLabel}>Phone:</span>
          <span className={styles.userInfoDetailValue}>{profile.phoneNumber || 'N/A'}</span>
        </div>
        <div className={styles.userInfoDetailItem}>
          <span className={styles.userInfoDetailLabel}>
            <MdVerified className={styles.inlineIcon} /> Status:
          </span>
          <span className={`${styles.userInfoDetailValue} ${styles.userStatus}`}>
            {profile.state}
          </span>
        </div>
        <div className={styles.userInfoDetailItem}>
          <span className={styles.userInfoDetailLabel}>
            <MdAccessTime className={styles.inlineIcon} /> Created:
          </span>
          <span className={styles.userInfoDetailValue}>{formatDate(profile.createdAt)}</span>
        </div>
        <div className={styles.userInfoDetailItem}>
          <span className={styles.userInfoDetailLabel}>
            <MdUpdate className={styles.inlineIcon} /> Updated:
          </span>
          <span className={styles.userInfoDetailValue}>{formatDate(profile.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard; 