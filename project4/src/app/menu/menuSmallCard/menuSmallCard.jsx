import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

import Style from "./menuSmallCard.module.css";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const MenuSmallCard = ({ id, name, price, description, image = null, imgUrl = null }) => {
  const [isImageHovered, setIsImageHovered] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  // Sử dụng imgUrl từ API nếu có, ngược lại dùng image từ prop
  const imageSource = imgUrl || image || "/placeholder-image.jpg";
  
  // Chuyển đổi price thành số nếu là chuỗi
  const displayPrice = typeof price === 'number' 
    ? price.toLocaleString('vi-VN') 
    : price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng", {
        duration: 2000,
        position: "top-center"
      });
      
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }

    // Tạo object product để thêm vào cart
    const product = {
      id: id,
      name: name,
      price: typeof price === 'number' ? price : parseFloat(price) || 0,
      image: imageSource,
      description: description,
      quantity: 1  // Số lượng mặc định khi click nút +
    };

    const success = addToCart(product);
    
    if (success) {
      toast.success(`Đã thêm ${name} vào giỏ hàng!`, {
        duration: 2000,
        position: "top-center"
      });
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${id}`);
  };
  
  return (
    <Link href={`/product/${id}`}>
        <div className={Style.MenuCard}>
        <div 
          className={Style.MenuCard_left}
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
          style={{ position: 'relative' }}
        >
        <Image
            src={imageSource}
            alt={name}
            width={100}
            height={100}
            className={Style.MenuCard_img}
        />
        {/* Các nút chỉ hiện khi hover vào ảnh */}
        {isImageHovered && (
          <div className={Style.action_buttons}>
            {/* Nút + để thêm vào giỏ hàng */}
            <div 
              className={Style.add_to_cart_btn}
              onClick={handleAddToCart}
              title="Thêm vào giỏ hàng"
            >
              <FaPlus />
            </div>
            
            {/* Nút ... để xem chi tiết */}
            <div 
              className={Style.view_details_btn}
              onClick={handleViewDetails}
              title="Xem chi tiết"
            >
              <BsThreeDots />
            </div>
          </div>
        )}
        </div>
        <div className={Style.MenuCard_right}>
        <div className={Style.MenuCard_right_name_price}>
            <h3 className={Style.MenuCard_title}><p>{name}</p></h3>
            <div className={Style.MenuCard_price}>
              
              <div className={Style.MenuCard_right_price_box}>
                  <p>{displayPrice} vnđ</p>
              </div>
            </div>
        </div>
        <p className={Style.MenuCard_description}>{description}</p>
        </div>
    </div>
    </Link> 
  )
}
  
export default MenuSmallCard;