import React from "react";
import Style from "./menuCard.module.css";
import MenuSmallCard from "../menuSmallCard/menuSmallCard";

const MenuCard = ({ category, items = [], className }) => {
  return (
    <div className={`${Style.menuCard} ${className}`}>  
      <div className={Style.menuCard_content}>
        <p>• MENU & PRICING</p>
        <h1>{category}</h1>
      </div>
      <div className={Style.menuCard_box}>
        {items && items.length > 0 ? (
          items.map((item) => (
            <MenuSmallCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              imgUrl={item.imgUrl}
              description={item.description}
            />
          ))
        ) : (
          <div className={Style.emptyCategory}>
            <p>Đang cập nhật món ăn cho danh mục này...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;