"use client";
import React from "react";
import Image from "next/image";
import images from "../../img";
import Style from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={Style.Loader}>
      <div className={Style.Loader_box}>
        <div className={Style.Loader_box_img}>
          <Image
            src={images.loader}
            alt="loader"
            width={200}
            height={200}
            className={Style.Loader_box_img_img}
            priority
          />
        </div>
      </div>
    </div>
  )
};

export default Loader;