"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCheckCircle , BsCheckCircleFill } from "react-icons/bs";
import { StarBadge } from "../Icon/Star";
import { ChefHat } from "../Icon/Chef";
import Style from "./Adv.module.css";
import images from "../../img";
import { Button } from "../componentsindex";
import { Router } from "next/router";
import { useTranslation } from "../../hooks/useTranslation";


const Adv = () => {
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
    <div className={Style.Adv}>
        <div className={Style.Adv_box}>
            <div className={Style.Adv_box_right}>
                <div className={Style.Adv_box_right_ellipse}>
                    <Image
                    className={Style.Adv_box_right_ellipse_image}
                    src={images.ouringredientsimg}
                    alt="brand logo"
                    />
                </div>
            </div>
            <div className={Style.Adv_box_left}>
                <span className={Style.Adv_box_left_span}> • {t('adv.ourIngredients')}</span>
                <h1>{t('adv.craftingDishesWith')} <span className={Style.Adv_box_left_hightlight}>{t('adv.freshestFlavors')}</span><br/></h1>
                <p>{t('adv.intro')}</p>
                <div className={Style.Adv_box_left_information}>
                    <div className={Style.Adv_box_left_information_box}>
                        <Image 
                            src={images.ing1}
                            width={50}
                            height={50}
                            alt="ing1"
                            className={Style.Adv_box_left_information_box_img1}
                        />
                        <h4>{t('adv.bestQualities')}</h4>
                    </div>
                    <div className={Style.Adv_box_left_information_box}>
                    <Image 
                            src={images.ing2}
                            width={50}
                            height={50}
                            alt="ing2"
                            className={Style.Adv_box_left_information_box_img2}
                        />
                        <h4>{t('adv.discountSystem')}</h4>
                    </div>
                    <div className={Style.Adv_box_left_information_box}>
                    <Image 
                            src={images.ing3}
                            width={50}
                            height={50}
                            alt="ing3"
                            className={Style.Adv_box_left_information_box_img3}
                        />
                        <h4>{t('adv.firstDelivery')}</h4>
                    </div>
                </div>
                <div className={Style.Adv_box_left_btn}>
                    <Button btnName={t('adv.bookTable')} onClick={handleBookTableClick}/>               
                </div>
            </div>
        </div>
        <div className={Style.Adv_achiv}>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>309</h1>
                    <p>{t('adv.professionalChefs')}</p>
                </div>
            </div>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>1000 +</h1>
                    <p>{t('adv.deliciousDishes')}</p>
                </div>
            </div>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>25 +</h1>
                    <p>{t('adv.yearsOfExperience')}</p>
                </div>
            </div>
            <div className={Style.Adv_achiv_box}>
                <div className={Style.Adv_achiv_box_left}>
                    <ChefHat className={Style.Adv_achiv_box_left_icon}/>
                </div>
                <div className={Style.Adv_achiv_box_right}>
                    <h1>300 +</h1>
                    <p>{t('adv.satisfiedClients')}</p>
                </div>
            </div>
        </div>
    </div>
  )
};

export default Adv;