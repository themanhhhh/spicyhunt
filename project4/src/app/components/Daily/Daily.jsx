"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCheckCircle , BsCheckCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import { motion } from "framer-motion";

import Style from "./Daily.module.css";
import images from "../../img";
import { Button } from "../componentsindex";
import { Router } from "next/router";
import { useTranslation } from "../../hooks/useTranslation";

const Daily = () => {
    const router = useRouter();
    const t = useTranslation();
    const handleBookTableClick = (e) => {
        e.preventDefault();
        const reserveSection = document.getElementById('reserve');
        if (reserveSection) {
            reserveSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
  return (
    <div className={Style.Daily}>
        <div className={Style.Daily_box}>
            <div className={Style.Daily_box_right}>
                <Image
                className={Style.Daily_box_right_image}
                src={images.daily}
                alt="daily offer"
                />
            </div>
            <div className={Style.Daily_box_left}>
                <span className={Style.Daily_box_left_span}> • {t('daily.ourDailyOffers')}</span>
                <h1>{t('daily.tasteTheSavingsWithOur')} <span className={Style.Daily_box_left_hightlight}>{t('daily.dailySpecials')}</span></h1>
                <br></br>
                <p>{t('daily.intro')}</p>
                <br></br>
                <p><BsCheckCircleFill className={Style.Daily_box_left_icon}/>  {t('daily.seasonalIngredients')}</p>
                <p><BsCheckCircleFill className={Style.Daily_box_left_icon}/>  {t('daily.vegetarianOptions')}</p>
                <p><BsCheckCircleFill className={Style.Daily_box_left_icon}/>  {t('daily.exquisitePairings')}</p>
                <div className={Style.Daily_box_left_btn}>
                    <Button btnName={t('daily.bookTable')} onClick={handleBookTableClick}/>
                    <Button btnName={t('daily.exploreMenu')} onClick={()=>router.push("/menu")}/>
                </div>
            </div>
        </div>
        <motion.div
                    className={Style.Daily_box_right_description}
                    animate={{ x: [350, 500, 0] }}
                    transition={{
                        duration: 3.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                >
                <span className={Style.Daily_box_right_description_span}>{t('daily.deliciousBurger')}</span>
                <p>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                    <FaStar className={Style.star}/>
                </p>
                <p><BsCheckCircleFill/> {t('daily.tomatoSauces')}</p>
                <p><BsCheckCircleFill/> {t('daily.vegetables')}</p>
                <p><BsCheckCircleFill/> {t('daily.lettuce')}</p>
                <p><BsCheckCircleFill/> {t('daily.cheeseSlice')}</p>
        </motion.div>
    </div>
  )
};

export default Daily;