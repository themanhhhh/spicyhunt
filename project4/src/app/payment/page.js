"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { discountService } from '../api/discount/discountService';
import { 
  createOrder, 
  getOrderId, 
  clearOrderId, 
  getOrderById, 
  createPayment, 
  checkPaymentStatus, 
  updateOrderInfo, 
  removeFoodFromOrder,
  getCartItemsFromCookie,
  clearCartItemsFromCookie 
} from '../api/order/orderService';
import { addressService } from '../api/address/addressService';
import AddressAutocomplete from '../components/AddressAutocomplete/AddressAutocomplete';
import styles from '../styles/payment.module.css';
import { FaLock, FaCreditCard, FaUser, FaEnvelope, FaPhone, FaTag, FaPercent, FaTimes, FaMapMarkerAlt, FaClipboardList, FaHome, FaBriefcase, FaHeart, FaPlus, FaSpinner, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const PaymentPage = () => {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const t = useTranslation();
  const { user, profile: userProfile } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Address form data giống AddressManager
  const [addressFormData, setAddressFormData] = useState({
    label: 'HOME',
    customLabel: '',
    street: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    latitude: null,
    longitude: null,
    formatted_address: '',
    place_id: null,
    isDefault: false
  });

  const [formData, setFormData] = useState({
    // Order information (name sẽ lấy từ orderData, không cần trong form)
    description: '',
    orderType: 'SHIP', // SHIP, TAKE_AWAY, DINE_IN
    orderState: 'PAYMENT', // HOLD, PROCESSING, COMPLETED, CANCELLED
    takingMethod: 'SHIP', // Phương thức nhận hàng riêng biệt
    notes: '', // Thêm trường ghi chú
    
    // Customer information
    fullName: '',
    email: '',
    phone: '',
    
    // Payment information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    
    // Address information (will be populated by AddressAutocomplete)
    address: '',
    city: '',
    zipCode: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    fetchSavedAddresses();
    
    // Debug: Log formData to check if description and takingMethod are initialized
    console.log('Initial formData:', formData);
    
    // Log current orderId if exists
    const currentOrderId = getOrderId();
    if (currentOrderId) {
      console.log('Current order ID from cookie:', currentOrderId);
      fetchOrderData(currentOrderId);
    } else {
      console.warn('No order ID found in cookies');
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchDiscounts();
    }
  }, [cartItems]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressService.getUserAddresses();
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách địa chỉ");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setSavedAddresses([]);
        setShowAddressForm(true);
        return;
      }
      
      let addresses = [];
      if (response && Array.isArray(response)) {
        addresses = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        addresses = response.data;
      }
      setSavedAddresses(addresses);
      
      // If no saved addresses and no address form shown, show the form
      if (addresses.length === 0) {
        setShowAddressForm(true);
      } else {
        console.log("Addresses loaded:", addresses.length);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      const errorMessage = getErrorMessage(error, 'Không thể tải danh sách địa chỉ');
      setSavedAddresses([]);
      setShowAddressForm(true);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const total = getOrderTotal();
      const response = await discountService.getDiscountByPrice(total);
      console.log('Order total for discount calculation:', total);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách mã giảm giá");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setDiscounts([]);
        return;
      }
      
      if (response.data && Array.isArray(response.data)) {
        setDiscounts(response.data);
        console.log("Discounts loaded:", response.data.length);
      } else {
        setDiscounts([]);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      const errorMessage = getErrorMessage(error, 'Không thể tải danh sách mã giảm giá');
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async (orderId) => {
    try {
      setLoadingOrder(true);
      console.log('Fetching order data for ID:', orderId);
      const response = await getOrderById(orderId);
      console.log('Order data response:', response);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải thông tin đơn hàng");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        console.warn('Will fallback to cart data for total calculation');
        setOrderData(null);
        return;
      }
      
      console.log('Order total price:', response?.totalPrice);
      console.log('Order food infos:', response?.foodInfos);
      setOrderData(response);
      
      if (response) {
        console.log("Order data loaded:", response);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      const errorMessage = getErrorMessage(error, 'Không thể tải thông tin đơn hàng');
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
      console.warn('Will fallback to cart data for total calculation');
      // Nếu không lấy được order data, fallback về cart data
      setOrderData(null);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Form input changed:', name, '=', value); // Debug log
    
    // Validate phone number
    if (name === 'phone') {
      // Chỉ cho phép nhập số
      const numbersOnly = value.replace(/[^\d]/g, '');
      // Giới hạn 10 số
      const truncated = numbersOnly.slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: truncated
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Đồng bộ takingMethod với orderType khi orderType thay đổi
      ...(name === 'orderType' && { takingMethod: value })
    }));
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSelect = (addressData) => {
    setSelectedAddress(addressData);
    setFormData(prev => ({
      ...prev,
      address: addressData.formatted_address,
      city: addressData.address_components.locality || '',
      zipCode: addressData.address_components.postal_code || '',
      latitude: addressData.latitude,
      longitude: addressData.longitude
    }));
    
    // Cập nhật addressFormData giống AddressManager
    setAddressFormData(prev => ({
      ...prev,
      street: `${addressData.address_components.street_number || ''} ${addressData.address_components.route || ''}`.trim(),
      city: addressData.address_components.locality || '',
      state: addressData.address_components.administrative_area_level_1 || '',
      zipCode: addressData.address_components.postal_code || '',
      country: addressData.address_components.country || '',
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      formatted_address: addressData.formatted_address,
      place_id: addressData.place_id
    }));
  };

  const handleSavedAddressSelect = (address) => {
    setSelectedSavedAddress(address);
    // Parse the address details from the addressDetail string
    const addressParts = address.addressDetail.split(' | ');
    let parsedAddress = {
      label: 'HOME',
      street: '',
      city: '',
      zipCode: '',
      country: '',
      formatted_address: '',
      latitude: null,
      longitude: null
    };

    addressParts.forEach(part => {
      if (part.startsWith('Full: ')) {
        parsedAddress.formatted_address = part.replace('Full: ', '');
      } else if (part.startsWith('Coords: ')) {
        const coords = part.replace('Coords: ', '').split(',');
        parsedAddress.latitude = parseFloat(coords[0]);
        parsedAddress.longitude = parseFloat(coords[1]);
      } else if (['HOME', 'WORK'].includes(part)) {
        parsedAddress.label = part;
      } else if (part.startsWith('Apt: ')) {
        // Skip apartment info
      } else if (part.startsWith('PlaceID: ')) {
        // Skip place ID
      } else {
        // Try to identify parts
        if (part.match(/^\d{5}$/)) {
          parsedAddress.zipCode = part;
        } else if (parsedAddress.street === '') {
          parsedAddress.street = part;
        } else if (parsedAddress.city === '') {
          parsedAddress.city = part;
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      address: parsedAddress.formatted_address || parsedAddress.street,
      city: parsedAddress.city,
      zipCode: parsedAddress.zipCode,
      latitude: parsedAddress.latitude,
      longitude: parsedAddress.longitude
    }));
    setShowAddressForm(false);
  };

  const saveNewAddress = async (addressData = null) => {
    try {
      setSaving(true);
      
      // Sử dụng addressFormData nếu có, nếu không thì dùng addressData
      const dataToSave = addressData || addressFormData;
      
      // Validation giống AddressManager
      if (!dataToSave.street && !dataToSave.formatted_address) {
        alert('Vui lòng chọn hoặc nhập địa chỉ');
        return;
      }

      // Format địa chỉ giống AddressManager
      const formatAddressDetail = () => {
        if (addressData) {
          // Nếu từ autocomplete (legacy format)
          const addressParts = [
            'HOME',
            addressData.formatted_address || addressData.address || '',
            addressData.latitude && addressData.longitude ? `Coords: ${addressData.latitude},${addressData.longitude}` : '',
            addressData.place_id ? `PlaceID: ${addressData.place_id}` : ''
          ].filter(Boolean);
          return addressParts.join(' | ');
        } else {
          // Nếu từ form data (giống AddressManager)
          const addressParts = [
            addressFormData.street,
            addressFormData.city,
            addressFormData.state,
            addressFormData.zipCode,
            addressFormData.country
          ].filter(Boolean);
          return addressParts.join(', ');
        }
      };

      // Lấy IP address của client
      const getClientIP = async () => {
        try {
          // Thử nhiều service để lấy IP
          const ipServices = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://httpbin.org/ip'
          ];
          
          for (const service of ipServices) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              
              const response = await fetch(service, { 
                signal: controller.signal 
              });
              clearTimeout(timeoutId);
              
              const data = await response.json();
              
              // Xử lý format khác nhau của các service
              const ip = data.ip || data.origin || data.query;
              if (ip) {
                console.log('Client IP obtained:', ip);
                return ip;
              }
            } catch (serviceError) {
              console.warn(`Failed to get IP from ${service}:`, serviceError);
              continue;
            }
          }
          
          // Fallback IP nếu tất cả service đều fail
          console.warn('All IP services failed, using fallback IP');
          return '127.0.0.1';
        } catch (error) {
          console.error('Error getting IP:', error);
          return '127.0.0.1';
        }
      };

      const clientIP = await getClientIP();
      
      const newAddress = {
        addressDetail: formatAddressDetail(),
        addressIp: clientIP,
        isDefault: addressFormData.isDefault || savedAddresses.length === 0 // Làm mặc định nếu là địa chỉ đầu tiên
      };

      console.log('Creating address with data:', newAddress);

      const response = await addressService.createAddress(newAddress);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tạo địa chỉ mới");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        throw new Error(errorMessage);
      }
      
      if (response) {
        console.log('Address created successfully:', response);
        toast.success('Đã tạo địa chỉ mới thành công!', {
          duration: 3000,
          position: "top-center"
        });
        // Refresh address list
        await fetchSavedAddresses();
        return response;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      const errorMessage = getErrorMessage(error, 'Không thể lưu địa chỉ');
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      label: 'HOME',
      customLabel: '',
      street: '',
      apt: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      latitude: null,
      longitude: null,
      formatted_address: '',
      place_id: null,
      isDefault: false
    });
    setSelectedAddress(null);
    setShowAddressForm(false);
  };

  const handleDiscountSelect = (discount) => {
    // Check if discount is applicable
    if (discount.applyState === 'INAPPLICABLE') {
      alert(`Discount not applicable. Minimum order value of ${discount.discountRequirement.valueRequirement.toLocaleString()} VNĐ required.`);
      return;
    }
    
    setSelectedDiscount(discount);
    setDiscountCode(discount.name);
    setShowDiscountModal(false);
  };

  const removeDiscount = () => {
    setSelectedDiscount(null);
    setDiscountCode('');
  };

  const calculateDiscount = () => {
    if (!selectedDiscount || selectedDiscount.applyState === 'INAPPLICABLE') return 0;
    
    const subtotal = getOrderTotal();
    
    // Sử dụng totalPriceAfterDiscount để tính discount
    const discountAmount = subtotal - selectedDiscount.totalPriceAfterDiscount;
    return Math.max(0, discountAmount);
  };

  const getOrderTotal = () => {
    // Debug logs
    console.log('getOrderTotal called');
    console.log('orderData:', orderData);
    console.log('orderData.totalPrice:', orderData?.totalPrice);
    console.log('cartTotal:', getCartTotal());
    
    // Nếu có orderData, sử dụng totalPrice từ orderData
    if (orderData && orderData.totalPrice) {
      console.log('Using order total:', orderData.totalPrice);
      return orderData.totalPrice;
    }
    // Fallback về cartTotal nếu không có orderData
    console.log('Using cart total:', getCartTotal());
    return getCartTotal();
  };

  const getFinalTotal = () => {
    return getOrderTotal() - calculateDiscount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate phone number
      if (formData.phone.length !== 10) {
        toast.error('Số điện thoại phải có đúng 10 số!', {
          duration: 3000,
          position: "top-center"
        });
        return;
      }

      // Lấy orderId từ cookie
      const currentOrderId = getOrderId();
      if (!currentOrderId) {
        alert('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại!');
        router.push('/cart');
        return;
      }

      console.log('Updating order info before payment for order ID:', currentOrderId);
      console.log('Current formData:', formData);
      console.log('Current orderData:', orderData);
      console.log('Selected discount:', selectedDiscount);
      console.log('Default address:', defaultAddress);
      console.log('Final total:', getFinalTotal());
      
      // Cập nhật thông tin đơn hàng trước khi thanh toán
      const orderUpdateData = {
        description: formData.description || `Đơn hàng #${currentOrderId} - ${new Date().toLocaleDateString('vi-VN')}`,
        totalPrice: getFinalTotal(), // Tổng tiền sau khi áp dụng discount
        paymentMethod: "VNPAY",
        discountId: selectedDiscount?.id || null,
        addressId: defaultAddress?.id || null, // ID của địa chỉ mặc định
        orderType: "ONLINE", // Fixed value theo API
        orderState: "HOLD", // Fixed value theo API
        phoneNumber: formData.phone,
        takingMethod: formData.takingMethod || (formData.orderType === 'SHIP' ? 'SHIP' : formData.orderType === 'TAKE_AWAY' ? 'TAKE_AWAY' : 'DINE_IN')
      };

      // Validation trước khi gửi
      if (!orderUpdateData.phoneNumber) {
        alert('Vui lòng nhập số điện thoại!');
        return;
      }

      // Xử lý địa chỉ cho SHIP
      let finalAddressId = orderUpdateData.addressId;
      
      if (formData.orderType === 'SHIP') {
        if (!orderUpdateData.addressId && selectedAddress) {
          // Nếu chưa có addressId nhưng đã chọn địa chỉ từ autocomplete, tạo địa chỉ mới
          console.log('Creating new address from selected address...');
          try {
            const createdAddress = await saveNewAddress(selectedAddress);
            if (createdAddress && createdAddress.id) {
              finalAddressId = createdAddress.id;
              console.log('New address created with ID:', finalAddressId);
              toast.success('Đã tạo địa chỉ giao hàng mới!');
            }
          } catch (addressError) {
            console.error('Error creating new address:', addressError);
            toast.error('Không thể tạo địa chỉ mới. Vui lòng thử lại!');
            return;
          }
        } else if (!orderUpdateData.addressId && !selectedAddress) {
          // Nếu không có địa chỉ nào được chọn hoặc tạo
          alert('Vui lòng chọn hoặc nhập địa chỉ giao hàng!');
          return;
        }
        
        // Cập nhật addressId trong orderUpdateData
        if (finalAddressId) {
          orderUpdateData.addressId = finalAddressId;
        }
      }

      console.log('Order update data to be sent:', orderUpdateData);

      // Cập nhật thông tin đơn hàng
      try {
        toast.loading("Đang cập nhật thông tin đơn hàng...", { id: "update-order" });
        
        const updateResponse = await updateOrderInfo(currentOrderId, orderUpdateData);
        
        // Kiểm tra lỗi từ updateResponse
        if (updateResponse && (updateResponse.code >= 400 || updateResponse.error || updateResponse.status >= 400)) {
          const errorMessage = getErrorMessage(updateResponse, "Không thể cập nhật thông tin đơn hàng");
          toast.error(errorMessage + ', nhưng sẽ tiếp tục thanh toán', {
            id: "update-order",
            duration: 4000,
            position: "top-center"
          });
          console.log('Continuing with payment despite order update failure...');
        } else {
          console.log('Order info updated successfully:', updateResponse);
          toast.success('Cập nhật thông tin đơn hàng thành công!', {
            id: "update-order",
            duration: 2000,
            position: "top-right"
          });
        }
      } catch (updateError) {
        console.error('Error updating order info:', updateError);
        const errorMessage = getErrorMessage(updateError, 'Không thể cập nhật thông tin đơn hàng');
        toast.error(errorMessage + ', nhưng sẽ tiếp tục thanh toán', {
          id: "update-order",
          duration: 4000,
          position: "top-center"
        });
        // Tiếp tục với payment dù update order info thất bại
        console.log('Continuing with payment despite order update failure...');
      }
      
      // Gọi API tạo thanh toán VNPay
      toast.loading("Đang tạo thanh toán VNPay...", { id: "create-payment" });
      
      const paymentResponse = await createPayment(currentOrderId);
      
      console.log('Payment response:', paymentResponse);
      
      // Kiểm tra lỗi từ paymentResponse
      if (paymentResponse && (paymentResponse.code >= 400 || paymentResponse.error || paymentResponse.status >= 400)) {
        const errorMessage = getErrorMessage(paymentResponse, "Không thể tạo thanh toán");
        toast.error(errorMessage, {
          id: "create-payment",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      // Kiểm tra response
      if (paymentResponse.code === '00' && paymentResponse.paymentUrl) {
        toast.success('Tạo thanh toán thành công! Đang chuyển hướng...', {
          id: "create-payment",
          duration: 2000,
          position: "top-center"
        });
        // Chuyển hướng trực tiếp đến VNPay (không mở cửa sổ mới)
        window.location.href = paymentResponse.paymentUrl;
        
      } else {
        // Xử lý lỗi
        const errorMessage = paymentResponse.message || 'Có lỗi xảy ra khi tạo thanh toán!';
        toast.error(errorMessage, {
          id: "create-payment",
          duration: 4000,
          position: "top-center"
        });
      }
      
    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMessage = getErrorMessage(error, 'Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!');
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'HOME': return <FaHome />;
      case 'WORK': return <FaBriefcase />;
      default: return <FaHeart />;
    }
  };

  // Lấy địa chỉ mặc định
  const defaultAddress = savedAddresses.find(addr => addr.isDefault);

  // Hàm chọn địa chỉ khác làm mặc định
  const handleSetDefaultAddress = async (addressId) => {
    try {
      toast.loading("Đang cập nhật địa chỉ mặc định...", { id: "update-default-address" });
      
      const response = await addressService.updateAddressDefault(addressId);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật địa chỉ mặc định");
        toast.error(errorMessage, {
          id: "update-default-address",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success('Đã cập nhật địa chỉ mặc định thành công!', {
        id: "update-default-address",
        duration: 3000,
        position: "top-center"
      });
      
      await fetchSavedAddresses();
      setShowAddressListModal(false);
    } catch (error) {
      console.error('Error setting default address:', error);
      const errorMessage = getErrorMessage(error, 'Không thể cập nhật địa chỉ mặc định');
      toast.error(errorMessage, {
        id: "update-default-address",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDiscountModalOpen = async () => {
    setShowDiscountModal(true);
    await fetchDiscounts();
  };

  const handleCancelPayment = async () => {
    try {
      const currentOrderId = getOrderId();
      if (currentOrderId) {
        toast.loading("Đang hủy đơn hàng...", { id: "cancel-order" });
        
        // Lấy cartItems từ cookies
        const cartItemsFromCookie = getCartItemsFromCookie();
        
        if (cartItemsFromCookie && cartItemsFromCookie.length > 0) {
          const foodInfo = {
            foodInfo: cartItemsFromCookie.map(item => ({
              foodId: item.id,
              quantity: item.quantity
            }))
          };
          
          // Gọi API để xóa food khỏi order
          await removeFoodFromOrder(currentOrderId, foodInfo);
          
          // Xóa cookies
          clearOrderId();
          clearCartItemsFromCookie();
          clearCart(); // Xóa cart trong context
          
          toast.success('Đã hủy đơn hàng thành công!', {
            id: "cancel-order",
            duration: 3000,
            position: "top-center"
          });
        }
      }
      
      // Chuyển về trang cart
      router.push('/cart');
    } catch (error) {
      console.error('Error canceling order:', error);
      const errorMessage = getErrorMessage(error, 'Không thể hủy đơn hàng');
      toast.error(errorMessage, {
        id: "cancel-order",
        duration: 4000,
        position: "top-center"
      });
      // Vẫn chuyển về trang cart ngay cả khi có lỗi
      router.push('/cart');
    }
  };

  if (!orderData && cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>{t('payment.emptyCart.title')}</h2>
        <p>{t('payment.emptyCart.message')}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.paymentPage}
      >
        <div className={styles.paymentContainer}>
          <div className={styles.paymentForm}>
            <div className={styles.formHeader}>
              <FaLock className={styles.lockIcon} />
              <h1>{t('payment.title')}</h1>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Địa chỉ lên đầu form */}
              {formData.orderType === 'SHIP' && (
                <div className={styles.formSection}>
                  <h2><FaMapMarkerAlt className={styles.sectionIcon} /> SHIP Address</h2>
                  {/* Hiển thị địa chỉ mặc định */}
                  {loadingAddresses ? (
                    <div className={styles.loadingAddresses}>Loading saved addresses...</div>
                  ) : savedAddresses.length > 0 ? (
                    <div className={styles.savedAddresses}>
                      <h3>Default Address:</h3>
                      <div className={styles.addressCard}>
                        <div className={styles.addressLabel}>
                          {getLabelIcon('HOME')}
                          <span>HOME</span>
                          <span className={styles.defaultBadge}>Default</span>
                        </div>
                        <p className={styles.addressText}>{defaultAddress.addressDetail}</p>
                      </div>
                      <div className={styles.addressActions}>
                        <button
                          type="button"
                          className={styles.addNewAddressBtn}
                          onClick={() => setShowAddressListModal(true)}
                        >
                          Chọn địa chỉ khác
                        </button>
                        <button
                          type="button"
                          className={`${styles.addNewAddressBtn} ${styles.secondary}`}
                          onClick={() => setShowAddressForm(true)}
                        >
                          + Thêm địa chỉ mới
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.noAddressContainer}>
                      <div className={styles.noAddressMessage}>
                        <FaMapMarkerAlt className={styles.noAddressIcon} />
                        <h4>Chưa có địa chỉ giao hàng</h4>
                        <p>Vui lòng thêm địa chỉ để tiếp tục đặt hàng</p>
                      </div>
                      <button
                        type="button"
                        className={styles.addNewAddressBtn}
                        onClick={() => setShowAddressForm(true)}
                      >
                        <FaPlus /> Thêm địa chỉ mới
                      </button>
                    </div>
                  )}
                  {/* Modal chọn địa chỉ khác */}
                  {showAddressListModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddressListModal(false)}>
                      <div className={styles.discountModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                          <h3>Chọn địa chỉ làm mặc định</h3>
                          <button className={styles.closeModal} onClick={() => setShowAddressListModal(false)}><FaTimes /></button>
                        </div>
                        <div className={styles.modalContent}>
                          {savedAddresses.length > 0 ? (
                            <div className={styles.addressList}>
                              {savedAddresses.map(address => (
                                <div
                                  key={address.id}
                                  className={styles.addressCard}
                                  style={{ cursor: 'pointer', border: address.isDefault ? '2px solid #10b981' : '1px solid #eee' }}
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  <div className={styles.addressLabel}>
                                    {getLabelIcon('HOME')}
                                    <span>HOME</span>
                                    {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
                                  </div>
                                  <p className={styles.addressText}>{address.addressDetail}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No addresses found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Chỉ hiển thị form khi showAddressForm = true hoặc không có địa chỉ nào */}
                  {(showAddressForm || savedAddresses.length === 0) && (
                    <div className={styles.addressForm}>
                      <div className={styles.addressFormHeader}>
                        <h3>
                          <FaMapMarkerAlt className={styles.formIcon} />
                          {savedAddresses.length > 0 ? 'Thêm địa chỉ mới' : 'Nhập địa chỉ giao hàng'}
                        </h3>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            className={styles.cancelAddressBtn}
                            onClick={() => {
                              setShowAddressForm(false);
                              resetAddressForm();
                            }}
                          >
                            <FaTimes /> Hủy
                          </button>
                        )}
                      </div>
                      
                      {/* Address Search */}
                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>Tìm kiếm địa chỉ:</label>
                        <AddressAutocomplete
                          placeholder="Nhập địa chỉ giao hàng của bạn..."
                          onAddressSelect={handleAddressSelect}
                          value={addressFormData.formatted_address}
                          onChange={(e) => setAddressFormData(prev => ({ ...prev, formatted_address: e.target.value }))}
                          required={formData.orderType === 'SHIP' && !selectedSavedAddress}
                        />
                      </div>

                      {/* Address Label */}
                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>Nhãn địa chỉ:</label>
                        <div className={styles.labelSelector}>
                          <label className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="label"
                              value="HOME"
                              checked={addressFormData.label === 'HOME'}
                              onChange={handleAddressFormChange}
                            />
                            <span className={styles.radioCustom}>
                              <FaHome /> Nhà
                            </span>
                          </label>
                          <label className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="label"
                              value="WORK"
                              checked={addressFormData.label === 'WORK'}
                              onChange={handleAddressFormChange}
                            />
                            <span className={styles.radioCustom}>
                              <FaBriefcase /> Công ty
                            </span>
                          </label>
                          <label className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="label"
                              value="OTHER"
                              checked={addressFormData.label === 'OTHER'}
                              onChange={handleAddressFormChange}
                            />
                            <span className={styles.radioCustom}>
                              <FaHeart /> Khác
                            </span>
                          </label>
                        </div>
                        {addressFormData.label === 'OTHER' && (
                          <input
                            type="text"
                            name="customLabel"
                            placeholder="Nhập nhãn tùy chỉnh"
                            value={addressFormData.customLabel}
                            onChange={handleAddressFormChange}
                            className={styles.input}
                            required
                          />
                        )}
                      </div>

                     

                      {/* Default Address Checkbox */}
                      <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={addressFormData.isDefault}
                            onChange={handleAddressFormChange}
                          />
                          <span className={styles.checkboxCustom}></span>
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>
                      
                      {/* Selected Address Info */}
                      {selectedAddress && (
                        <div className={styles.selectedAddressInfo}>
                          <h4>✅ Địa chỉ đã chọn từ tìm kiếm:</h4>
                          <p><strong>Địa chỉ:</strong> {selectedAddress.formatted_address}</p>
                          <p><strong>Tọa độ:</strong> {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}</p>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className={styles.formActions}>
                        <button 
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => {
                            setShowAddressForm(false);
                            resetAddressForm();
                          }}
                        >
                          <FaTimes /> Hủy
                        </button>
                        <button 
                          type="button"
                          className={styles.saveButton}
                          onClick={async () => {
                            try {
                              await saveNewAddress();
                              resetAddressForm();
                              toast.success('Đã lưu địa chỉ thành công!');
                            } catch (error) {
                              toast.error('Không thể lưu địa chỉ. Vui lòng thử lại!');
                            }
                          }}
                          disabled={saving || (!selectedAddress && !addressFormData.street)}
                        >
                          {saving ? <FaSpinner className={styles.spinning} /> : <FaSave />}
                          {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </button>
                      </div>
                      
                      {!selectedAddress && !addressFormData.street && (
                        <div className={styles.addressHint}>
                          <p>💡 Gợi ý: Sử dụng tìm kiếm địa chỉ hoặc nhập thủ công các trường bên trên</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Information */}
              <div className={styles.formSection}>
                <h2><FaClipboardList className={styles.sectionIcon} /> Thông tin đơn hàng</h2>
                {loadingOrder ? (
                  <div className={styles.loadingOrder}>Đang tải thông tin đơn hàng...</div>
                ) : (
                  <div className={styles.orderInfoForm} style={{ display: 'block', visibility: 'visible' }}>
                    {/* Hiển thị tên đơn hàng từ orderData hoặc tạo tên mặc định */}
                    <div className={styles.orderInfoItem}>
                      <label className={styles.fieldLabel}>Tên đơn hàng:</label>
                      <span className={styles.orderNameDisplay}>
                        {orderData?.name || `Đơn hàng #${getOrderId() || 'NEW'} - ${new Date().toLocaleDateString('vi-VN')}`}
                      </span>
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.fieldLabel}>Phương thức nhận hàng:</label>
                      <div className={styles.takingMethodOptions}>
                        <div className={styles.radioOption}>
                          <input
                            type="radio"
                            id="SHIP"
                            name="orderType"
                            value="SHIP"
                            checked={formData.orderType === 'SHIP'}
                            onChange={handleInputChange}
                            className={styles.radioInput}
                          />
                          <label htmlFor="SHIP" className={styles.radioLabel}>
                            <div className={styles.radioContent}>
                              <FaHome className={styles.radioIcon} />
                              <div className={styles.radioText}>
                                <span className={styles.radioTitle}>Giao hàng tận nơi</span>
                                <span className={styles.radioDescription}>Chúng tôi sẽ giao hàng đến địa chỉ của bạn</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        <div className={styles.radioOption}>
                          <input
                            type="radio"
                            id="takeaway"
                            name="orderType"
                            value="TAKE_AWAY"
                            checked={formData.orderType === 'TAKE_AWAY'}
                            onChange={handleInputChange}
                            className={styles.radioInput}
                          />
                          <label htmlFor="takeaway" className={styles.radioLabel}>
                            <div className={styles.radioContent}>
                              <FaBriefcase className={styles.radioIcon} />
                              <div className={styles.radioText}>
                                <span className={styles.radioTitle}>Đến lấy tại cửa hàng</span>
                                <span className={styles.radioDescription}>Bạn sẽ đến lấy hàng tại cửa hàng</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        
                        <div className={styles.radioOption}>
                          <input
                            type="radio"
                            id="dinein"
                            name="orderType"
                            value="DINE_IN"
                            checked={formData.orderType === 'DINE_IN'}
                            onChange={handleInputChange}
                            className={styles.radioInput}
                          />
                          <label htmlFor="dinein" className={styles.radioLabel}>
                            <div className={styles.radioContent}>
                              <FaClipboardList className={styles.radioIcon} />
                              <div className={styles.radioText}>
                                <span className={styles.radioTitle}>Dùng tại chỗ</span>
                                <span className={styles.radioDescription}>Thưởng thức tại nhà hàng</span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.fieldLabel}>Ghi chú đặc biệt:</label>
                      <textarea
                        name="notes"
                        placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)..."
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        className={styles.textArea}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className={styles.formSection}>
                <h2><FaUser className={styles.sectionIcon} /> {t('payment.personalInfo')}</h2>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t('payment.fullName')}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaEnvelope className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    placeholder={t('payment.email')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t('payment.phone')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    title="Vui lòng nhập đúng 10 số điện thoại"
                    required
                  />
                  {formData.phone && formData.phone.length !== 10 && (
                    <div className={styles.errorMessage}>
                      Số điện thoại phải có đúng 10 số
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelPaymentButton} 
                  onClick={handleCancelPayment}
                  disabled={submitting}
                >
                  Hủy đơn hàng
                </button>
                <button 
                  type="submit" 
                  className={styles.payButton} 
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>
            <div className={styles.orderItems}>
              {orderData?.foodInfos?.length > 0 ? (
                orderData.foodInfos.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <span>{item.foodName || 'Unknown Food'} x {item.quantity}</span>
                    <span>Số lượng: {item.quantity}</span>
                  </div>
                ))
              ) : cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} VNĐ</span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyOrder}>
                  <p>Không có sản phẩm trong đơn hàng</p>
                </div>
              )}
            </div>

            {/* Discount Section in Order Summary */}
            <div className={styles.discountSection}>
              {selectedDiscount ? (
                <div className={styles.appliedDiscount}>
                  <div className={styles.discountRow}>
                    <div className={styles.discountInfo}>
                      <FaTag className={styles.discountIcon} />
                      <span>{selectedDiscount.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={removeDiscount}
                      className={styles.removeDiscountBtn}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className={styles.discountValue}>
                    {selectedDiscount.valueType === 'PERCENT' 
                      ? `${selectedDiscount.value}% OFF`
                      : `${selectedDiscount.value.toLocaleString()} VNĐ OFF`
                    }
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  className={styles.addDiscountBtn}
                  onClick={handleDiscountModalOpen}
                >
                  <FaTag className={styles.discountIcon} />
                  <span>Add Discount Code</span>
                </button>
              )}
            </div>

            <div className={styles.orderTotal}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{getOrderTotal().toLocaleString()} VNĐ</span>
              </div>
              {selectedDiscount && (
                <div className={styles.totalRow} style={{ color: '#28a745' }}>
                  <span>Discount ({selectedDiscount.name})</span>
                  <span>-{calculateDiscount().toLocaleString()} VNĐ</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.totalRow} style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                <span>Total</span>
                <span>{getFinalTotal().toLocaleString()} VNĐ</span>
              </div>
              
            </div>
          </div>
        </div>

        {/* Discount Modal */}
        {showDiscountModal && (
          <div className={styles.modalOverlay} onClick={() => setShowDiscountModal(false)}>
            <div className={styles.discountModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3><FaTag className={styles.sectionIcon} /> Select Discount Code</h3>
                <button 
                  className={styles.closeModal}
                  onClick={() => setShowDiscountModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className={styles.modalContent}>
                {loading ? (
                  <div className={styles.loadingDiscounts}>Loading discounts...</div>
                ) : discounts.length > 0 ? (
                  <div className={styles.discountList}>
                    {discounts.map((discount) => {
                      const isApplicable = discount.applyState === 'APPLICABLE';
                      
                      return (
                        <div 
                          key={discount.id} 
                          className={`${styles.discountCard} ${!isApplicable ? styles.discountCardDisabled : ''}`}
                          onClick={() => isApplicable && handleDiscountSelect(discount)}
                          style={{ 
                            opacity: isApplicable ? 1 : 0.5,
                            cursor: isApplicable ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <div className={styles.discountHeader}>
                            <FaPercent className={styles.discountIcon} />
                            <span className={styles.discountName}>{discount.name}</span>
                            {!isApplicable && (
                              <span className={styles.ineligibleBadge}>Không áp dụng được</span>
                            )}
                          </div>
                          <div className={styles.discountDetails}>
                            <span className={styles.discountValue}>
                              {discount.valueType === 'PERCENT' 
                                ? `${discount.value}% OFF`
                                : `${discount.value.toLocaleString()} VNĐ OFF`
                              }
                            </span>
                            {discount.discountRequirement && discount.discountType !== 'FIRST_ORDER' && (
                              <span className={`${styles.minOrder} ${!isApplicable ? styles.minOrderNotMet : ''}`}>
                                Đơn tối thiểu: {discount.discountRequirement.valueRequirement.toLocaleString()} VNĐ
                              </span>
                            )}
                          </div>
                          {discount.description && (
                            <p className={styles.discountDescription}>{discount.description}</p>
                          )}
                          {isApplicable && discount.totalPriceAfterDiscount && (
                            <p className={styles.finalPrice}>
                              Thành tiền sau giảm: {discount.totalPriceAfterDiscount.toLocaleString()} VNĐ
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.noDiscounts}>No discount codes available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
      

      
      <Footer />
    </>
  );
};

export default PaymentPage;