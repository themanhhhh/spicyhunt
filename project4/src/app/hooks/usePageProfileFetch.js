'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export const usePageProfileFetch = (pageName = 'Unknown Page') => {
  const { fetchProfile, user, profile } = useAuth();
  const pathname = usePathname();
  const timeoutRef = useRef(null);
  const lastFetchPageRef = useRef('');
  const lastFetchTimeRef = useRef(0);
  
  // Cấu hình
  const DEBOUNCE_DELAY = 300; // 300ms debounce
  const MIN_FETCH_INTERVAL = 300000; // 5 phút minimum interval giữa các lần fetch
  const FORCE_FETCH_PAGES = []; // Loại bỏ force fetch để tránh gọi liên tục

  useEffect(() => {
    console.log(`🔄 usePageProfileFetch triggered for: ${pageName} (${pathname})`);
    
    // Clear timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Chỉ fetch nếu user đã đăng nhập
    if (!user && !(typeof window !== 'undefined' && document.cookie.includes('token='))) {
      console.log('⚠️ No user/token found, skipping profile fetch');
      return;
    }
    
    // Debounce để tránh gọi quá nhiều lần khi navigation nhanh
    timeoutRef.current = setTimeout(() => {
      const now = Date.now();
      const shouldForceFetch = FORCE_FETCH_PAGES.some(page => pathname.startsWith(page));
      
      // Kiểm tra xem có cần fetch không
      const shouldFetch = 
        !profile || // Chưa có profile
        shouldForceFetch || // Trang yêu cầu force fetch
        lastFetchPageRef.current !== pathname || // Trang mới
        (now - lastFetchTimeRef.current) > MIN_FETCH_INTERVAL; // Đã qua thời gian minimum
      
      if (shouldFetch) {
        console.log(`🚀 Fetching profile for: ${pageName} (${pathname})`);
        console.log(`   - Reason: ${!profile ? 'No profile' : shouldForceFetch ? 'Force fetch page' : lastFetchPageRef.current !== pathname ? 'New page' : 'Time interval passed'}`);
        
        lastFetchPageRef.current = pathname;
        lastFetchTimeRef.current = now;
        
        // Force fetch cho các trang đặc biệt, normal fetch cho các trang khác
        fetchProfile(shouldForceFetch);
      } else {
        console.log(`⏰ Skipping profile fetch for: ${pageName} (${pathname}) - too soon or same page`);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, user, profile, pageName]); // Loại bỏ fetchProfile khỏi deps để tránh infinite loop

  return { profile, user };
}; 