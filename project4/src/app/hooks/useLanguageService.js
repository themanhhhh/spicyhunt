"use client";
import { useLanguage } from '@/app/context/LanguageContext';
import { categoryService } from '@/app/api/category/categoryService';
import { foodService } from '@/app/api/food/foodService';
import { getOrders, getOrderById, createOrder, updateOrderState, updateOrderInfo } from '@/app/api/order/orderService';

export const useLanguageService = () => {
  const { language } = useLanguage();

  // Category services
  const categoryServiceWithLang = {
    getCategories: (page = 0, pageSize = 10) =>
        categoryService.getCategories(page, pageSize, language),
    getAllCategories: (name = '', state = null, page = 0, pageSize = 10) =>
        categoryService.getAllCategories(name, state, page, pageSize, language),
    getCategoryById: (id) => categoryService.getCategoryById(id, language),
    getCategoryView: (size = 100) => categoryService.getCategoryView(size, language),
    addCategory: categoryService.addCategory,
    updateCategory: categoryService.updateCategory,
    deleteCategory: categoryService.deleteCategory,
    getActiveCategories: categoryService.getActiveCategories,
  };

  // Food services
  const foodServiceWithLang = {
    getFoods: (page = 0, size = 10) =>
        foodService.getFoods(page, size, language),
    getAllFoods: (name = '', categoryId = null, state = null, page = 0, pageSize = 10, signal = null) =>
        foodService.getAllFoods(name, categoryId, state, page, pageSize, signal, language),
    getFoodById: (id) => foodService.getFoodById(id, language),
    getFoodView: (size = 100) => foodService.getFoodView(size, language),
    addFood: foodService.addFood,
    updateFood: foodService.updateFood,
    deleteFood: foodService.deleteFood,
    getFoodByIdView: foodService.getFoodByIdView,
  };

  // ✅ Order services
  const orderServiceWithLang = {
    getOrders: getOrders,
    getOrderById: getOrderById,
    createOrder: createOrder,
    updateOrderState: updateOrderState,
    updateOrderInfo: updateOrderInfo,
    // Nếu bạn có thêm API như deleteOrder thì thêm vào đây
  };

  return {
    language,
    categoryService: categoryServiceWithLang,
    foodService: foodServiceWithLang,
    orderService: orderServiceWithLang, // ✅ thêm ra ngoài
  };
};
