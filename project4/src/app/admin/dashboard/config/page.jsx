"use client";
import React, { useState, useEffect } from "react";
import Style from "./config.module.css";
import { configService } from "../../../api/config/configService";
import { Pagination, FilterableSearch } from "../../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
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

  const [configs, setConfigs] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    keyConfig: '',
    valueConfig: ''
  });

  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");
  
  // Lấy các tham số lọc từ URL
  const keyFilter = searchParams.get("key") || "";

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchConfigs(currentPage, itemsPerPage, keyFilter);
  }, [currentPage, itemsPerPage, keyFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== keyFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ key: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, keyFilter]);

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

  const fetchConfigs = async (page = 0, pageSize = 10, key = "") => {
    try {
      setLoading(true);
      const response = await configService.getConfig();
      
      console.log("API Response (Configs):", response);
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.data && Array.isArray(response.data)) {
        let filteredConfigs = response.data;
        
        // Lọc theo key nếu có
        if (key) {
          filteredConfigs = response.data.filter(config => 
            config.keyConfig && config.keyConfig.toLowerCase().includes(key.toLowerCase())
          );
        }
        
        // Phân trang manual
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedConfigs = filteredConfigs.slice(startIndex, endIndex);
        
        setConfigs(paginatedConfigs);
        
        // Sử dụng metadata từ API hoặc tạo metadata cho phân trang
        if (response.metadata) {
          setMetadata({
            ...response.metadata,
            page: page,
            totalPages: Math.ceil(filteredConfigs.length / pageSize),
            count: paginatedConfigs.length,
            totalElements: filteredConfigs.length
          });
        } else {
          setMetadata({
            page: page,
            totalPages: Math.ceil(filteredConfigs.length / pageSize),
            count: paginatedConfigs.length,
            totalElements: filteredConfigs.length
          });
        }

        // Hiển thị thông báo load thành công
        if (!key && page === 0) { // Chỉ hiển thị khi load lần đầu
          console.log("Configs loaded:", response.data.length);
        }
      } else {
        console.error("Unexpected API response format:", response);
        setConfigs([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching configs:", err);
      setConfigs([]);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách configuration. Vui lòng thử lại!");
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

  const handleAdd = () => {
    setFormData({
      keyConfig: '',
      valueConfig: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = async (config) => {
    try {
      setSelectedConfig(config);
      setFormData({
        keyConfig: config.keyConfig || '',
        valueConfig: config.valueConfig || ''
      });
      
      setShowEditModal(true);
      toast.success(`Đang chỉnh sửa: ${config.keyConfig}`, {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error("Error preparing edit form:", err);
      toast.error("Không thể mở form chỉnh sửa", {
        duration: 3000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (config) => {
    setSelectedConfig(config);
    setShowDeleteModal(true);
  };

  const handleView = (config) => {
    setSelectedConfig(config);
    setShowViewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.keyConfig.trim()) {
      toast.error("Key Config không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!formData.valueConfig.trim()) {
      toast.error("Value Config không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    try {
      toast.loading("Đang tạo configuration...", { id: "add-config" });
      
      const response = await configService.createConfig(formData);
      
      // Debug log to see what response we get
      console.log("Create config response:", response);
      
      // Check if response indicates an error
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tạo configuration. Vui lòng thử lại!");
        toast.error(errorMessage, {
          id: "add-config",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã tạo configuration "${formData.keyConfig}" thành công!`, {
        id: "add-config",
        duration: 3000,
        position: "top-center"
      });
      
      setShowAddModal(false);
      fetchConfigs(currentPage, itemsPerPage, keyFilter);
      setFormData({
        keyConfig: '',
        valueConfig: ''
      });
    } catch (err) {
      console.error("Error creating config:", err);
      const errorMessage = getErrorMessage(err, "Không thể tạo configuration. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "add-config",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.valueConfig.trim()) {
      toast.error("Value Config không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    try {
      toast.loading("Đang cập nhật configuration...", { id: "edit-config" });
      
      // Chỉ gửi valueConfig theo API spec
      const response = await configService.updateConfig(selectedConfig.id, formData.valueConfig);
      
      // Debug log to see what response we get
      console.log("Update config response:", response);
      
      // Check if response indicates an error
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật configuration. Vui lòng thử lại!");
        toast.error(errorMessage, {
          id: "edit-config",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật "${selectedConfig.keyConfig}" thành công!`, {
        id: "edit-config",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchConfigs(currentPage, itemsPerPage, keyFilter);
    } catch (err) {
      console.error("Error updating config:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật configuration. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-config",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa configuration...", { id: "delete-config" });
      
      const response = await configService.deleteConfig(selectedConfig.id);
      
      // Debug log to see what response we get
      console.log("Delete config response:", response);
      
      // Check if response indicates an error
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa configuration. Vui lòng thử lại!");
        toast.error(errorMessage, {
          id: "delete-config",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa "${selectedConfig.keyConfig}" thành công!`, {
        id: "delete-config",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchConfigs(currentPage, itemsPerPage, keyFilter);
    } catch (err) {
      console.error("Error deleting config:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa configuration. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-config",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.configContainer}>
      <div className={Style.container}>
        <div className={Style.top}>
          <h1>Configuration Management</h1>
          <div className={Style.topRight}>
            <FilterableSearch 
              placeholder="Tìm kiếm theo key config..." 
              onChange={handleSearch}
              onSearch={handleSearch}
              value={searchTerm}
              statusFilter=""
              onStatusChange={() => {}}
              statusOptions={[]}
            />
            <button onClick={handleAdd} className={Style.addButton}>
              Add New Config
            </button>
          </div>
        </div>

        {/* Hiển thị kết quả tìm kiếm */}
        {searchTerm && (
          <div className={Style.searchInfo}>
            Kết quả tìm kiếm cho: <strong>{searchTerm}</strong> | 
            Tìm thấy: <strong>{configs.length}</strong> config
          </div>
        )}

        {configs.length === 0 ? (
          <div className={Style.noData}>
            <p>Không có configuration nào được tìm thấy</p>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  updateFilters({ key: "" });
                }}
                className={Style.clearSearchButton}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <table className={Style.table}>
            <thead>
              <tr>
                <td>Key Config</td>
                <td>Value Config</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id}>
                  <td><strong>{config.keyConfig}</strong></td>
                  <td>
                    <div className={Style.configValue}>
                      {config.valueConfig && config.valueConfig.length > 100 
                        ? `${config.valueConfig.substring(0, 100)}...` 
                        : config.valueConfig}
                    </div>
                  </td>
                  <td>
                    <div className={Style.buttons}>
                      <button 
                        className={`${Style.button} ${Style.view}`}
                        onClick={() => handleView(config)}
                        title="Xem chi tiết"
                      >
                        View
                      </button>
                      <button 
                        className={`${Style.button} ${Style.edit}`}
                        onClick={() => handleEdit(config)}
                        title="Chỉnh sửa"
                      >
                        Edit
                      </button>
                      <button 
                        className={`${Style.button} ${Style.delete}`}
                        onClick={() => handleDelete(config)}
                        title="Xóa"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={Style.darkBg}>
          <Pagination metadata={metadata || { page: 0, totalPages: 1, count: configs.length, totalElements: configs.length }} />
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Add New Configuration</h2>
              <form onSubmit={handleAddSubmit}>
                <div className={Style.formGroup}>
                  <label>Key Config:</label>
                  <input
                    type="text"
                    value={formData.keyConfig}
                    onChange={(e) => setFormData({...formData, keyConfig: e.target.value})}
                    required
                    placeholder="Enter configuration key"
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Value Config:</label>
                  <textarea
                    value={formData.valueConfig}
                    onChange={(e) => setFormData({...formData, valueConfig: e.target.value})}
                    required
                    placeholder="Enter configuration value"
                  />
                </div>
                
                <div className={Style.modalButtons}>
                  <button type="submit" className={Style.saveButton}>Add Config</button>
                  <button 
                    type="button" 
                    className={Style.cancelButton}
                    onClick={() => {
                      setShowAddModal(false);
                      toast.dismiss();
                    }}
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
              <h2>Edit Configuration</h2>
              <form onSubmit={handleEditSubmit}>
                <div className={Style.formGroup}>
                  <label>Key Config:</label>
                  <input
                    type="text"
                    value={formData.keyConfig}
                    onChange={(e) => setFormData({...formData, keyConfig: e.target.value})}
                    disabled
                    className={Style.disabledInput}
                  />
                  <small>Key config cannot be changed</small>
                </div>
                <div className={Style.formGroup}>
                  <label>Value Config:</label>
                  <textarea
                    value={formData.valueConfig}
                    onChange={(e) => setFormData({...formData, valueConfig: e.target.value})}
                    required
                  />
                </div>
                
                <div className={Style.modalButtons}>
                  <button type="submit" className={Style.saveButton}>Save Changes</button>
                  <button 
                    type="button" 
                    className={Style.cancelButton}
                    onClick={() => {
                      setShowEditModal(false);
                      toast.dismiss();
                    }}
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
              <h2>Delete Configuration</h2>
              <p>Are you sure you want to delete the configuration key: <strong>{selectedConfig?.keyConfig}</strong>?</p>
              <p className={Style.warning}>This action cannot be undone.</p>
              <div className={Style.modalButtons}>
                <button 
                  className={Style.deleteButton}
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
                <button 
                  className={Style.cancelButton}
                  onClick={() => {
                    setShowDeleteModal(false);
                    toast.dismiss();
                  }}
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
              <h2>Configuration Details</h2>
              <div className={Style.detailContent}>
                <div className={Style.detailItem}>
                  <label>Key Config:</label>
                  <span className={Style.configKey}>{selectedConfig?.keyConfig}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Value Config:</label>
                  <div className={Style.configValueDetail}>
                    {selectedConfig?.valueConfig}
                  </div>
                </div>
                <div className={Style.detailItem}>
                  <label>ID:</label>
                  <span>{selectedConfig?.id}</span>
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

