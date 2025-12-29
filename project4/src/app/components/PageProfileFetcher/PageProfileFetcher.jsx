'use client';
import { usePageProfileFetch } from '../../hooks/usePageProfileFetch';
import { usePathname } from 'next/navigation';

export const PageProfileFetcher = () => {
  const pathname = usePathname();
  
  // Tự động fetch profile cho trang hiện tại
  usePageProfileFetch(`Page: ${pathname}`);
  
  return null; // Component này không render gì cả
}; 