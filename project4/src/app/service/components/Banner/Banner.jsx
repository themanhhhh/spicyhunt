import React from "react";
import { Navbar } from "../../../components/componentsindex";
import Style from "./Banner.module.css";
import Link from "next/link";

import Image from "next/image";
import images from "../../../img/index";

const Banner = ({title}) => {
  return (
    <div className={Style.Banner}>
      <div className={Style.background}>
        <Image
          src={images.background}
          alt="Background"
          fill
          priority
          style={{
            objectFit: 'cover',
            opacity: 0.5
          }}
        />
        <div className={Style.overlay}></div>
      </div>
      <div className={Style.content}>
        <Navbar/>
        <div className={Style.bannerContent}>
          <h1 className={Style.title}>{title}</h1>
          <div className={Style.breadcrumbs}>
            <Link href="/">Home</Link> / <span>Services</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Banner