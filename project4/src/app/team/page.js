import React from "react";
import Banner from "./Banner/Banner";
import OurTeam from "./OurTeam/OurTeam";
import { Footer, FAQ, ChefTeam } from "../components/componentsindex";
import { Brand, Reserve, Daily, Card } from "../components/componentsindex";
import Style from "../styles/team.module.css"; // tạo file nếu muốn style toàn trang

const page = () => {
    return (
        <div className={Style.teamPage}>
            <Banner />
            <OurTeam />
            <FAQ/>
            <div id="reserve">
                <Reserve/>
            </div>
            <Footer />
        </div>
    );
};

export default page;
