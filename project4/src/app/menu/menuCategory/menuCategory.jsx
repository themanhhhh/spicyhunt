"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./menuCategory.module.css";
import Image from "next/image";
import images from "../../img/index";

const MenuCategory = ({ categories = [], onCategoryClick }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Danh sách hình ảnh mặc định cho các danh mục
  const defaultImages = [
    images.specialmenu1,
    images.specialmenu2,
    images.specialmenu3,
    images.specialmenu4,
    images.specialmenu5,
    images.specialmenu6,
  ];

  // Cố định 5 categories mỗi slide
  const categoriesPerSlide = 5;
  const totalPages = Math.ceil(categories.length / categoriesPerSlide);

  // Auto-slide
  useEffect(() => {
    const iv = setInterval(() => setCurrentPage(p => (p + 1) % totalPages), 4000);
    return () => clearInterval(iv);
  }, [totalPages]);

  const nextSlide = () => setCurrentPage(p => (p + 1) % totalPages);
  const prevSlide = () => setCurrentPage(p => (p - 1 + totalPages) % totalPages);
  const goToPage = i => setCurrentPage(i);

  // Lấy 5 categories cho trang hiện tại
  const currentCategories = categories.slice(
    currentPage * categoriesPerSlide,
    currentPage * categoriesPerSlide + categoriesPerSlide
  );

  // Framer variants cho slide
  const sliderVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { type: "spring", stiffness: 400, damping: 40, duration: 0.6 }
    },
    exit: { 
      opacity: 0, 
      x: -100, 
      transition: { type: "spring", stiffness: 400, damping: 40, duration: 0.6 }
    }
  };

  // Handle click category
  const handleCategoryClick = (categoryId) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
  };

  return (
    <div className={Style.container}>
      <p>• TASTE THE BEST THAT SURPRISE YOU</p>
      <h2 className={Style.title}>
        OUR SPECIAL <span>MENU</span>
      </h2>
      <p className={Style.subtitle}>
        Enjoy the unique dishes from the basilico restaurant that only our restaurant has, Fusce malesuada, lorem vitae euismod lobortis.
      </p>

      <div className={Style.sliderContainer}>
        <button className={Style.sliderButton} onClick={prevSlide}>&#8249;</button>

        <div className={Style.sliderWrapper}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentPage}
              className={Style.categoryList}
              variants={sliderVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {currentCategories.map((cat, idx) => (
                <div 
                  key={cat.id} 
                  className={Style.categoryItem}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Image
                    src={cat.imgUrl || defaultImages[idx % defaultImages.length]}
                    alt={cat.name}
                    width={120}
                    height={120}
                    style={{ borderRadius: '50%' }}
                  />
                  <span>{cat.name}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <button className={Style.sliderButton} onClick={nextSlide}>&#8250;</button>
      </div>

      <div className={Style.pagination}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <span
            key={i}
            className={`${Style.dot} ${currentPage === i ? Style.activeDot : ""}`}
            onClick={() => goToPage(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;
