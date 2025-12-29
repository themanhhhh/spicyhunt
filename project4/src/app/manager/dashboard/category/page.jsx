"use client";
import React, { useState, useEffect } from "react";
import Style from "./category.module.css";
import { useLanguageService } from "../../../hooks/useLanguageService";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import Image from "next/image";
import LogoutButton from "@/app/components/LogoutButton/LogoutButton";
import Link from "next/link";
import LanguageSelector from "@/app/components/LanguageSelector/LanguageSelector";
import toast from "react-hot-toast";

const Page = () => {
  const { categoryService, language } = useLanguageService();
  
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
  const [categories, setCategories] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imgUrl: '',
    state: ''
  });
  const { uploadToPinata, error: uploadError, openError } = useCart();
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");
  
  // Lấy các tham số lọc từ URL
  const nameFilter = searchParams.get("name") || "";
  const statusFilter = searchParams.get("status") || "";

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage, nameFilter, statusFilter);
  }, [currentPage, itemsPerPage, nameFilter, statusFilter]);

  // Effect để gọi lại API khi ngôn ngữ thay đổi
  useEffect(() => {
    fetchCategories(currentPage, itemsPerPage, nameFilter, statusFilter);
    fetchActiveCategories();
  }, [language]); // Thêm language vào dependency

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== nameFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ name: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, nameFilter]);

  // Cập nhật bộ lọc vào URL và quay về trang đầu tiên
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Cập nhật các tham số
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Khi thay đổi bộ lọc, quay về trang đầu tiên
    params.set("page", "0");
    
    // Cập nhật URL
    replace(`${pathname}?${params}`);
  };

  const fetchCategories = async (page, pageSize, name = "", state = "") => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories(name, state, page, pageSize);
      
      console.log("API Response (Categories):", response); // Debug thông tin API trả về
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.metadata) {
          console.log("Pagination Metadata (Categories):", response.metadata); // Debug metadata
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Categories API response");
        }
        
        // Hiển thị thông báo load thành công nếu không phải search
        
      } else {
        console.error("Unexpected API response format:", response);
        setCategories([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách danh mục. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      console.log("Active Categories:", response);
      
      // Check if response is an array or has data property
      if (Array.isArray(response)) {
        setActiveCategories(response);
      } else if (response.data && Array.isArray(response.data)) {
        setActiveCategories(response.data);
      } else {
        console.warn("Unexpected active categories response format");
        setActiveCategories([]);
        toast.error("Không thể tải danh sách danh mục active", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching active categories:", err);
      setActiveCategories([]);
      const errorMessage = getErrorMessage(err, "Lỗi khi tải danh mục active");
      toast.error(errorMessage, {
        duration: 3000,
        position: "top-center"
      });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };


  const handleEdit = async (category) => {
    try {
      // Set loading state
      setLoading(true);
      
      // Fetch the active categories
      await fetchActiveCategories();
      
      // Get the detailed info of the selected category
      const categoryDetail = await categoryService.getCategoryById(category.id);
      
      // Set the selected category
      setSelectedCategory(categoryDetail);
      // Initialize the form data
      setFormData({
        name: categoryDetail.name || '',
        description: categoryDetail.description || '',
        image: null,
        imgUrl: categoryDetail.imgUrl || '',
        state: categoryDetail.state || 'ACTIVE'
      });
      
      // Show the edit modal
      setShowEditModal(true);
      
      toast.success(`Đang chỉnh sửa danh mục: ${categoryDetail.name}`, {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error("Error preparing edit form:", err);
      const errorMessage = getErrorMessage(err, "Không thể mở form chỉnh sửa. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleView = async (category) => {
    try {
      const categoryDetail = await categoryService.getCategoryById(category.id);
      setSelectedCategory(categoryDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching category details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết danh mục. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Tên danh mục không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Mô tả danh mục không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật danh mục...", { id: "edit-category" });
      
      let categoryData = {
        name: formData.name,
        description: formData.description,
        state: formData.state
      };
      
      // Upload new image if selected
      if (formData.image) {
        const imgUrl = await uploadToPinata(formData.image);
        categoryData.imgUrl = imgUrl;
      } else if (formData.imgUrl) {
        categoryData.imgUrl = formData.imgUrl;
      }
      
      const response = await categoryService.updateCategory(selectedCategory.id, categoryData, language);
      
      // Debug log to see what response we get
      console.log("Update category response:", response);
      
      // Check if response indicates an error
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật danh mục. Vui lòng thử lại!");
        toast.error(errorMessage, {
          id: "edit-category",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật danh mục "${formData.name}" thành công!`, {
        id: "edit-category",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchCategories(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating category:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật danh mục. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-category",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa danh mục...", { id: "delete-category" });
      
      const response = await categoryService.deleteCategory(selectedCategory.id);
      
      // Debug log to see what response we get
      console.log("Delete category response:", response);
      
      // Check if response indicates an error (even if it doesn't throw)
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        // Handle API error response
        const errorMessage = getErrorMessage(response, "Không thể xóa danh mục. Vui lòng thử lại!");
        toast.error(errorMessage, {
          id: "delete-category",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa danh mục "${selectedCategory.name}" thành công!`, {
        id: "delete-category",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchCategories(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa danh mục. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-category",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.categoryy}>
      
      <div className={Style.container}>
      <div className={Style.top}>
        <h1>Categories Management</h1>
        <div className={Style.topRight}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên danh mục..." 
            onChange={handleSearch}
            onSearch={handleSearch}
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
          <Link href="/manager/dashboard/category/add" className={Style.addButton}>
            Add New Category
          </Link>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {searchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{searchTerm}</strong> | 
          Tìm thấy: <strong>{categories.length}</strong> danh mục
          {selectedStatus && (
            <span> | Trạng thái: <strong>{selectedStatus}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Image</td>
            <td>Name</td>
            <td>Description</td>
            <td>Status</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                  <div className={Style.imageContainer}>
                    <Image 
                      src={category.imgUrl}
                      alt={category.name}
                      width={50}
                      height={50}
                      className={Style.categoryImage}
                    />
                  </div>
              </td>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <span className={`${Style.status} ${category.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                  {category.state || 'ACTIVE'}
                </span>
              </td>
              <td>
                <div className={Style.buttons}>
                  <button 
                    className={`${Style.button} ${Style.view}`}
                    onClick={() => handleView(category)}
                  >
                    View
                  </button>
                  <button 
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(category)}
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: categories.length, totalElements: categories.length }} />
      </div>

      {/* Add Modal */}
      

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Edit Category</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <LanguageSelector />
              </div>
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
                <label>Current Image:</label>
                {formData.imgUrl && (
                  <div className={Style.currentImage}>
                    <Image 
                      src={formData.imgUrl}
                      alt={formData.name}
                      width={100}
                      height={100}
                      className={Style.categoryImagePreview}
                    />
                  </div>
                )}
              </div>
              <div className={Style.formGroup}>
                <label>Upload New Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <small>Leave empty to keep current image</small>
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select 
                  className={`${Style.statusSelect}`}
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
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
              {openError && <div className={Style.error}>{uploadError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Delete Category</h2>
            <p>Are you sure you want to delete {selectedCategory?.name}?</p>
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
            <h2>Category Details</h2>
            <div className={Style.detailContent}>
              {selectedCategory?.imgUrl && (
                <div className={Style.detailImage}>
                  <Image 
                    src={selectedCategory.imgUrl}
                    alt={selectedCategory.name}
                    width={200}
                    height={200}
                    className={Style.categoryImage}
                  />
                </div>
              )}
              <div className={Style.detailItem}>
                <label>Name:</label>
                <span>{selectedCategory?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Description:</label>
                <span>{selectedCategory?.description}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Status:</label>
                <span className={`${Style.status} ${selectedCategory?.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                  {selectedCategory?.state || 'ACTIVE'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Created At:</label>
                <span>{new Date(selectedCategory?.createdAt).toLocaleString()}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Updated At:</label>
                <span>{new Date(selectedCategory?.updatedAt).toLocaleString()}</span>
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