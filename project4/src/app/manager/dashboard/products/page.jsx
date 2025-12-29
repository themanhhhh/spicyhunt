"use client";
import React, { useState, Suspense, useEffect } from "react";
import Style from "./products.module.css";
import { Pagination, Search } from "../../ui/dashboard/dashboardindex";
import Image from "next/image";
import Link from "next/link";
import { useLanguageService } from "../../../hooks/useLanguageService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const Page = () => {
  const { foodService, categoryService, language } = useLanguageService();
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    imgUrl: '',
    categoryId: '',
    state: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Thêm debounce cho việc tìm kiếm
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchFoods(currentPage, itemsPerPage);
    fetchCategories();
  }, [currentPage, itemsPerPage]);

  // Effect để gọi lại API khi ngôn ngữ thay đổi
  useEffect(() => {
    fetchFoods(currentPage, itemsPerPage);
    fetchCategories();
  }, [language]); // Thêm language vào dependency

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

  const fetchFoods = async (page, pageSize) => {
    try {
      setLoading(true);
      const response = await foodService.getFoods(page, pageSize);
      
      console.log("API Response (Foods):", response); // Debug thông tin API trả về
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        setFoods(response.data);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.metadata) {
          console.log("Pagination Metadata (Foods):", response.metadata); // Debug metadata
          setMetadata(response.metadata);
        } else {
          console.warn("No metadata found in Foods API response");
        }
      } else {
        console.error("Unexpected API response format:", response);
        setFoods([]);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to fetch foods");
      console.error("Error fetching foods:", err);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      const categoryData = Array.isArray(response) ? response : response.data || [];
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Lọc dữ liệu phía client (chỉ áp dụng khi có search term)
  const filteredFoods = foods.filter(food => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return (
      (food?.name?.toLowerCase().includes(searchLower)) ||
      (food?.description?.toLowerCase().includes(searchLower)) ||
      (categories.find(cat => cat.id === food.categoryId)?.name?.toLowerCase().includes(searchLower))
    );
  });

  const handleEdit = (food) => {
    setSelectedFood(food);
    setEditForm({
      name: food.name || '',
      description: food.description || '',
      price: food.price || '',
      imgUrl: food.imgUrl || '',
      categoryId: food.categoryId || '',
      state: food.state || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await foodService.updateFood(
        selectedFood.id,
        editForm.name,
        editForm.description,
        editForm.price,
        editForm.imgUrl,
        editForm.categoryId,
        editForm.state
      );
      setShowEditModal(false);
      fetchFoods(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating food:", err);
      setError("Failed to update food");
    }
  };

  const handleDelete = (food) => {
    setSelectedFood(food);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await foodService.deleteFood(selectedFood.id);
      setShowDeleteModal(false);
      fetchFoods(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting food:", err);
      setError("Failed to delete food");
    }
  };

  const handleView = async (food) => {
    try {
      const foodDetail = await foodService.getFoodById(food.id);
      setSelectedFood(foodDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching food details:", err);
      setError("Failed to fetch food details");
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
          <Suspense fallback={<div>Loading...</div>}>
            <Search 
              onSearch={handleSearch}
              onChange={handleSearch}
              placeholder="Tìm kiếm theo tên, mô tả hoặc danh mục món ăn..."
            />
          </Suspense>
          <Link href="/manager/dashboard/products/add">
            <button className={Style.addButton}>Add New</button>
          </Link>
      </div>
      
      {/* Hiển thị kết quả tìm kiếm */}
      {debouncedSearchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
          Tìm thấy: <strong>{filteredFoods.length}</strong> món ăn
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Image</td>
            <td>Name</td>
            <td>Description</td>
            <td>Price</td>
            <td>Category</td>
            <td>Quantity</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {filteredFoods.map((food) => (
            <tr key={food.id}>
              <td>
                <div className={Style.imageContainer}>
                  <Image 
                    src={food.imgUrl || '/placeholder.png'}
                    alt={food.name || 'Food image'}
                    width={50}
                    height={50}
                    className={Style.foodImage}
                  />
                </div>
              </td>
              <td>{food.name}</td>
              <td>{food.description}</td>
              <td>${food.price}</td>
              <td>
                {categories.find(cat => cat.id === food.categoryId)?.name || 'N/A'}
              </td>
              <td>
                {food.quantity}
              </td>
              <td>
                <div className={Style.buttons}>
                  <button 
                    className={`${Style.button} ${Style.view}`}
                    onClick={() => handleView(food)}
                  >
                    View
                  </button>
                  <button 
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(food)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(food)}
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
        <Suspense fallback={<div>Loading...</div>}>
          <Pagination metadata={metadata || { page: 0, totalPages: 1, count: filteredFoods.length, totalElements: filteredFoods.length }} />
        </Suspense>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Edit Food</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Description:</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Price:</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Image URL:</label>
                <input
                  type="text"
                  value={editForm.imgUrl}
                  onChange={(e) => setEditForm({...editForm, imgUrl: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Category:</label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm({...editForm, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Status:</label>
                <select
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                  required
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
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Delete Food</h2>
            <p>Are you sure you want to delete {selectedFood?.name}?</p>
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
            <h2>Food Details</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailImage}>
                <Image 
                  src={selectedFood?.imgUrl || '/placeholder.png'}
                  alt={selectedFood?.name || 'Food detail image'}
                  width={200}
                  height={200}
                  className={Style.foodImage}
                />
              </div>
              <div className={Style.detailItem}>
                <label>Name:</label>
                <span>{selectedFood?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Description:</label>
                <span>{selectedFood?.description}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Price:</label>
                <span>${selectedFood?.price}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Category:</label>
                <span>
                  {categories.find(cat => cat.id === selectedFood?.categoryId)?.name || 'N/A'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Status:</label>
                <span className={`${Style.status} ${selectedFood?.state === 'ACTIVE' ? Style.active : Style.inactive}`}>
                  {selectedFood?.state}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Created At:</label>
                <span>{new Date(selectedFood?.createdAt).toLocaleString()}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Updated At:</label>
                <span>{new Date(selectedFood?.updatedAt).toLocaleString()}</span>
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
  );
};

export default Page;