"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './result.module.css';

const PaymentResultPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // Get all query params from VNPay
                const params = new URLSearchParams(searchParams.toString());

                // Call backend to verify and get result
                const response = await fetch(`http://localhost:3001/api/order/vnpay/return?${params.toString()}`);
                const data = await response.json();

                setResult(data);
            } catch (error) {
                console.error('Error fetching payment result:', error);
                setResult({
                    success: false,
                    message: 'Không thể xác nhận kết quả thanh toán'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [searchParams]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        // VNPay format: yyyyMMddHHmmss
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(8, 10);
        const minute = dateStr.substring(10, 12);
        const second = dateStr.substring(12, 14);

        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang xác nhận thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {result?.success ? (
                    <>
                        <div className={styles.iconSuccess}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h1 className={styles.titleSuccess}>Thanh toán thành công!</h1>
                        <p className={styles.message}>{result.message}</p>
                    </>
                ) : (
                    <>
                        <div className={styles.iconFailed}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <h1 className={styles.titleFailed}>Thanh toán thất bại</h1>
                        <p className={styles.message}>{result?.message || 'Có lỗi xảy ra'}</p>
                    </>
                )}

                <div className={styles.details}>
                    <h3>Chi tiết giao dịch</h3>
                    <div className={styles.detailRow}>
                        <span>Mã đơn hàng:</span>
                        <strong>{result?.orderId || 'N/A'}</strong>
                    </div>
                    <div className={styles.detailRow}>
                        <span>Số tiền:</span>
                        <strong>{result?.amount ? formatCurrency(result.amount) : 'N/A'}</strong>
                    </div>
                    <div className={styles.detailRow}>
                        <span>Mã giao dịch:</span>
                        <strong>{result?.transactionNo || 'N/A'}</strong>
                    </div>
                    <div className={styles.detailRow}>
                        <span>Ngân hàng:</span>
                        <strong>{result?.bankCode || 'N/A'}</strong>
                    </div>
                    <div className={styles.detailRow}>
                        <span>Thời gian:</span>
                        <strong>{formatDate(result?.payDate)}</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.btnPrimary}
                        onClick={() => router.push('/order')}
                    >
                        Xem đơn hàng
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => router.push('/')}
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
