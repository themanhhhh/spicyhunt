"use client";
import React, { useState, useEffect } from 'react';
import AddressAutocomplete from '../components/AddressAutocomplete/AddressAutocomplete';
import { addressService } from '../api/address/addressService';
import styles from './AddressManager.module.css';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaHome, FaBriefcase, FaHeart, FaSpinner } from 'react-icons/fa';
import { Loader } from '../components/componentsindex';
import toast from 'react-hot-toast';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    label: 'HOME', // HOME, WORK, OTHER
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

  // Load addresses when component mounts
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getUserAddresses();

      // Handle both response formats: direct array or { data: [...] }
      let addressList = [];
      if (Array.isArray(response)) {
        addressList = response;
      } else if (response && Array.isArray(response.data)) {
        addressList = response.data;
      }

      setAddresses(addressList);
      if (addressList.length > 0) {
        toast.success(`Loaded ${addressList.length} addresses`, {
          duration: 2000,
          position: "top-right"
        });
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Fallback to localStorage if API fails
      const savedAddresses = localStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
        toast.success('Loaded addresses from local cache', {
          duration: 3000,
          position: "top-center",
          icon: 'ℹ️'
        });
      } else {
        toast.error('Failed to load addresses. Please try again later.', {
          duration: 4000,
          position: "top-center"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressData) => {
    setSelectedAddress(addressData);
    setFormData(prev => ({
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

    toast.success('Address selected successfully!', {
      duration: 2000,
      position: "top-right"
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
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
    setEditingAddress(null);
    setShowAddForm(false);
    toast.dismiss(); // Dismiss any active toasts when closing form
  };

  const handleSaveAddress = async () => {
    if (!formData.street && !formData.formatted_address) {
      toast.error('Please select or enter an address', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    try {
      setSaving(true);
      toast.loading('Saving address...', { id: 'save-address' });

      // Combine addressDetail from fields (excluding apt)
      const addressDetail = [
        formData.street,
        formData.city,
        formData.state,
        formData.zipCode,
        formData.country
      ].filter(Boolean).join(', ');

      // Get client IP
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const addressIp = ipData.ip;
      const isDefault = formData.isDefault;

      let response;
      if (editingAddress) {
        // Update: keep existing logic (if API update needs addressIp then modify similarly)
        response = await addressService.updateAddress(editingAddress._id || editingAddress.id, {
          addressDetail,
          isDefault
        });
      } else {
        // Add new address
        response = await addressService.createAddress({
          addressDetail,
          addressIp,
          isDefault
        });
      }

      if (response && response.success) {
        await loadAddresses();
        resetForm();
        toast.success(
          editingAddress ? 'Address updated successfully!' : 'Address saved successfully!',
          {
            id: 'save-address',
            duration: 3000,
            position: "top-center"
          }
        );
      } else {
        throw new Error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.', {
        id: 'save-address',
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      label: ['HOME', 'WORK'].includes(address.label) ? address.label : 'OTHER',
      customLabel: !['HOME', 'WORK'].includes(address.label) ? address.label : '',
      street: address.street || '',
      apt: address.apt || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      latitude: address.latitude,
      longitude: address.longitude,
      formatted_address: address.formatted_address || '',
      place_id: address.place_id,
      isDefault: address.isDefault || false
    });
    setShowAddForm(true);

    toast.success(`Editing address: ${address.label}`, {
      duration: 2000,
      position: "top-right"
    });
  };

  const handleDeleteAddress = async (addressId) => {
    // Use toast with custom confirm dialog
    toast((t) => (
      <div className={styles.toastConfirm}>
        <div className={styles.toastMessage}>
          <strong>Delete Address</strong>
          <p>Are you sure you want to delete this address?</p>
        </div>
        <div className={styles.toastActions}>
          <button
            className={styles.toastCancel}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className={styles.toastConfirmBtn}
            onClick={() => {
              toast.dismiss(t.id);
              confirmDeleteAddress(addressId);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: "top-center"
    });
  };

  const confirmDeleteAddress = async (addressId) => {
    try {
      toast.loading('Deleting address...', { id: 'delete-address' });

      const response = await addressService.deleteAddress(addressId);
      if (response.success) {
        // Reload addresses from server
        await loadAddresses();
        toast.success('Address deleted successfully!', {
          id: 'delete-address',
          duration: 3000,
          position: "top-center"
        });
      } else {
        throw new Error(response.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address. Please try again.', {
        id: 'delete-address',
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      toast.loading('Setting default address...', { id: 'set-default' });

      const response = await addressService.updateAddressDefault(addressId);
      if (response && response.success) {
        await loadAddresses();
        toast.success('Default address updated successfully!', {
          id: 'set-default',
          duration: 3000,
          position: "top-center"
        });
      } else {
        throw new Error(response.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address. Please try again.', {
        id: 'set-default',
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'HOME': return <FaHome />;
      case 'WORK': return <FaBriefcase />;
      default: return <FaHeart />;
    }
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'HOME': return '#10b981';
      case 'WORK': return '#3b82f6';
      default: return '#f59e0b';
    }
  };

  return (
    <div className={styles.addressManager}>
      <div className={styles.header}>
        <h2>Address Management</h2>
        <p className={styles.subtitle}>Manage your delivery addresses for easier ordering</p>
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h3>
              <FaMapMarkerAlt />
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              className={styles.closeButton}
              onClick={resetForm}
            >
              <FaTimes />
            </button>
          </div>
          <div className={styles.formContent}>
            {/* Address Search */}
            <div className={styles.inputGroup}>
              <label>Search Address</label>
              <AddressAutocomplete
                placeholder="Search for your address..."
                onAddressSelect={handleAddressSelect}
                value={formData.formatted_address}
                onChange={(e) => setFormData(prev => ({ ...prev, formatted_address: e.target.value }))}
              />
            </div>

            {/* Address Label */}
            <div className={styles.inputGroup}>
              <label>Address Label</label>
              <div className={styles.labelSelector}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="label"
                    value="HOME"
                    checked={formData.label === 'HOME'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioCustom}>
                    <FaHome /> Home
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="label"
                    value="WORK"
                    checked={formData.label === 'WORK'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioCustom}>
                    <FaBriefcase /> Work
                  </span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="label"
                    value="OTHER"
                    checked={formData.label === 'OTHER'}
                    onChange={handleInputChange}
                  />
                  <span className={styles.radioCustom}>
                    <FaHeart /> Other
                  </span>
                </label>
              </div>
              {formData.label === 'OTHER' && (
                <input
                  type="text"
                  name="customLabel"
                  placeholder="Enter custom label"
                  value={formData.customLabel}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              )}
            </div>

            {/* Address Details */}
            <div className={styles.addressDetails}>
              <div className={styles.inputGroup}>
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Street address"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Apartment, Suite, etc. (Optional)</label>
                <input
                  type="text"
                  name="apt"
                  placeholder="Apt, Suite, Floor, etc."
                  value={formData.apt}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                <span className={styles.checkboxCustom}></span>
                Set as default address
              </label>
            </div>

            {/* Selected Address Info */}
            {selectedAddress && (
              <div className={styles.selectedAddressInfo}>
                <h4>Selected Address Details:</h4>
                <p><strong>Full Address:</strong> {selectedAddress.formatted_address}</p>
                <p><strong>Coordinates:</strong> {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
              >
                <FaTimes /> Cancel
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSaveAddress}
                disabled={saving || (!selectedAddress && !formData.street)}
              >
                {saving ? <FaSpinner className={styles.spinning} /> : <FaSave />}
                {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className={styles.addressList}>
        {loading ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinning} />
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className={styles.emptyState}>
            <FaMapMarkerAlt className={styles.emptyIcon} />
            <h3>No addresses saved</h3>
            <p>Add your first address to get started with faster checkout</p>
          </div>
        ) : (
          <div className={styles.addressGrid}>
            {addresses.map((address) => (
              <div
                key={address._id || address.id}
                className={`${styles.addressCard} ${address.isDefault ? styles.defaultAddress : ''}`}
              >
                <div className={styles.addressHeader}>
                  <div className={styles.addressLabel} style={{ color: getLabelColor(address.label) }}>
                    {getLabelIcon(address.label)}
                    <span>{address.label}</span>
                  </div>
                  {address.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>

                <div className={styles.addressContent}>
                  <p className={styles.addressText}>
                    {address.addressDetail}
                  </p>
                </div>

                <div className={styles.addressActions}>
                  {!address.isDefault && (
                    <button
                      className={styles.actionButton}
                      onClick={() => handleSetDefault(address._id || address.id)}
                      title="Set as default"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditAddress(address)}
                    title="Edit address"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteAddress(address._id || address.id)}
                    title="Delete address"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager; 