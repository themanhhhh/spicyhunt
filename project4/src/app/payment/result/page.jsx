"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './result.module.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { FaCheckCircle, FaTimesCircle, FaReceipt, FaHome, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
                const response = await fetch(`https://spicyhunt-yqoi.onrender.com/api/order/vnpay/return?${params.toString()}`);
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
                <Navbar />
                <div className={styles.content}>
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Đang xác nhận thanh toán...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {result?.success ? (
                        <>
                            <div className={styles.iconSuccess}>
                                <FaCheckCircle size={80} />
                            </div>
                            <div className={styles.successBadge}>
                                <FaCheckCircle /> Giao dịch hoàn tất
                            </div>
                            <h1 className={styles.titleSuccess}>Thanh toán thành công!</h1>
                            <p className={styles.message}>{result.message}</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.iconFailed}>
                                <FaTimesCircle size={80} />
                            </div>
                            <div className={styles.failedBadge}>
                                <FaTimesCircle /> Giao dịch thất bại
                            </div>
                            <h1 className={styles.titleFailed}>Thanh toán thất bại</h1>
                            <p className={styles.message}>{result?.message || 'Có lỗi xảy ra trong quá trình thanh toán'}</p>
                        </>
                    )}

                    <motion.div
                        className={styles.details}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h3><FaReceipt /> Chi tiết giao dịch</h3>
                        <div className={styles.detailRow}>
                            <span>Mã đơn hàng</span>
                            <strong>{result?.orderId || 'N/A'}</strong>
                        </div>
                        <div className={`${styles.detailRow} ${styles.amountRow}`}>
                            <span>Số tiền thanh toán</span>
                            <strong>{result?.amount ? formatCurrency(result.amount) : 'N/A'}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Mã giao dịch VNPay</span>
                            <strong>{result?.transactionNo || 'N/A'}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Ngân hàng</span>
                            <strong>{result?.bankCode || 'N/A'}</strong>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Thời gian giao dịch</span>
                            <strong>{formatDate(result?.payDate)}</strong>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.actions}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <button
                            className={styles.btnPrimary}
                            onClick={() => router.push('/profile?tab=orders')}
                        >
                            <FaClipboardList style={{ marginRight: '0.5rem' }} />
                            Xem đơn hàng
                        </button>
                        <button
                            className={styles.btnSecondary}
                            onClick={() => router.push('/')}
                        >
                            <FaHome style={{ marginRight: '0.5rem' }} />
                            Về trang chủ
                        </button>
                    </motion.div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentResultPage;
