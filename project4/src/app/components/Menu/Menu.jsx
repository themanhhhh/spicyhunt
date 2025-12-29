"use client";
import React, { useState, useEffect } from "react";
import Style from "./Menu.module.css";
import MenuCard from "./MenuCard/MenuCard";
import { foodService } from "../../api/food/foodService";

const Menu = () => {
  // State để lưu dữ liệu từ API
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function để format dữ liệu từ API
  const formatFoodData = (foods) => {
    return foods.slice(0, 6).map((food) => ({
      id: food.id,
      name: food.name,
      price: food.price,
      imgUrl: food.imgUrl,
      description: food.description || "Món ăn ngon được chế biến từ những nguyên liệu tươi ngon nhất.",
      categoryName: food.categoryName
    }));
  };

  // Fetch data từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách foods và chỉ lấy 6 món đầu tiên
      const foodResponse = await foodService.getMainDishes(0,6, 'VI');
      if (foodResponse && foodResponse.data) {
        const foodsData = Array.isArray(foodResponse.data) 
          ? foodResponse.data 
          : foodResponse.data.content || [];
        setFoods(formatFoodData(foodsData));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className={Style.loading}>Đang tải...</div>;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className={Style.Menu}>
      {/* Header Section */}
      <div className={Style.Menu_header}>
        <span className={Style.Menu_subtitle}>• FROM OUR MENU</span>
        <h2 className={Style.Menu_title}>
          AN INSPIRED MENU THAT<br/> 
          <span className={Style.Menu_title_highlight}>BLENDS TRADITION</span>
        </h2>
      </div>

      {/* Menu Items Grid */}
      <div className={Style.Menu_items_section}>
        <div className={Style.Menu_items_grid}>
          {foods && foods.length > 0 ? (
            foods.map((food) => (
              <MenuCard
                key={food.id}
                id={food.id}
                name={food.name}
                price={food.price}
                imgUrl={food.imgUrl}
                description={food.description}
                categoryName={food.categoryName}
              />
            ))
          ) : (
            <div className={Style.Menu_empty}>
              <p>Không có món ăn nào để hiển thị</p>
            </div>
          )}
        </div>
      </div>
        
      <div className={Style.Menu_Route}>
        <p>Ready to Savor the Best? <a href="/menu">Check Our Dishes!</a></p> 
      </div>
    </div>
  );
};

export default Menu;