"use client";
import React, { useState } from "react";
import Style from "./Slider.module.css";
import { TiArrowLeftThick, TiArrowRightThick } from "react-icons/ti";
import { useTranslation } from "../../hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";

// Ví dụ import SliderCard và ảnh
import SliderCard from "./SliderCard/SliderCard";
import images from "../../img";

const Slider = () => {
  const t = useTranslation();
  // Mảng dữ liệu demo
  const sliderArray = [
    {
      id: 1,
      user: "Liya Allen, Manager",
      avatar: images.author1,
      description: t('slider.testimonial1'),
    },
    {
      id: 2,
      user: "Quy, Customer",
      avatar: images.author2,
      description: t('slider.testimonial2'),
    },
  ];

  const backgroundImg = images.sliderimg;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < sliderArray.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Chuyển về slide trước
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Nếu muốn quay vòng về slide cuối
      setCurrentIndex(sliderArray.length - 1);
    }
  };

  return (
    <div className={Style.slider} style={{ position: 'relative', minHeight: '600px' }}>
      <div className={Style.slider_bg_overlay}></div>
      <img src={backgroundImg.src} alt="testimonial bg" className={Style.slider_bg_img} />
      <div className={Style.slider_content_centered}>
        <p className={Style.hightlight}>• {t('slider.ourTestimonials')}</p>
        <h1 className={Style.slider_title}>{t('slider.realStories')}<br/><span className={Style.hightlight}>{t('slider.mealsAndExperiences')}</span></h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className={Style.slider_quote_box}>
              <span className={Style.slider_quote_icon}>“”</span>
              <p className={Style.slider_quote_text}>{sliderArray[currentIndex].description}</p>
            </div>
            <div className={Style.slider_user_box}>
              <img src={sliderArray[currentIndex].avatar.src} alt={sliderArray[currentIndex].user} className={Style.slider_user_avatar} />
              <div className={Style.slider_user_name}>{sliderArray[currentIndex].user}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className={Style.slider_nav_left} onClick={handlePrev}><TiArrowLeftThick /></div>
        <div className={Style.slider_nav_right} onClick={handleNext}><TiArrowRightThick /></div>
      </div>
    </div>
  );
};

export default Slider;
