"use client";

import React, { useEffect, useState } from "react";
import styles from "./Price.module.css";

type Props = {
  price: number;
  id: number;
  options?: { title: string; additionalPrice: number }[];
};

const Price = ({ price, id, options }: Props) => {
  const [total, setTotal] = useState(price);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setTotal(
      quantity * (options ? price + options[selected].additionalPrice : price)
    );
  }, [quantity, selected, options, price]);

  return (
    <div className={styles.container}>
      <h2 className={styles.totalPrice}>${total.toFixed(2)}</h2>

      {/* OPTIONS CONTAINER */}
      <div className={styles.optionsContainer}>
        {options?.map((option, index) => (
          <button
            key={option.title}
            className={`${styles.optionButton} ${
              selected === index ? styles.optionButtonSelected : ""
            }`}
            onClick={() => setSelected(index)}
          >
            {option.title}
          </button>
        ))}
      </div>

      {/* QUANTITY AND ADD BUTTON CONTAINER */}
      <div className={styles.actionsContainer}>
        {/* QUANTITY */}
        <div className={styles.quantityContainer}>
          <span>Quantity</span>
          <div className={styles.quantityControls}>
            <button
              onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              {"<"}
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => (prev < 9 ? prev + 1 : 9))}
            >
              {">"}
            </button>
          </div>
        </div>
        {/* CART BUTTON */}
        <button className={styles.cartButton}>Add to Cart</button>
      </div>
    </div>
  );
};

export default Price;
