"use client";
import React from "react";
import Image from "next/image";
import Style from "./Service.module.css";
import images from "../../img";
import { useTranslation } from "../../hooks/useTranslation";

const Service = () => {
  const t = useTranslation();
  return (
    <div className={Style.service}>
        <div className={Style.service_box_text_center}>
            <h2 className={Style.service_box_text_center_small}>• {t('service.mainDishes')}</h2>
            <h1 className={Style.service_box_text_center_large}>
            {t('service.satisfyYourCravings')} <br /> {t('service.our')} <span className={Style.service_box_text_center_large_hightlight}>{t('service.signatureMains')}</span>
            </h1>
        </div>
        <div className={Style.service_box}>
            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg1}
                alt="Filter & Discover"
                className={Style.service_box_item_img}
                />
                <h3>{t('service.soups')}</h3>
                <p>{t('service.soupsDesc')}</p>
            </div>

            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg2}
                alt="Filter & Discover"
                className={Style.service_box_item_img}
                />
                <h3>{t('service.salads')}</h3>
                <p>{t('service.saladsDesc')}</p>
            </div>
            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg3}
                alt="Connect Wallet"
                className={Style.service_box_item_img}
                />
                <h3>{t('service.mainDishesTitle')}</h3>
                <p>{t('service.mainDishesDesc')}</p>
            </div>
            <div className={Style.service_box_item}>
                <Image 
                src={images.ourmaindishesimg4}
                alt="Filter & Discover"
                className={Style.service_box_item_img}
                />
                <h3>{t('service.appetizers')}</h3>
                <p>{t('service.appetizersDesc')}</p>
            </div>
        </div>
    </div>
  )
}

export default Service