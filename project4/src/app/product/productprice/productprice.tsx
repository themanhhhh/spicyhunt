"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../components/componentsindex";
import styles from "./productprice.module.css";
import NumberCounter from "./NumberCounter";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Props = {
  price: number;
  id: number;
  name: string;
  options?: { title: string; additionalPrice: number }[];
  onQuantityChange?: (quantity: number) => void;
  onOptionChange?: (selectedOption: number) => void;
  onAddToCart?: () => void;
};

const Price = ({ price, id, name, options, onQuantityChange, onOptionChange, onAddToCart }: Props) => {
  const [total, setTotal] = useState(price);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setTotal(
      quantity * (options ? price + options[selected].additionalPrice : price)
    );
  }, [quantity, selected, options, price]);

  // Thông báo thay đổi số lượng lên component cha
  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(quantity);
    }
  }, [quantity, onQuantityChange]);

  // Thông báo thay đổi tùy chọn lên component cha
  useEffect(() => {
    if (onOptionChange) {
      onOptionChange(selected);
    }
  }, [selected, onOptionChange]);

  // Hàm cập nhật số lượng
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  // Hàm cập nhật tùy chọn đã chọn
  const handleOptionSelected = (index: number) => {
    setSelected(index);
  };

  // Hàm xử lý khi click vào nút Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <div className={styles.Price_container}>
      <NumberCounter 
        value={total} 
        duration={500}
        className={styles.Price_totalPrice}
      />

      {/* OPTIONS CONTAINER */}
      <div className={styles.Price_optionsContainer}>
        {options?.map((option, index) => (
          <button
            key={option.title}
            className={`${styles.Price_optionButton} ${
              selected === index ? styles.Price_optionButtonSelected : ""
            }`}
            onClick={() => handleOptionSelected(index)}
          >
            {option.title}
          </button>
        ))}
      </div>

      {/* QUANTITY CONTAINER */}
      <div className={styles.Price_actionsContainer}>
        {/* QUANTITY */}
        <div className={styles.Price_quantityContainer}>
          <span>Số lượng</span>
          <div className={styles.Price_quantityControls}>
            <button className={styles.Price_setquantity}
              onClick={() => handleQuantityChange(quantity > 1 ? quantity - 1 : 1)}
            >
              {"<"}
            </button>
            <span>{quantity}</span>
            <button className={styles.Price_setquantity}
              onClick={() => handleQuantityChange(quantity < 9 ? quantity + 1 : 9)}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {/* ADD TO CART BUTTON */}
      <button 
        className={styles.Price_cartButton}
        onClick={handleAddToCart}
      >
        Thêm vào giỏ hàng
      </button>
    </div>
  );
};

export default Price;
