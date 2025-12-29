"use client";
import React from "react";
import images from "../../img/index";
import { useState } from "react";
import Approachdescription from "./approachdescription/approachdescription";

import Style from "./approach.module.css";

const approach = () => {
    const MissionArray = [
        {
          id: 1,
          image: images.ourmission,
          p: "OUR MISSION",
          p1: "Delivering Unforgettable Flavors With Every Dish We Serve.",
          p2: "Creating A Welcoming Space Where Food Connects Hearts.",
          p3: "Committed To Quality, Innovation, And Exceptional Service."
        },
      ];
      const VisionArray = [
        {
          id: 1,
          image: images.ourvision,
          p: "OUR VISION",
          p1: "Committed To Quality, Innovation, And Exceptional Service.",
          p2: "Delivering Unforgettable Flavors With Every Dish We Serve.",
          p3: "Creating A Welcoming Space Where Food Connects Hearts."
        },
      ];
      const ValueArray = [
        {
          id: 1,
          image: images.ourvalue,
          p: "OUR VALUE",
          p1: "Creating A Welcoming Space Where Food Connects Hearts.",
          p2: "Committed To Quality, Innovation, And Exceptional Service.",
          p3: "Delivering Unforgettable Flavors With Every Dish We Serve."
        },
        
      ];
    
      const [mission , setMission] = useState(true);
      const [vision , setVision] = useState(false);
      const [value , setValue] = useState(false);
    
      const openMission = () =>{
        if(!mission){
          setMission(true);
          setValue(false);
          setVision(false);
        }
      }
    
      const openVision = () =>{
        if(!vision){
          setMission(false);
          setVision(true);
          setValue(false);
        }
      }
    
      const openValue = () =>{
        if(!value){
          setMission(false);
          setVision(false);
          setValue(true);
        }
      }
      return (
        <div className={Style.approach}>
          <div className={Style.approach_title}>
            <span className={Style.approach_title_span}> • FROM OUR MENU</span>
            <h2>AN INSPIRED MENU THAT<br/> <div className={Style.approach_title_span_hightlight}>BLENDS TRADITION</div> </h2>
            <div className={Style.approach_tabs}>
              <div className={Style.approach_tabs_btn}>
                <button onClick={() => openMission()}>
                   Mission
                </button>
                <button onClick={() => openVision()}>
                  Vision
                </button>
                <button onClick={() => openValue()}>
                   Value
                </button>
              </div>
            </div>
          </div>
          {
            mission &&(
              <div className={Style.approach_box}>
                {
                  MissionArray.map((el,i) =>(
                    <Approachdescription key={i}  
                    el={el} />
                  ))
                }
              </div>
            )
          }
          {
            vision &&(
              <div className={Style.approach_box}>
                {
                  VisionArray.map((el,i) =>(
                    <Approachdescription key={i}  
                    el={el} />
                  ))
                }
              </div>
            )
          }
          {
            value &&(
              <div className={Style.approach_box}>
                {
                  ValueArray.map((el,i) =>(
                    <Approachdescription key={i}  
                    el={el} />
                  ))
                }
              </div>
            )
          }
        </div>
      )
}

export default approach