"use client";

import React, { useState } from "react";
import styles from "./add.module.css";
import { useRouter } from "next/navigation";
import { useLanguageService } from "../../../../hooks/useLanguageService";
import toast from "react-hot-toast";

const AddOrderPage = () => {
    const { orderService } = useLanguageService();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tableId: "",
        customerName: "",
        status: "PENDING",
        totalPriceAfterDiscount: ""
    });

    // Validation functions
    const validateTableId = (value) => {
        if (!value.trim()) return 'Table ID is required';
        if (value.trim().length < 5) return 'Table ID must be at least 5 characters';
        return '';
    };

    const validateCustomerName = (value) => {
        if (!value.trim()) return 'Customer name is required';
        if (value.trim().length < 3) return 'Customer name must be at least 3 characters';
        return '';
    };

    const validateTotalPrice = (value) => {
        if (!value) return 'Total price is required';
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) return 'Total price must be a non-negative number';
        return '';
    };

    // Validate single field
    const validateField = (name, value) => {
        switch (name) {
            case 'tableId':
                return validateTableId(value);
            case 'customerName':
                return validateCustomerName(value);
            case 'totalPriceAfterDiscount':
                return validateTotalPrice(value);
            default:
                return '';
        }
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'status') {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Real-time validation
        const error = validateField(name, value);
        if (error) {
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await orderService.createOrder({
                ...formData,
                totalPriceAfterDiscount: formData.totalPriceAfterDiscount.toString()
            });

            // Check if API response contains error
            if (result.code && result.code !== 200) {
                const errorMessage = result.message || 'Failed to create order. Please try again.';
                toast.error(errorMessage);
                return;
            }

            // Check if response has error field or unsuccessful structure
            if (result.error || (result.code && result.code >= 1000)) {
                const errorMessage = result.message || result.error || 'Failed to create order. Please try again.';
                toast.error(errorMessage);
                return;
            }

            // Success case
            toast.success('Order created successfully!');
            router.push('/admin/dashboard/order');
        } catch (error) {
            console.error('Error creating order:', error);
            
            // Parse error response to get message from API
            let errorMessage = 'Failed to create order. Please try again.';
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Add New Order</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Table ID</label>
                    <input
                        type="text"
                        name="tableId"
                        value={formData.tableId}
                        onChange={handleChange}
                        placeholder="Enter table ID"
                        className={errors['tableId'] ? styles.errorInput : ''}
                    />
                    {errors['tableId'] && <span className={styles.errorText}>{errors['tableId']}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label>Customer Name</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Enter customer name"
                        className={errors['customerName'] ? styles.errorInput : ''}
                    />
                    {errors['customerName'] && <span className={styles.errorText}>{errors['customerName']}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Total Price After Discount</label>
                    <input
                        type="number"
                        name="totalPriceAfterDiscount"
                        value={formData.totalPriceAfterDiscount}
                        onChange={handleChange}
                        placeholder="Enter total price"
                        step="0.01"
                        min="0"
                        className={errors['totalPriceAfterDiscount'] ? styles.errorInput : ''}
                    />
                    {errors['totalPriceAfterDiscount'] && <span className={styles.errorText}>{errors['totalPriceAfterDiscount']}</span>}
                </div>

                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Order'}
                </button>
            </form>
        </div>
    );
};

export default AddOrderPage;
