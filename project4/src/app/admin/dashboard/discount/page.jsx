"use client";
import React, { useState, useEffect } from "react";
import Style from "./discount.module.css";
import { discountService } from "../../../api/discount/discountService";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../../../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";

const Page = () => {
  const [discounts, setDiscounts] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Form data phù hợp với backend schema
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercent: 0,
    discountAmount: 0,
    minTotalPrice: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });

  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    discountPercent: '',
    discountAmount: '',
    minTotalPrice: '',
    maxDiscount: '',
    startDate: '',
    endDate: ''
  });

  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchDiscounts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        const params = new URLSearchParams(searchParams);
        params.set("page", "0");
        replace(`${pathname}?${params}`);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, pathname, replace, searchParams]);

  const fetchDiscounts = async (page, pageSize) => {
    try {
      setLoading(true);
      const response = await discountService.getDiscounts(page, pageSize);

      console.log("API Response (Discounts):", response);

      // Backend trả về format: { content, totalElements, totalPages, page, size }
      if (response.content && Array.isArray(response.content)) {
        setDiscounts(response.content);

        const paginationMetadata = {
          page: response.page,
          size: response.size,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          count: response.content.length
        };
        console.log("Pagination Metadata (Discounts):", paginationMetadata);
        setMetadata(paginationMetadata);
      } else if (response.data && Array.isArray(response.data)) {
        setDiscounts(response.data);
        if (response.metadata) {
          setMetadata(response.metadata);
        }
      } else {
        console.error("Unexpected API response format:", response);
        setDiscounts([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setDiscounts([]);
      toast.error("Không thể tải danh sách mã giảm giá. Vui lòng thử lại!", {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const filteredDiscounts = discounts.filter(discount => {
    if (!debouncedSearchTerm) return true;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      (discount?.name?.toLowerCase().includes(searchLower)) ||
      (discount?.description?.toLowerCase().includes(searchLower))
    );
  });

  const handleAdd = () => {
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const endDate = new Date(now.setMonth(now.getMonth() + 3)).toISOString().split('T')[0];

    setFormData({
      name: '',
      description: '',
      discountPercent: 0,
      discountAmount: 0,
      minTotalPrice: 0,
      maxDiscount: 0,
      startDate: startDate,
      endDate: endDate,
      status: 'ACTIVE'
    });
    setFormErrors({
      name: '',
      description: '',
      discountPercent: '',
      discountAmount: '',
      minTotalPrice: '',
      maxDiscount: '',
      startDate: '',
      endDate: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (discount) => {
    const startDate = discount.startDate
      ? new Date(discount.startDate).toISOString().split('T')[0]
      : '';
    const endDate = discount.endDate
      ? new Date(discount.endDate).toISOString().split('T')[0]
      : '';

    setSelectedDiscount(discount);
    setFormData({
      name: discount.name || '',
      description: discount.description || '',
      discountPercent: discount.discountPercent || 0,
      discountAmount: discount.discountAmount || 0,
      minTotalPrice: discount.minTotalPrice || 0,
      maxDiscount: discount.maxDiscount || 0,
      startDate: startDate,
      endDate: endDate,
      status: discount.status || 'ACTIVE'
    });
    setFormErrors({
      name: '',
      description: '',
      discountPercent: '',
      discountAmount: '',
      minTotalPrice: '',
      maxDiscount: '',
      startDate: '',
      endDate: ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (discount) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const handleView = async (discount) => {
    try {
      const discountDetail = await discountService.getDiscountById(discount._id || discount.id);
      setSelectedDiscount(discountDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching discount details:", err);
      toast.error("Không thể tải chi tiết mã giảm giá. Vui lòng thử lại!", {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const validateForm = () => {
    const errors = {
      name: '',
      description: '',
      discountPercent: '',
      discountAmount: '',
      minTotalPrice: '',
      maxDiscount: '',
      startDate: '',
      endDate: ''
    };

    if (!formData.name.trim()) {
      errors.name = 'Tên mã giảm giá là bắt buộc';
    }

    if (formData.discountPercent < 0 || formData.discountPercent > 100) {
      errors.discountPercent = 'Phần trăm giảm giá phải từ 0 đến 100';
    }

    if (formData.discountAmount < 0) {
      errors.discountAmount = 'Số tiền giảm giá phải >= 0';
    }

    if (formData.discountPercent === 0 && formData.discountAmount === 0) {
      errors.discountPercent = 'Phải có ít nhất phần trăm hoặc số tiền giảm giá';
    }

    if (formData.minTotalPrice < 0) {
      errors.minTotalPrice = 'Giá trị đơn hàng tối thiểu phải >= 0';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    try {
      toast.loading("Đang tạo mã giảm giá...", { id: "add-discount" });

      const payload = {
        name: formData.name,
        description: formData.description,
        discountPercent: Number(formData.discountPercent),
        discountAmount: Number(formData.discountAmount),
        minTotalPrice: Number(formData.minTotalPrice),
        maxDiscount: Number(formData.maxDiscount),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        status: formData.status
      };

      await discountService.addDiscount(payload);

      toast.success(`Đã tạo mã giảm giá "${formData.name}" thành công!`, {
        id: "add-discount",
        duration: 3000,
        position: "top-center"
      });

      setShowAddModal(false);
      fetchDiscounts(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error adding discount:", err);
      toast.error(err.message || "Không thể tạo mã giảm giá. Vui lòng thử lại!", {
        id: "add-discount",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    try {
      toast.loading("Đang cập nhật mã giảm giá...", { id: "edit-discount" });

      const payload = {
        name: formData.name,
        description: formData.description,
        discountPercent: Number(formData.discountPercent),
        discountAmount: Number(formData.discountAmount),
        minTotalPrice: Number(formData.minTotalPrice),
        maxDiscount: Number(formData.maxDiscount),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        status: formData.status
      };

      await discountService.updateDiscount(selectedDiscount._id || selectedDiscount.id, payload);

      toast.success(`Đã cập nhật mã giảm giá "${formData.name}" thành công!`, {
        id: "edit-discount",
        duration: 3000,
        position: "top-center"
      });

      setShowEditModal(false);
      fetchDiscounts(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating discount:", err);
      toast.error(err.message || "Không thể cập nhật mã giảm giá. Vui lòng thử lại!", {
        id: "edit-discount",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa mã giảm giá...", { id: "delete-discount" });

      await discountService.deleteDiscount(selectedDiscount._id || selectedDiscount.id);

      toast.success(`Đã xóa mã giảm giá "${selectedDiscount.name}" thành công!`, {
        id: "delete-discount",
        duration: 3000,
        position: "top-center"
      });

      setShowDeleteModal(false);
      fetchDiscounts(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting discount:", err);
      toast.error("Không thể xóa mã giảm giá. Vui lòng thử lại!", {
        id: "delete-discount",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getDiscountDisplay = (discount) => {
    if (discount.discountPercent > 0) {
      return `${discount.discountPercent}%`;
    }
    if (discount.discountAmount > 0) {
      return formatCurrency(discount.discountAmount);
    }
    return 'N/A';
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.discountt}>

      <div className={Style.container}>
        <div className={Style.top}>
          <h1>Discounts Management</h1>
          <div className={Style.topRight}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc mô tả mã giảm giá..."
              onChange={handleSearch}
              onSearch={handleSearch}
            />
            <button className={Style.addButton} onClick={handleAdd}>
              Add New Discount
            </button>
          </div>
        </div>

        {/* Hiển thị kết quả tìm kiếm */}
        {debouncedSearchTerm && (
          <div className={Style.searchInfo}>
            Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> |
            Tìm thấy: <strong>{filteredDiscounts.length}</strong> mã giảm giá
          </div>
        )}

        <table className={Style.table}>
          <thead>
            <tr>
              <td>Name</td>
              <td>Description</td>
              <td>Discount</td>
              <td>Min Order</td>
              <td>Max Discount</td>
              <td>Status</td>
              <td>Start Date</td>
              <td>End Date</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map((discount) => (
              <tr key={discount._id || discount.id}>
                <td>{discount.name}</td>
                <td className={Style.description}>{discount.description || 'N/A'}</td>
                <td>{getDiscountDisplay(discount)}</td>
                <td>{formatCurrency(discount.minTotalPrice)}</td>
                <td>{discount.maxDiscount > 0 ? formatCurrency(discount.maxDiscount) : 'N/A'}</td>
                <td>
                  <span className={`${Style.status} ${discount.status === 'ACTIVE' ? Style.available : Style.unavailable}`}>
                    {discount.status}
                  </span>
                </td>
                <td>{formatDate(discount.startDate)}</td>
                <td>{formatDate(discount.endDate)}</td>
                <td>
                  <div className={Style.buttons}>
                    <button
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(discount)}
                    >
                      View
                    </button>
                    <button
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(discount)}
                    >
                      Edit
                    </button>
                    <button
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(discount)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={Style.darkBg}>
          <Pagination metadata={metadata || { page: 0, totalPages: 1, count: filteredDiscounts.length, totalElements: filteredDiscounts.length }} />
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Add New Discount</h2>
              <form onSubmit={handleAddSubmit}>
                <div className={Style.formGroup}>
                  <label>Name: *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={formErrors.name ? Style.errorInput : ''}
                    required
                  />
                  {formErrors.name && <span className={Style.errorMessage}>{formErrors.name}</span>}
                </div>
                <div className={Style.formGroup}>
                  <label>Description:</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className={Style.formRow}>
                  <div className={Style.formGroup}>
                    <label>Discount Percent (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                      className={formErrors.discountPercent ? Style.errorInput : ''}
                    />
                    {formErrors.discountPercent && <span className={Style.errorMessage}>{formErrors.discountPercent}</span>}
                  </div>
                  <div className={Style.formGroup}>
                    <label>Discount Amount (VNĐ):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className={formErrors.discountAmount ? Style.errorInput : ''}
                    />
                    {formErrors.discountAmount && <span className={Style.errorMessage}>{formErrors.discountAmount}</span>}
                  </div>
                </div>
                <div className={Style.formRow}>
                  <div className={Style.formGroup}>
                    <label>Min Order Amount (VNĐ):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minTotalPrice}
                      onChange={(e) => setFormData({ ...formData, minTotalPrice: Number(e.target.value) })}
                      className={formErrors.minTotalPrice ? Style.errorInput : ''}
                    />
                    {formErrors.minTotalPrice && <span className={Style.errorMessage}>{formErrors.minTotalPrice}</span>}
                  </div>
                  <div className={Style.formGroup}>
                    <label>Max Discount (VNĐ):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className={Style.formGroup}>
                  <label>Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className={Style.formRow}>
                  <div className={Style.formGroup}>
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className={Style.formGroup}>
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={formErrors.endDate ? Style.errorInput : ''}
                    />
                    {formErrors.endDate && <span className={Style.errorMessage}>{formErrors.endDate}</span>}
                  </div>
                </div>
                <div className={Style.modalButtons}>
                  <button type="submit" className={Style.saveButton}>Add Discount</button>
                  <button
                    type="button"
                    className={Style.cancelButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Edit Discount</h2>
              <form onSubmit={handleEditSubmit}>
                <div className={Style.formGroup}>
                  <label>Name: *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={formErrors.name ? Style.errorInput : ''}
                    required
                  />
                  {formErrors.name && <span className={Style.errorMessage}>{formErrors.name}</span>}
                </div>
                <div className={Style.formGroup}>
                  <label>Description:</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className={Style.formRow}>
                  <div className={Style.formGroup}>
                    <label>Discount Percent (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                      className={formErrors.discountPercent ? Style.errorInput : ''}
                    />
                    {formErrors.discountPercent && <span className={Style.errorMessage}>{formErrors.discountPercent}</span>}
                  </div>
                  <div className={Style.formGroup}>
                    <label>Discount Amount (VNĐ):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      className={formErrors.discountAmount ? Style.errorInput : ''}
                    />
                    {formErrors.discountAmount && <span className={Style.errorMessage}>{formErrors.discountAmount}</span>}
                  </div>
                </div>
                <div className={Style.formRow}>
                  <div className={Style.formGroup}>
                    <label>Min Order Amount (VNĐ):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minTotalPrice}
                      onChange={(e) => setFormData({ ...formData, minTotalPrice: Number(e.target.value) })}
                      className={formErrors.minTotalPrice ? Style.errorInput : ''}
                    />
                    {formErrors.minTotalPrice && <span className={Style.errorMessage}>{formErrors.minTotalPrice}</span>}
                  </div>
                  <div className={Style.formGroup}>
                    <label>Max Discount (VNĐ):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className={Style.formGroup}>
                  <label>Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className={Style.formRow}>
                  <div className={Style.formGroup}>
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className={Style.formGroup}>
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={formErrors.endDate ? Style.errorInput : ''}
                    />
                    {formErrors.endDate && <span className={Style.errorMessage}>{formErrors.endDate}</span>}
                  </div>
                </div>
                <div className={Style.modalButtons}>
                  <button type="submit" className={Style.saveButton}>Save Changes</button>
                  <button
                    type="button"
                    className={Style.cancelButton}
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Delete Discount</h2>
              <p>Are you sure you want to delete discount <strong>{selectedDiscount?.name}</strong>?</p>
              <div className={Style.modalButtons}>
                <button
                  className={Style.deleteButton}
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
                <button
                  className={Style.cancelButton}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Discount Details</h2>
              <div className={Style.detailContent}>
                <div className={Style.detailItem}>
                  <label>Name:</label>
                  <span>{selectedDiscount?.name}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Description:</label>
                  <span>{selectedDiscount?.description || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Discount Percent:</label>
                  <span>{selectedDiscount?.discountPercent}%</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Discount Amount:</label>
                  <span>{formatCurrency(selectedDiscount?.discountAmount)}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Min Order Amount:</label>
                  <span>{formatCurrency(selectedDiscount?.minTotalPrice)}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Max Discount:</label>
                  <span>{selectedDiscount?.maxDiscount > 0 ? formatCurrency(selectedDiscount?.maxDiscount) : 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Status:</label>
                  <span className={`${Style.status} ${selectedDiscount?.status === 'ACTIVE' ? Style.available : Style.unavailable}`}>
                    {selectedDiscount?.status}
                  </span>
                </div>
                <div className={Style.detailItem}>
                  <label>Start Date:</label>
                  <span>{formatDate(selectedDiscount?.startDate)}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>End Date:</label>
                  <span>{formatDate(selectedDiscount?.endDate)}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Created At:</label>
                  <span>{selectedDiscount?.createdAt ? new Date(selectedDiscount.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Updated At:</label>
                  <span>{selectedDiscount?.updatedAt ? new Date(selectedDiscount.updatedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
              <div className={Style.modalButtons}>
                <button
                  className={Style.cancelButton}
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;