"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from '../../../api/statistic/statisticService';
import styles from './revenue.module.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const RevenuePage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày trước
    endDate: new Date().toISOString().split('T')[0] // Hôm nay
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticService.getRevenue(dateRange.startDate, dateRange.endDate);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải dữ liệu thống kê");
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setStatistics(response);
      setError(null);
      console.log("Statistics loaded:", response);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Lỗi khi tải dữ liệu thống kê');
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading("Đang xuất báo cáo...", { id: "export-report" });
      
      const result = await statisticService.downloadRevenueExport(dateRange.startDate, dateRange.endDate);
      
      // Kiểm tra lỗi từ response
      if (result && (result.code >= 400 || result.error || result.status >= 400)) {
        const errorMessage = getErrorMessage(result, "Không thể xuất báo cáo");
        toast.error(errorMessage, {
          id: "export-report",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      // Thông báo thành công
      toast.success(`Xuất báo cáo thành công: ${result.filename}`, {
        id: "export-report",
        duration: 3000,
        position: "top-center"
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      const errorMessage = getErrorMessage(err, 'Lỗi khi xuất báo cáo');
      toast.error(errorMessage, {
        id: "export-report",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Lỗi tải dữ liệu</h2>
          <p>{error}</p>
          <button onClick={fetchStatistics} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Tính toán dữ liệu cho biểu đồ
  const maxRevenue = Math.max(...(statistics?.statisticDailies?.map(item => item.countRevenue) || [0]));
  
  // Tính max cho tất cả các loại đơn hàng từ dữ liệu hàng ngày
  const dailyMaxOrders = statistics?.statisticDailies ? Math.max(
    ...statistics.statisticDailies.flatMap(item => [
      item.countOrder || 0,
      item.countOrderDineIn || 0,
      item.countOrderShip || 0,
      item.countOrderTakeAway || 0,
      item.countOrderOnline || 0,
      item.countOrderOffline || 0
    ])
  ) : 0;
  
  const maxOrders = Math.max(
    dailyMaxOrders,
    statistics?.statisticTotal?.countOrderDineIn || 0,
    statistics?.statisticTotal?.countOrderShip || 0,
    statistics?.statisticTotal?.countOrderTakeAway || 0,
    statistics?.statisticTotal?.countOrderOnline || 0,
    statistics?.statisticTotal?.countOrderOffline || 0
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Báo cáo Doanh thu</h1>
        <div className={styles.dateFilter}>
          <div className={styles.dateGroup}>
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateGroup}>
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <button 
            onClick={handleExport} 
            disabled={exporting} 
            className={styles.exportButton}
          >
            {exporting ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Đang xuất...
              </>
            ) : (
              <>
                📊 Xuất báo cáo
              </>
            )}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Dashboard Cards */}
        <div className={styles.dashboard}>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <h3>Người dùng tháng này</h3>
            <p className={styles.cardNumber}>{statistics?.statisticTotal?.monthlyActiveUser || 0}</p>
            <span className={styles.cardSubtext}>Hoạt động</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>🛍️</div>
          <div className={styles.cardContent}>
            <h3>Tổng đơn hàng</h3>
            <p className={styles.cardNumber}>{statistics?.statisticTotal?.countOrder || 0}</p>
            <span className={styles.cardSubtext}>Đơn hàng</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <h3>Tổng doanh thu</h3>
            <p className={styles.cardNumber}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(statistics?.statisticTotal?.countRevenue || 0)}
            </p>
            <span className={styles.cardSubtext}>VNĐ</span>
          </div>
        </div>
      </div>

      {/* Line Charts */}
      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h2>Biểu đồ Đường - Theo dõi Chỉ số theo Thời gian</h2>
          <div className={styles.rechartsContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={statistics?.statisticDailies?.map(item => ({
                  date: new Date(item.daily).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                  totalOrders: item.countOrder || 0,
                  dineIn: item.countOrderDineIn || 0,
                  ship: item.countOrderShip || 0,
                  takeAway: item.countOrderTakeAway || 0,
                  online: item.countOrderOnline || 0,
                  offline: item.countOrderOffline || 0
                })) || []}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{background:"#151c2c", border:"none", color: "white"}}/>
                <Legend />
                <Line type="monotone" dataKey="totalOrders" stroke="#ff6b6b" strokeDasharray="5 5" name="Tổng đơn hàng" />
                <Line type="monotone" dataKey="dineIn" stroke="#4ecdc4" strokeDasharray="3 4 5 2" name="Tại chỗ" />
                <Line type="monotone" dataKey="ship" stroke="#45b7d1" strokeDasharray="2 2" name="Giao hàng" />
                <Line type="monotone" dataKey="takeAway" stroke="#f9ca24" strokeDasharray="4 1" name="Mang về" />
                <Line type="monotone" dataKey="online" stroke="#6c5ce7" strokeDasharray="1 3" name="Online" />
                <Line type="monotone" dataKey="offline" stroke="#a29bfe" strokeDasharray="6 2" name="Offline" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Biểu đồ Đường - Doanh thu theo Thời gian</h2>
          <div className={styles.rechartsContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={statistics?.statisticDailies?.map(item => ({
                  date: new Date(item.daily).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                  revenue: item.countRevenue || 0
                })) || []}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(Number(value))}
                />
                <Tooltip 
                  contentStyle={{background:"#151c2c", border:"none", color: "white"}}
                  formatter={(value) => [new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(Number(value)), 'Doanh thu']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#00d2d3" strokeDasharray="5 5" name="Doanh thu (VNĐ)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Order Type Details */}
      <div className={styles.detailsSection}>
        <h2>Chi tiết theo Loại Đơn hàng</h2>
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h4>Tại chỗ (Dine In)</h4>
            <p>{statistics?.statisticTotal?.countOrderDineIn || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Giao hàng (Ship)</h4>
            <p>{statistics?.statisticTotal?.countOrderShip || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Mang về (Take Away)</h4>
            <p>{statistics?.statisticTotal?.countOrderTakeAway || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Online</h4>
            <p>{statistics?.statisticTotal?.countOrderOnline || 0} đơn</p>
          </div>
          <div className={styles.detailCard}>
            <h4>Offline</h4>
            <p>{statistics?.statisticTotal?.countOrderOffline || 0} đơn</p>
          </div>
        </div>
      </div>            
      {/* Revenue Trend Table */}
      <div className={styles.detailsSection}>
        <h2>Chi tiết Doanh thu theo Ngày</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Người dùng hoạt động</th>
                <th>Số đơn hàng</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {statistics?.statisticDailies?.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.daily).toLocaleDateString('vi-VN')}</td>
                  <td>{item.dailyActiveUser}</td>
                  <td>{item.countOrder}</td>
                  <td className={styles.revenue}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.countRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </div>
    </div>
  );
};

export default RevenuePage;