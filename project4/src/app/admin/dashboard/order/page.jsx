"use client";

import React, { useEffect, useState } from "react";
import styles from "./order.module.css";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import { useLanguageService } from "../../../hooks/useLanguageService";
import { Loader } from "../../../components/componentsindex";
import toast from "react-hot-toast";

const OrderPage = () => {
    // Utility function to extract error message from API response
    const getErrorMessage = (error, defaultMessage) => {
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }
        if (error?.message) {
            return error.message;
        }
        if (error?.code >= 400 || error?.status >= 400) {
            return error.message || `Lỗi ${error.code || error.status}`;
        }
        if (typeof error === 'string') {
            return error;
        }
        return defaultMessage;
    };

    const { orderService } = useLanguageService();
    const [orders, setOrders] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentPage = parseInt(searchParams.get("page") || "0");
    const statusFilter = searchParams.get("status") || "";

    useEffect(() => {
        fetchOrders(currentPage, statusFilter);
    }, [currentPage, statusFilter]);

    // Debounce search
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const updateFilters = (newFilters) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.set("page", "0");
        replace(`${pathname}?${params}`);
    };

    const fetchOrders = async (page, status) => {
        try {
            setLoading(true);
            const response = await orderService.getOrders(page, 10, status);

            // Backend trả về format: { content, totalElements, totalPages, page, size }
            if (response.content && Array.isArray(response.content)) {
                setOrders(response.content);
                const paginationMetadata = {
                    page: response.page,
                    size: response.size,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements,
                    count: response.content.length
                };
                setMetadata(paginationMetadata);
            } else if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                setMetadata(response.metadata || null);
            } else {
                console.warn("Unexpected orders response format", response);
                setOrders([]);
                setMetadata(null);
                toast.error("Dữ liệu trả về không đúng định dạng", {
                    duration: 3000,
                    position: "top-center"
                });
            }

        } catch (err) {
            console.error("Error fetching orders:", err);
            setOrders([]);
            setMetadata(null);
            const errorMessage = getErrorMessage(err, "Không thể tải danh sách đơn hàng. Vui lòng thử lại!");
            toast.error(errorMessage, {
                duration: 4000,
                position: "top-center"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => setSearchTerm(value);

    const handleStatusChange = (e) => {
        const status = e.target.value;
        setSelectedStatus(status);
        updateFilters({ status });
    };

    // Filter orders by search term
    const filteredOrders = orders.filter(order => {
        if (!debouncedSearchTerm) return true;
        const searchLower = debouncedSearchTerm.toLowerCase();
        return (
            (order?.name?.toLowerCase().includes(searchLower)) ||
            (order?.phoneNumber?.toLowerCase().includes(searchLower)) ||
            (order?.description?.toLowerCase().includes(searchLower))
        );
    });

    const handleView = async (orderId) => {
        try {
            const detail = await orderService.getOrderById(orderId);
            setSelectedOrder(detail);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Error fetching order detail:", err);
            const errorMessage = getErrorMessage(err, "Không thể tải chi tiết đơn hàng. Vui lòng thử lại!");
            toast.error(errorMessage, {
                duration: 4000,
                position: "top-center"
            });
        }
    };

    // Format currency to Vietnamese format
    const formatCurrency = (amount) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(numericAmount || 0);
    };

    // Get status class name
    const getStatusClass = (status) => {
        switch (status) {
            case 'DONE':
                return styles.statusCompleted;
            case 'PAID':
                return styles.statusPaid;
            case 'HOLD':
                return styles.statusHold;
            case 'PROCESSING':
                return styles.statusPending;
            case 'CANCELLED':
                return styles.statusCancelled;
            case 'FAILED':
                return styles.statusFailed;
            default:
                return styles.statusDefault;
        }
    };

    // Get status display text
    const getStatusText = (status) => {
        const statusMap = {
            'DONE': 'Hoàn thành',
            'PAID': 'Đã thanh toán',
            'HOLD': 'Tạm giữ',
            'PROCESSING': 'Đang xử lý',
            'CANCELLED': 'Đã hủy',
            'FAILED': 'Thất bại'
        };
        return statusMap[status] || status || 'N/A';
    };

    // Get taking method display text
    const getTakingMethodText = (method) => {
        const methodMap = {
            'DELIVERY': 'Giao hàng',
            'EXPRESS_DELIVERY': 'Giao nhanh',
            'PICKUP': 'Tự lấy',
            'PICKUP_SCHEDULED': 'Lấy theo lịch',
            'DINE_IN': 'Tại chỗ',
            'DINE_IN_RESERVED': 'Đặt bàn',
            'SHIP': 'Giao hàng'
        };
        return methodMap[method] || method || 'N/A';
    };

    if (loading) return <Loader />;

    return (
        <div className={styles.orderPage}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <h1>Orders Management</h1>
                    <div className={styles.topRight}>
                        <Search
                            placeholder="Tìm kiếm theo tên hoặc SĐT..."
                            onChange={handleSearch}
                            onSearch={handleSearch}
                        />
                        <select
                            className={styles.statusFilter}
                            value={selectedStatus}
                            onChange={handleStatusChange}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="HOLD">Tạm giữ</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="PAID">Đã thanh toán</option>
                            <option value="DONE">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                            <option value="FAILED">Thất bại</option>
                        </select>
                    </div>
                </div>

                {/* Hiển thị kết quả tìm kiếm */}
                {debouncedSearchTerm && (
                    <div className={styles.searchInfo}>
                        Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> |
                        Tìm thấy: <strong>{filteredOrders.length}</strong> đơn hàng
                    </div>
                )}

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <td>Order Name</td>
                            <td>Phone</td>
                            <td>Type</td>
                            <td>Status</td>
                            <td>Method</td>
                            <td>Total</td>
                            <td>Items</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.noData}>
                                    Không có đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order._id || order.id}>
                                    <td>
                                        <div className={styles.orderName}>{order.name || 'N/A'}</div>
                                        {order.description && (
                                            <div className={styles.orderDescription}>
                                                {order.description}
                                            </div>
                                        )}
                                    </td>
                                    <td>{order.phoneNumber || "N/A"}</td>
                                    <td>
                                        <span className={styles.orderType}>
                                            {order.orderType || "N/A"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(order.orderState)}`}>
                                            {getStatusText(order.orderState)}
                                        </span>
                                    </td>
                                    <td>{getTakingMethodText(order.takingMethod)}</td>
                                    <td className={styles.price}>
                                        {formatCurrency(order.totalPriceAfterDiscount)}
                                    </td>
                                    <td>
                                        <span className={styles.foodCount}>
                                            {order.foodInfos?.length || 0} món
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.buttons}>
                                            <button
                                                className={`${styles.button} ${styles.view}`}
                                                onClick={() => handleView(order._id || order.id)}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className={styles.darkBg}>
                    <Pagination metadata={metadata || { page: 0, totalPages: 1, count: 0, totalElements: 0 }} />
                </div>
            </div>

            {/* View Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Order Details</h2>
                        <div className={styles.detailContent}>
                            <div className={styles.detailSection}>
                                <h3>Order Information</h3>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <label>Order Name:</label>
                                        <span>{selectedOrder.name}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Description:</label>
                                        <span>{selectedOrder.description || 'N/A'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Phone Number:</label>
                                        <span>{selectedOrder.phoneNumber || 'N/A'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Order Type:</label>
                                        <span>{selectedOrder.orderType || 'N/A'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Status:</label>
                                        <span className={`${styles.status} ${getStatusClass(selectedOrder.orderState)}`}>
                                            {getStatusText(selectedOrder.orderState)}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Taking Method:</label>
                                        <span>{getTakingMethodText(selectedOrder.takingMethod)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <label>Payment Method:</label>
                                        <span>{selectedOrder.paymentMethod || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Price Information</h3>
                                <div className={styles.priceDetails}>
                                    <div className={styles.priceRow}>
                                        <label>Original Price:</label>
                                        <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                                    </div>
                                    <div className={styles.priceRow}>
                                        <label>After Discount:</label>
                                        <span className={styles.finalPrice}>
                                            {formatCurrency(selectedOrder.totalPriceAfterDiscount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.foodInfos && selectedOrder.foodInfos.length > 0 && (
                                <div className={styles.detailSection}>
                                    <h3>Food Items ({selectedOrder.foodInfos.length})</h3>
                                    <div className={styles.foodList}>
                                        {selectedOrder.foodInfos.map((food, index) => (
                                            <div key={`${food.foodId}-${index}`} className={styles.foodItem}>
                                                <span className={styles.foodName}>{food.foodName}</span>
                                                <span className={styles.foodQuantity}>x{food.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderPage;
