"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Style from "./styles/page.module.css";
import { 
  HeroSection ,
  Service,
  Subscribe,
  Title,
  Category,
  Filter,
  Collection,
  Slider,
  Brand,
  Loader,
  Daily,
  Menu,
  Adv,
  Reserve,
  Navbar,
  Footer,
  Blog,
  FAQ,
} from "./components/componentsindex";
import Banner from "./components/Banner/Banner";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for page initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second loading

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className={Style.homePage}>
        <Banner/>
        <Brand/>
        <Service/>
        <Daily/>
        <Menu/>
        <Adv/>
        <Slider/>
        {/* <Blog/> */}
        <FAQ/>
        <div id="reserve">
          <Reserve/>
        </div>
        <Footer/>
    </div>
  );
}
