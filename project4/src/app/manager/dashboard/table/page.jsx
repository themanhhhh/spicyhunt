"use client";
import React, { useState, useEffect } from "react";
import Style from "./table.module.css";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import ordertableService from "../../../api/ordertable/ordertableService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const Page = () => {
  const [tables, setTables] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    numberOfChair: 0,
    state: 'AVAILABLE',
  });

  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchTables(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, activeTab]);

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

  const fetchTables = async (page, pageSize) => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'active') {
        response = await ordertableService.getActiveTable(page, pageSize);
      } else {
        response = await ordertableService.getOrderTables(page, pageSize);
      }
      
      console.log("API Response (Tables):", response); // Debug thông tin API trả về
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách bàn");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setTables([]);
        return;
      }
      
      if (response.data && Array.isArray(response.data)) {
        setTables(response.data);
        
        if (response.metadata) {
          console.log("Pagination Metadata (Tables):", response.metadata);
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Tables API response");
        }
        
        // Hiển thị thông báo load thành công
        if (page === 0) {
          console.log("Tables loaded:", response.data.length);
        }
      } else {
        console.error("Unexpected API response format:", response);
        setTables([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách bàn. Vui lòng thử lại!");
      setTables([]);
      toast.error(errorMessage, {
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

  // Lọc dữ liệu phía client (chỉ áp dụng khi có search term)
  const filteredTables = tables.filter(table => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return (
      (table?.name?.toLowerCase().includes(searchLower))
    );
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      state: 'AVAILABLE',
      numberOfChair: 0,
    });
    setShowAddModal(true);
  };

  const handleEdit = (table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name || '',
      numberOfChair: table.numberOfChair || 0,
      state: table.state || 'AVAILABLE',
    });
    setShowEditModal(true);
  };

  const handleDelete = (table) => {
    setSelectedTable(table);
    setShowDeleteModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Tên bàn không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (formData.numberOfChair < 1) {
      toast.error("Số ghế phải lớn hơn 0!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang thêm bàn mới...", { id: "add-table" });
      
      const response = await ordertableService.createOrderTable(formData.name, formData.state, formData.numberOfChair);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể thêm bàn");
        toast.error(errorMessage, {
          id: "add-table",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã thêm bàn "${formData.name}" thành công!`, {
        id: "add-table",
        duration: 3000,
        position: "top-center"
      });
      
      setShowAddModal(false);
      fetchTables(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error adding table:", err);
      const errorMessage = getErrorMessage(err, "Không thể thêm bàn. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "add-table",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Tên bàn không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (formData.numberOfChair < 1) {
      toast.error("Số ghế phải lớn hơn 0!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật bàn...", { id: "edit-table" });
      
      const response = await ordertableService.updateOrderTable(
        selectedTable.id,
        formData.name,
        formData.state,
        formData.numberOfChair
      );
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật bàn");
        toast.error(errorMessage, {
          id: "edit-table",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật bàn "${formData.name}" thành công!`, {
        id: "edit-table",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchTables(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating table:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật bàn. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-table",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa bàn...", { id: "delete-table" });
      
      const response = await ordertableService.deleteOrderTable(selectedTable.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa bàn");
        toast.error(errorMessage, {
          id: "delete-table",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa bàn "${selectedTable.name}" thành công!`, {
        id: "delete-table",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchTables(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting table:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa bàn. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-table",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return Style.available;
      case 'IN_AVAILABLE':
        return Style.occupied;
      case 'RESERVED':
        return Style.reserved;
      default:
        return '';
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.tablee}>
      
      <div className={Style.container}>
      <div className={Style.top}>
        <h1>Table Management</h1>
        <div className={Style.topRight}>
          <Search 
            placeholder="Tìm kiếm theo tên bàn..." 
            onChange={handleSearch}
            onSearch={handleSearch}
          />
          <button className={Style.addButton} onClick={handleAdd}>
            Add New Table
          </button>
        </div>
      </div>


      {/* Hiển thị kết quả tìm kiếm */}
      {debouncedSearchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
          Tìm thấy: <strong>{filteredTables.length}</strong> bàn
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Name</td>
            <td>Capacity</td>
            <td>Status</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredTables.map((table) => (
            <tr key={table.id}>
              <td>{table.name}</td>
              <td>{table.numberOfChair} persons</td>
              <td>
                <span className={`${Style.status} ${getStatusColor(table.state)}`}>
                  {table.state}
                </span>
              </td>
              <td>
                <div className={Style.buttons}>
                  <button 
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(table)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(table)}
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: filteredTables.length, totalElements: filteredTables.length }} />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Add New Table</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={Style.formGroup}>
                <label>Table Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Capacity:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfChair}
                  onChange={(e) => setFormData({...formData, numberOfChair: Number(e.target.value)})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.saveButton}>Add Table</button>
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
            <h2>Edit Table</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Table Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Capacity:</label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfChair}
                  onChange={(e) => setFormData({...formData, numberOfChair: Number(e.target.value)})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_AVAILABLE">In Available</option>
                </select>
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
            <h2>Delete Table</h2>
            <p>Are you sure you want to delete table {selectedTable?.name}?</p>
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
    </div>
    </div>
  );
};

export default Page; 