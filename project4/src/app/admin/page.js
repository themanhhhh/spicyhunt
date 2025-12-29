'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader/Loader';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAdmin()) {
        toast.error('Bạn không có quyền truy cập trang Admin!', {
          duration: 4000,
          position: "top-center"
        });
        router.push('/login');
      } else {
        // Simulate loading like other pages
        setTimeout(() => {
          setPageLoading(false);
          toast.success(`Chào mừng ${user?.fullName} đến với Admin Dashboard!`, {
            duration: 3000,
            position: "top-right"
          });
        }, 1000);
      }
    }
  }, [user, loading, router, isAdmin]);

  if (loading || pageLoading) {
    return <Loader/>;
  }

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="mt-4">
            <p className="text-gray-600">Welcome, {user?.fullName}!</p>
          </div>
        </div>
      </div>
    </div>
  );
}