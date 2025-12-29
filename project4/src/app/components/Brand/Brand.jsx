"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCheckCircle , BsCheckCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import classNames from "classnames";
import { GiRibbonMedal } from "react-icons/gi";
import { PiMedalLight } from "react-icons/pi";
import { useTranslation } from "../../hooks/useTranslation";

import Style from "./Brand.module.css";
import images from "../../img";
import { Button } from "../componentsindex";
import { Router } from "next/router";
import { motion } from "framer-motion";

const Brand = () => {
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
    <div className={Style.Brand}>
        <div className={Style.Brand_box}>
            <div className={Style.Brand_box_right}>
                <div className={Style.Brand_box_right_ellipse}>
                    <Image
                    className={Style.Brand_box_right_ellipse_image}
                    src={images.aboutusimg1}
                    alt="brand logo"
                    />
                </div>
                {/* <div className={classNames(Style.Brand_box_right_circle, page)}>
                    <Image 
                        src={images.aboutusimg2}
                        alt="About us 2" 
                        className={Style.Brand_box_right_small_image}
                    />
                </div> */}
            </div>
            <div className={Style.Brand_box_left}>
                <span className={Style.Brand_box_left_span}> • {t('brand.artOfFineDining')}</span>
                <h1>{t('brand.ourCommitment')} <span className={Style.Brand_box_left_hightlight}>{t('brand.excellence')}</span></h1>
                <br></br>
                <p>{t('brand.celebration')}</p>
                <br></br>
                <p><BsCheckCircleFill className={Style.Brand_box_left_icon}/>  {t('brand.seasonalIngredients')}</p>
                <p><BsCheckCircleFill className={Style.Brand_box_left_icon}/>  {t('brand.vegetarianOptions')}</p>
                <p><BsCheckCircleFill className={Style.Brand_box_left_icon}/>  {t('brand.exquisitePairings')}</p>
                <div className={Style.Brand_box_left_btn}>
                    <Button btnName={t('brand.orderNow')} onClick={()=>router.push("/menu")}/>
                    <Button btnName={t('brand.readMore')} onClick={()=>router.push("/service")}/>
                </div>
            </div>
        </div>
        <motion.div
                    className={Style.Daily_box_right_description}
                    animate={{ x: [500, 700, 0] }}
                    transition={{
                        duration: 5.0,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                >
                <p className={Style.icon}><PiMedalLight/></p>
                <span>{t('brand.yearsOfExperience')}</span>
        </motion.div>
    </div>
  )
};

export default Brand; 