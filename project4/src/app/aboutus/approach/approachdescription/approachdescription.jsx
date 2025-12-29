import React from "react";
import Style from "./approachdescription.module.css";
import { BsCheckCircleFill } from "react-icons/bs";
import { Button } from "../../../components/componentsindex";

import Image from "next/image";
import images from "../../../img/index";

const approachdescription = ({el}) => {
  return (
    <div className={Style.approachdescription}>
        <div className={Style.approachdescription_box}>
            <div className={Style.approachdescription_box_right}>
                <span className={Style.approachdescription_box_left_span}> • {el.p}</span>
                <h1>CREATING MOMENTS AROUND FLAVOR</h1>
                <br></br>
                <p>Every dish we create is a celebration of connection, crafted with passion and inspired by diverse flavors. Join us in an inviting space where every bite sparks joy and every moment becomes a cherished memory.</p>
                <br></br>
                <p><BsCheckCircleFill className={Style.approachdescription_box_left_icon}/>  {el.p1}</p>
                <p><BsCheckCircleFill className={Style.approachdescription_box_left_icon}/>  {el.p2}</p>
                <p><BsCheckCircleFill className={Style.approachdescription_box_left_icon}/>  {el.p3}</p>
            </div>
            <div className={Style.approachdescription_box_left}>
                <div className={Style.approachdescription_box_left_image_box}>
                    <Image
                    className={Style.approachdescription_box_left_image}
                    height={461}
                    width={635}
                    src={el.image}
                    alt="brand logo"
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default approachdescription