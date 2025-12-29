"use client";
import React , {useState , useEffect, useContext} from "react";
import Image from "next/image";

import Style from "./HeroSection.module.css";
import { Button } from "../componentsindex";
import images from "../../img";
import { useTranslation } from "../../hooks/useTranslation";

const HeroSection = () => {
    const t = useTranslation();
    const handleBookTableClick = (e) => {
        e.preventDefault();
        const reserveSection = document.getElementById('reserve');
        if (reserveSection) {
            reserveSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return (
        <div className={Style.heroSection}>
            <div className={Style.heroSection_box}>
                <div className={Style.heroSection_box_left}>
                    <span > • </span>
                    {t('heroSection.artOfFineDining')}
                    <h1>{t('heroSection.diningRedefinedWith')} <span className={Style.heroSection_box_left_hightlight}>  {t('heroSection.everyBite')}
                        </span>
                    </h1>
                    <p>
                    {t('heroSection.description')}
                    </p>
                    <Button btnName={t('heroSection.bookTable')} handleClick={handleBookTableClick}/>
                </div>
                <div className={Style.heroSection_box_right}>
                    <div className={Style.heroSection_box_right_ellipse}>
                        <Image  
                            src={images.heroimg} 
                            alt="Main Interior" 
                            className={Style.heroSection_box_right_ellipse_main_image} 
                        />
                    </div>
                    <div className={Style.heroSection_box_right_ellipse_circle1}>
                        <Image 
                            src={images.heroimg2}
                            alt="Food 1" 
                            className={Style.heroSection_box_right_ellipse_small_image}
                        />
                    </div>
                    <div className={Style.heroSection_box_right_ellipse_circle2}>
                        <Image
                            src={images.heroimg3} 
                            alt="Food 2" 
                            className={Style.heroSection_box_right_ellipse_small_image} 
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default HeroSection;