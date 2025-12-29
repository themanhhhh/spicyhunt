"use client";
import React, { useState, useEffect } from "react";
import Banner from "./Banner/Banner";
import Approach from "./approach/approach";
import { Footer, FAQ, ChefTeam, Loader } from "../components/componentsindex";
import { Brand, Reserve, Daily, Card } from "../components/componentsindex";
import Style from "../styles/aboutus.module.css";
import images from "./../img/index";

const page = () => {
  const [loading, setLoading] = useState(true);

  const teamArray = [
    {
      id : 1,
      image : images.team1,
      name : "abc",
      tokenId : "123",
    }
  ];

  useEffect(() => {
    // Simulate loading time for page initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className={Style.aboutus}>
      <Banner/>
      <Brand />
      <Approach/>
      <Daily/>
      <ChefTeam/>
      <FAQ/>
      <div id="reserve">
          <Reserve/>
        </div>
      <Footer/>
    </div>
  )
}

export default page