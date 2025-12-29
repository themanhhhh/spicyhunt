import React from "react";
import { HeroSection, Navbar } from "../componentsindex";
import Style from "./Banner.module.css";
import Image from "next/image";
import images from "../../img/index";

const Banner = () => {
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
            opacity: 0.3
          }}
        />
      </div>
      <div className={Style.content}>
        <Navbar/>
        <HeroSection/>
      </div>
    </div>
  )
}

export default Banner