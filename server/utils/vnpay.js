import crypto from 'crypto';
import querystring from 'qs';

/**
 * VNPay utility functions for payment integration
 */

// Configuration - sẽ được load từ environment variables
const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'DEMO',
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'DEMOSECRET',
    vnp_Url: process.env.VNPAY_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/result',
    vnp_Api: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
};

/**
 * Sort object keys alphabetically
 * @param {Object} obj - Object to sort
 * @returns {Object} - Sorted object
 */
export const sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
};

/**
 * Create VNPay payment URL
 * @param {Object} params - Payment parameters
 * @param {string} params.orderId - Order ID (vnp_TxnRef)
 * @param {number} params.amount - Amount in VND
 * @param {string} params.orderInfo - Order description
 * @param {string} params.ipAddr - Client IP address
 * @param {string} [params.bankCode] - Optional bank code
 * @param {string} [params.locale] - Language (vn/en)
 * @returns {string} - Payment URL
 */
export const createPaymentUrl = ({
    orderId,
    amount,
    orderInfo,
    ipAddr,
    bankCode = '',
    locale = 'vn'
}) => {
    const date = new Date();
    const createDate = formatDate(date);

    // Expire after 15 minutes
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000);
    const expireDateStr = formatDate(expireDate);

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'food',
        vnp_Amount: amount * 100, // VNPay requires amount * 100
        vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDateStr
    };

    // Optional bank code
    if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
    }

    // Sort params and create query string
    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });

    // Create HMAC-SHA512 signature
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params.vnp_SecureHash = signed;

    const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
};

/**
 * Verify VNPay callback checksum
 * @param {Object} vnp_Params - Params from VNPay callback
 * @returns {boolean} - True if valid signature
 */
export const verifyChecksum = (vnp_Params) => {
    const secureHash = vnp_Params.vnp_SecureHash;

    // Remove hash fields
    const params = { ...vnp_Params };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    // Sort and create signature data
    const sortedParams = sortObject(params);
    const signData = querystring.stringify(sortedParams, { encode: false });

    // Create HMAC-SHA512 signature
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
};

/**
 * Parse VNPay response code
 * @param {string} responseCode - VNPay response code
 * @returns {Object} - { success: boolean, message: string }
 */
export const parseResponseCode = (responseCode) => {
    const responseCodes = {
        '00': { success: true, message: 'Giao dịch thành công' },
        '07': { success: false, message: 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)' },
        '09': { success: false, message: 'Giao dịch không thành công: Thẻ/Tài khoản chưa đăng ký Internet Banking' },
        '10': { success: false, message: 'Giao dịch không thành công: Khách hàng xác thực sai quá 3 lần' },
        '11': { success: false, message: 'Giao dịch không thành công: Đã hết hạn chờ thanh toán' },
        '12': { success: false, message: 'Giao dịch không thành công: Thẻ/Tài khoản bị khóa' },
        '13': { success: false, message: 'Giao dịch không thành công: Nhập sai OTP' },
        '24': { success: false, message: 'Giao dịch không thành công: Khách hàng hủy giao dịch' },
        '51': { success: false, message: 'Giao dịch không thành công: Tài khoản không đủ số dư' },
        '65': { success: false, message: 'Giao dịch không thành công: Vượt quá hạn mức giao dịch trong ngày' },
        '75': { success: false, message: 'Ngân hàng thanh toán đang bảo trì' },
        '79': { success: false, message: 'Giao dịch không thành công: Nhập sai mật khẩu thanh toán quá số lần quy định' },
        '99': { success: false, message: 'Lỗi không xác định' }
    };

    return responseCodes[responseCode] || { success: false, message: 'Mã lỗi không xác định' };
};

/**
 * Format date for VNPay (yyyyMMddHHmmss)
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');

    return date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
};

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - Client IP
 */
export const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        '127.0.0.1';
};

export default {
    createPaymentUrl,
    verifyChecksum,
    parseResponseCode,
    sortObject,
    getClientIp,
    config: vnpayConfig
};
