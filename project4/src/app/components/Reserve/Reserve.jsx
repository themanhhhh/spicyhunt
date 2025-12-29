"use client";
import React from "react";
import Image from "next/image";
import Style from "./Reserve.module.css";
import images from "../../img";
import Form from "./ReserveForm/ReserveForm";
import { useTranslation } from "../../hooks/useTranslation";

const Reserve = () => {
  const t = useTranslation();
  
  return (
    <div className={Style.Reserve}>
        <div className={Style.Reserve_box}>
            <div className={Style.Reserve_box_left}>
                <div className={Style.Reserve_box_left_title}>
                    <span> • {t('reserve.title')}</span>
                </div>
                <div className={Style.Reserve_box_left_maintain}>
                    <h1>{t('reserve.subtitle')} <span className={Style.Reserve_box_left_maintain_hightlight}> {t('reserve.highlight')}</span></h1>
                </div>
                <div className={Style.Reserve_box_left_information}>
                    <h3>{t('reserve.openHours')}</h3>
                    <div className={Style.Reserve_box_left_information_time}>
                        <p>{t('reserve.monThu')} </p>
                        <p >10:00 AM - 8:00 PM</p>
                    </div>
                    <div className={Style.Reserve_box_left_information_time}>
                        <p>{t('reserve.friSat')} </p>
                        <p>  09:00 AM - 10:00PM</p>
                    </div>
                    <div className={Style.Reserve_box_left_information_time}>
                        <p>{t('reserve.sun')} </p>
                        <p>{t('reserve.closed')}</p>
                    </div>
                </div>
            </div>
            <div className={Style.Reserve_box_right}>
                <div className={Style.Reserve_box_right_table}>
                    <Form/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Reserve