'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ManagerPage() {
  const { user, loading, isManager } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isManager()) {
      router.push('/login');
    }
  }, [user, loading, router, isManager]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isManager()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <div className="mt-4">
            <p className="text-gray-600">Welcome, {user?.fullName}!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
