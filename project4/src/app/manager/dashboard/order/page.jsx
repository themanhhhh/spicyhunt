"use client";

import React, { useEffect, useState } from "react";
import styles from "./order.module.css";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import { useLanguageService } from "../../../hooks/useLanguageService";
import toast from "react-hot-toast";

const OrderPage = () => {
    // Utility function to extract error message from API response
    const getErrorMessage = (error, defaultMessage) => {
        // Check if error has response data with message
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }
        
        // Check if error object has message property directly (API response)
        if (error?.message) {
            return error.message;
        }
        
        // Check if error is response object with code/status
        if (error?.code >= 400 || error?.status >= 400) {
            return error.message || `Lỗi ${error.code || error.status}`;
        }
        
        // Check if error is string
        if (typeof error === 'string') {
            return error;
        }
        
        // Debug log for unhandled error formats
        console.log("Unhandled error format:", error);
        
        // Fallback to default message
        return defaultMessage;
    };

    const { orderService } = useLanguageService();
    const [orders, setOrders] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
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
            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                setMetadata(response.metadata || null);
                
                // Hiển thị thông báo load thành công
                if (page === 0) {
                    console.log("Orders loaded:", response.data.length);
                }
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
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        updateFilters({ status });
    };

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

    // Get taking method display text
    const getTakingMethodText = (method) => {
        const methodMap = {
            'DELIVERY': 'Giao hàng tiêu chuẩn',
            'EXPRESS_DELIVERY': 'Giao hàng nhanh',
            'PICKUP': 'Tự đến lấy',
            'PICKUP_SCHEDULED': 'Tự đến lấy theo lịch hẹn',
            'DINE_IN': 'Dùng tại chỗ',
            'DINE_IN_RESERVED': 'Dùng tại chỗ có đặt bàn',
            'SHIP': 'Giao hàng'
        };
        return methodMap[method] || method || 'N/A';
    };

    if (loading) return <div className={styles.loading}>Đang tải...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>Quản lý đơn hàng</h1>
                <FilterableSearch
                    placeholder="Tìm kiếm theo tên đơn hàng hoặc số điện thoại..."
                    onChange={handleSearch}
                    onSearch={handleSearch}
                    value={searchTerm}
                    statusFilter={selectedStatus}
                    onStatusChange={handleStatusChange}
                    statusOptions={[
                        { value: "", label: "Tất cả trạng thái" },
                        { value: "HOLD", label: "Tạm giữ" },
                        { value: "PROCESSING", label: "Chờ xử lý" },
                        { value: "PAID", label: "Đã thanh toán" },
                        { value: "DONE", label: "Hoàn thành" },
                        { value: "CANCELLED", label: "Đã hủy" },
                        { value: "FAILED", label: "Thất bại" },
                    ]}
                />
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <td>ID</td>
                    <td>Tên đơn hàng</td>
                    <td>Khách hàng</td>
                    <td>Số điện thoại</td>
                    <td>Loại đơn</td>
                    <td>Trạng thái</td>
                    <td>Phương thức lấy hàng</td>
                    <td>Tổng tiền</td>
                    <td>Số món</td>
                    <td>Thao tác</td>
                </tr>
                </thead>
                <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan={10} className={styles.noData}>
                            Hiển thị 0 / 0 bản ghi
                        </td>
                    </tr>
                ) : (
                    orders.map((order) => (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td className={styles.orderName}>
                                {order.name}
                                {order.description && (
                                    <div className={styles.orderDescription}>
                                        {order.description}
                                    </div>
                                )}
                            </td>
                            <td>User ID: {order.userId}</td>
                            <td>{order.phoneNumber || "Chưa có"}</td>
                            <td>
                                <p className={styles.orderType}>
                                    {order.orderType || "N/A"}
                                </p>
                            </td>
                            <td>
                  <p className={`${styles.status} ${getStatusClass(order.orderState)}`}>
                    {order.orderState}
                  </p>
                            </td>
                            <td>{getTakingMethodText(order.takingMethod)}</td>
                            <td className={styles.price}>
                                {formatCurrency(order.totalPriceAfterDiscount)}
                            </td>
                            <td>
                                <p className={styles.foodCount}>
                                    {order.foodInfos?.length || 0} món
                                </p>
                            </td>
                            <td>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => handleView(order.id)}
                                >
                                    Chi tiết
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            <Pagination
                metadata={metadata || { page: 0, totalPages: 1, count: 0, totalElements: 0 }}
            />

            {showDetailModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.orderInfo}>
                                <h3>Thông tin đơn hàng</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <strong>Tên đơn hàng:</strong>
                                        <p>{selectedOrder.name}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Mô tả:</strong>
                                        <p>{selectedOrder.description || "Không có"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Khách hàng:</strong>
                                        <p>User ID: {selectedOrder.userId}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Số điện thoại:</strong>
                                        <p>{selectedOrder.phoneNumber || "Chưa có"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Loại đơn hàng:</strong>
                                        <p>{selectedOrder.orderType || "N/A"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Trạng thái:</strong>
                                        <p className={`${styles.status} ${getStatusClass(selectedOrder.orderState)}`}>
                                            {selectedOrder.orderState}
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Phương thức lấy hàng:</strong>
                                        <p>{getTakingMethodText(selectedOrder.takingMethod)}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Phương thức thanh toán:</strong>
                                        <p>{selectedOrder.paymentMethod || "Chưa chọn"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Địa chỉ ID:</strong>
                                        <p>{selectedOrder.addressId || "Chưa có"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Mã giảm giá:</strong>
                                        <p>{selectedOrder.discountId || "Không có"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.priceInfo}>
                                <h3>Thông tin giá</h3>
                                <div className={styles.priceGrid}>
                                    <div className={styles.priceItem}>
                                        <strong>Tổng tiền gốc:</strong>
                                        <p>{formatCurrency(selectedOrder.totalPrice)}</p>
                                    </div>
                                    <div className={styles.priceItem}>
                                        <strong>Tổng tiền sau giảm giá:</strong>
                                        <p className={styles.finalPrice}>
                                            {formatCurrency(selectedOrder.totalPriceAfterDiscount)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.foodInfos && selectedOrder.foodInfos.length > 0 && (
                                <div className={styles.foodInfo}>
                                    <h3>Danh sách món ăn ({selectedOrder.foodInfos.length} món)</h3>
                                    <div className={styles.foodList}>
                                        {selectedOrder.foodInfos.map((food, index) => (
                                            <div key={`${food.foodId}-${index}`} className={styles.foodItem}>
                                                <div className={styles.foodDetails}>
                                                    <p className={styles.foodName}>{food.foodName}</p>
                                                    <p className={styles.foodId}>ID: {food.foodId}</p>
                                                </div>
                                                <div className={styles.foodQuantity}>
                                                    <p>Số lượng: {food.quantity}</p>
                                                </div>
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
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderPage;
