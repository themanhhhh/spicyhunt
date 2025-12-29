"use client";
import React from "react";
import Style from "./Card.module.css";
import { useState } from "react";
import Image from "next/image";
import {AiOutlineHeart} from "react-icons/ai";
import { BsImage } from "react-icons/bs";

import images from "../../img/index";

const Card = ({el}) => {
    const [like, setLike] = useState(true);


    const likeNft =()=>{
      if(!like){
        setLike(true);
      }else{
        setLike(false);
      }
    }
  return (
    <div className={Style.NFTCard}>
        <div className={Style.NFTCard_box} >
          <div className={Style.NFTCard_box_img}> 
            <Image
              src={images.team1}
              width={400}
              height={400}
              className={Style.NFTCard_box_img_img}
              />
          </div>
        </div>
    </div>
  )
}

export default Card