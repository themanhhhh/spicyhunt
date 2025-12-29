"use client";
import React ,{useState,useEffect,useRef}from "react";
import  {motion} from "framer-motion";
import Image from "next/image";

import Style from "./SliderCard.module.css";
import images from "../../../img";
import { LikeProfile } from "../../componentsindex";

const SliderCard = ({user,image,description}) => {
  return (
    <motion.div className={Style.sliderCard}>
        <div className={Style.sliderCard_box}>
            <div className="testimonial__quotes">
                <span className="left-quote">“</span>
                <span className="right-quote">”</span>
                </div>
                <p className="testimonial__text">
                {description}
                </p>
            </div>
            <motion.div className={Style.sliderCard_box_img}>
                <Image
                className={Style.sliderCard_box_img_img}
                    src={image}
                    alt="slider profile"
                    width={320}
                    height={180}
                />
                <h3>{user}</h3>
            </motion.div>
    </motion.div>
  )
};

export default SliderCard;