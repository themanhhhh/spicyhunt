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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: 0,
    valueType: 'PERCENT',
    discountType: 'FIRST_ORDER',
    status: 'AVAILABLE',
    startAt: '',
    expireAt: '',
    discountRequirement: {
      name: '',
      compareType: null,
      valueRequirement: null
    }
  });
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
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
        // Khi tìm kiếm, quay về trang đầu tiên
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
      
      console.log("API Response (Discounts):", response); // Debug thông tin API trả về
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        setDiscounts(response.data);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.metadata) {
          console.log("Pagination Metadata (Discounts):", response.metadata); // Debug metadata
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Discounts API response");
        }
        
        // Hiển thị thông báo load thành công
        if (page === 0) {
          console.log("Discounts loaded:", response.data.length);
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
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Mặc định hạn 3 tháng

    setFormData({
      name: '',
      description: '',
      value: 0,
      valueType: 'PERCENT',
      discountType: 'FIRST_ORDER',
      status: 'AVAILABLE',
      startAt: startDate.toISOString().split('T')[0],
      expireAt: endDate.toISOString().split('T')[0],
      discountRequirement: {
        name: '',
        compareType: null,
        valueRequirement: null
      }
    });
    setShowAddModal(true);
  };

  const handleEdit = (discount) => {
    
    const startDate = new Date(discount.startAt).toISOString().split('T')[0];
    const expireDate = new Date(discount.expireAt).toISOString().split('T')[0];
    
    setSelectedDiscount(discount);
    setFormData({
      name: discount.name || '',
      description: discount.description || '',
      value: discount.value || 0,
      valueType: discount.valueType || 'PERCENT',
      discountType: discount.discountType || 'FIRST_ORDER',
      status: discount.status || 'AVAILABLE',
      startAt: startDate,
      expireAt: expireDate,
      discountRequirement: {
        name: discount.discountRequirement?.name || '',
        compareType: discount.discountRequirement?.compareType || null,
        valueRequirement: discount.discountRequirement?.valueRequirement || null
      }
    });
    setShowEditModal(true);
  };

  const handleDelete = (discount) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const handleView = async (discount) => {
    try {
      const discountDetail = await discountService.getDiscountById(discount.id);
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

  const handleRequirementChange = (e) => {
    if (e.target.value === 'TOTAL_BILL') {
      setFormData({
        ...formData,
        discountType: e.target.value,
        discountRequirement: {
          ...formData.discountRequirement,
          name: `Mã giảm giá cho khách hàng có tổng hóa đơn trên 200.000đ`,
          compareType: 'RATHER_THAN',
          valueRequirement: 200
        }
      });
    } else { // FIRST_ORDER
      setFormData({
        ...formData,
        discountType: e.target.value,
        discountRequirement: {
          ...formData.discountRequirement,
          name: `Mã giảm giá cho khách hàng đầu tiên`,
          compareType: null,
          valueRequirement: null
        }
      });
    }
  };

  const handleValueRequirementChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData({
      ...formData,
      discountRequirement: {
        ...formData.discountRequirement,
        valueRequirement: value,
        name: `Mã giảm giá cho khách hàng có tổng hóa đơn trên ${value}.000đ`
      }
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Tên mã giảm giá không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Mô tả không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (formData.value <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (new Date(formData.startAt) >= new Date(formData.expireAt)) {
      toast.error("Ngày hết hạn phải sau ngày bắt đầu!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang tạo mã giảm giá...", { id: "add-discount" });
      
      // Convert dates to timestamps
      const payload = {
        ...formData,
        startAt: new Date(formData.startAt).getTime(),
        expireAt: new Date(formData.expireAt).getTime()
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
      toast.error("Không thể tạo mã giảm giá. Vui lòng thử lại!", {
        id: "add-discount",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Tên mã giảm giá không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Mô tả không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (formData.value <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (new Date(formData.startAt) >= new Date(formData.expireAt)) {
      toast.error("Ngày hết hạn phải sau ngày bắt đầu!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật mã giảm giá...", { id: "edit-discount" });
      
      // Convert dates to timestamps
      const payload = {
        ...formData,
        startAt: new Date(formData.startAt).getTime(),
        expireAt: new Date(formData.expireAt).getTime()
      };
      
      await discountService.updateDiscount(selectedDiscount.id, payload);
      
      toast.success(`Đã cập nhật mã giảm giá "${formData.name}" thành công!`, {
        id: "edit-discount",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchDiscounts(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating discount:", err);
      toast.error("Không thể cập nhật mã giảm giá. Vui lòng thử lại!", {
        id: "edit-discount",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa mã giảm giá...", { id: "delete-discount" });
      
      await discountService.deleteDiscount(selectedDiscount.id);
      
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
            <td>Value</td>
            <td>Type</td>
            <td>Status</td>
            <td>Start Date</td>
            <td>Expire Date</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredDiscounts.map((discount) => (
            <tr key={discount.id}>
              <td>{discount.name}</td>
              <td>{discount.value}{discount.valueType === 'PERCENT' ? '%' : ' VND'}</td>
              <td>{discount.discountType}</td>
              <td>
                <span className={`${Style.status} ${discount.status === 'AVAILABLE' ? Style.available : Style.unavailable}`}>
                  {discount.status}
                </span>
              </td>
              <td>{formatDate(discount.startAt)}</td>
              <td>{formatDate(discount.expireAt)}</td>
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
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Discount Value:</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Value Type:</label>
                <select
                  value={formData.valueType}
                  onChange={(e) => setFormData({...formData, valueType: e.target.value})}
                  required
                >
                  <option value="PERCENT">Percent (%)</option>
                  <option value="AMOUNT">Fixed Amount (VND)</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Discount Type:</label>
                <select
                  value={formData.discountType}
                  onChange={handleRequirementChange}
                  required
                >
                  <option value="FIRST_ORDER">First Order</option>
                  <option value="TOTAL_BILL">Total Bill Requirement</option>
                </select>
              </div>
              
              {formData.discountType === 'TOTAL_BILL' && (
                <div className={Style.formGroup}>
                  <label>Minimum Bill Amount (thousands VND):</label>
                  <input
                    type="number"
                    value={formData.discountRequirement.valueRequirement}
                    onChange={handleValueRequirementChange}
                    required
                  />
                </div>
              )}
              
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData({...formData, startAt: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Expire Date:</label>
                <input
                  type="date"
                  value={formData.expireAt}
                  onChange={(e) => setFormData({...formData, expireAt: e.target.value})}
                  required
                />
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
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Description:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Discount Value:</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Value Type:</label>
                <select
                  value={formData.valueType}
                  onChange={(e) => setFormData({...formData, valueType: e.target.value})}
                  required
                >
                  <option value="PERCENT">Percent (%)</option>
                  <option value="AMOUNT">Fixed Amount (VND)</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Discount Type:</label>
                <select
                  value={formData.discountType}
                  onChange={handleRequirementChange}
                  required
                >
                  <option value="FIRST_ORDER">First Order</option>
                  <option value="TOTAL_BILL">Total Bill Requirement</option>
                </select>
              </div>
              
              {formData.discountType === 'TOTAL_BILL' && (
                <div className={Style.formGroup}>
                  <label>Minimum Bill Amount (thousands VND):</label>
                  <input
                    type="number"
                    value={formData.discountRequirement.valueRequirement}
                    onChange={handleValueRequirementChange}
                    required
                  />
                </div>
              )}
              
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData({...formData, startAt: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Expire Date:</label>
                <input
                  type="date"
                  value={formData.expireAt}
                  onChange={(e) => setFormData({...formData, expireAt: e.target.value})}
                  required
                />
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
            <p>Are you sure you want to delete discount "{selectedDiscount?.name}"?</p>
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
                <span>{selectedDiscount?.description}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Value:</label>
                <span>{selectedDiscount?.value}{selectedDiscount?.valueType === 'PERCENT' ? '%' : ' VND'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Value Type:</label>
                <span>{selectedDiscount?.valueType}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Type:</label>
                <span>{selectedDiscount?.discountType}</span>
              </div>
              {selectedDiscount?.discountType === 'TOTAL_BILL' && (
                <div className={Style.detailItem}>
                  <label>Requirement:</label>
                  <span>Bill total &gt; {selectedDiscount?.discountRequirement?.valueRequirement},000 VND</span>
                </div>
              )}
              <div className={Style.detailItem}>
                <label>Status:</label>
                <span className={`${Style.status} ${selectedDiscount?.status === 'AVAILABLE' ? Style.available : Style.unavailable}`}>
                  {selectedDiscount?.status}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Start Date:</label>
                <span>{formatDate(selectedDiscount?.startAt)}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Expire Date:</label>
                <span>{formatDate(selectedDiscount?.expireAt)}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Created At:</label>
                <span>{formatDate(selectedDiscount?.createdAt)}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Updated At:</label>
                <span>{formatDate(selectedDiscount?.updatedAt)}</span>
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