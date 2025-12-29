"use client";
import React from "react";
import Image from "next/image";
import {TiSocialFacebook,TiSocialLinkedin,TiSocialTwitter,TiSocialYoutube,TiSocialInstagram,TiArrowSortedDown,TiArrowSortedUp,} from "react-icons/ti";
import { RiSendPlaneFill} from "react-icons/ri";
import { useTranslation } from "../../hooks/useTranslation";

//Internal import


import Style from "./Footer.module.css";
import images from "../../img";
import { Discover,HelpCenter } from "../Navbar";

const Footer = () => {
  const t = useTranslation();
  return  (
    <div className={Style.footer}>
      <div className={Style.footer_box}>
        <div className={Style.footer_box_social}>
          <Image src={images.logo} alt="footer logo" height={100} width={100} />
          <p>{t('footer.intro')}</p>
          <div className={Style.footer_social}>
            <a href="#">
              <TiSocialFacebook/>
            </a>
            <a href="#">
              <TiSocialLinkedin/>
            </a>
            <a href="#">
              <TiSocialTwitter/>
            </a>
            <a href="#">
              <TiSocialYoutube/>
            </a>
            <a href="#">
              <TiSocialInstagram/>
            </a>
          </div>
        </div>

        <div className={Style.footer_box_discover}>
          <h3>
            {t('footer.discover')}
          </h3>
         
        </div>
        <div className={Style.footer_box_help}>
          <h3>
            {t('footer.helpCenter')}
          </h3>
          
        </div>

        <div className={Style.subscribe}>
          <h3>{t('footer.subscribe')}</h3>
          <div className={Style.subscribe_box}>
            <input type="email" placeholder={t('footer.emailPlaceholder')}/>
            <RiSendPlaneFill className={Style.subscribe_box_send}/>
          </div>
          <div className={Style.subscribe_box_info}>
            <p>
              {t('footer.subscribeInfo')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
};
export default Footer;
