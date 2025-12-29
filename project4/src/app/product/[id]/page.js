"use client"

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../styles/product.module.css";
import Price from "../productprice/productprice";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import { foodService } from "../../api/food/foodService";
import toast from "react-hot-toast";
import Banner from '../banner/Banner';
import { Footer, Button } from '../../components/componentsindex';
import Image from "next/image";
import images from "../../img/index";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await foodService.getFoodByIdView(id);
        console.log("Product response:", response);
        
        if (response && response.id) {
          // Response trả về trực tiếp là object data, không có wrapper
          const productData = response;
          
          // Xử lý dữ liệu product từ API
          const formattedProduct = {
            id: productData.id,
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price) || 0,
            image: productData.imgUrl,
            quantity: productData.quantity,
            state: productData.state,
            categoryId: productData.categoryId,
            categoryName: productData.categoryName,
            createdAt: productData.createdAt,
            updatedAt: productData.updatedAt,
            // Thêm options nếu có trong tương lai
            options: null
          };
          
          setProduct(formattedProduct);
          setTotalPrice(formattedProduct.price);
        } else {
          throw new Error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message || "Không thể tải thông tin món ăn");
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, showLoading, hideLoading]);

  // Cập nhật tổng giá khi thay đổi số lượng hoặc tùy chọn
  useEffect(() => {
    if (product) {
      const optionPrice = product.options 
        ? product.options[selectedOption].additionalPrice 
        : 0;
      setTotalPrice(quantity * (product.price + optionPrice));
    }
  }, [quantity, selectedOption, product]);

  // Hàm xử lý khi số lượng thay đổi
  const handleQuantityChange = (newQuantity) => {
    // Giới hạn số lượng dựa trên stock có sẵn
    const maxAllowed = Math.min(newQuantity, product?.quantity || 1);
    const minQuantity = Math.max(maxAllowed, 1);
    
    if (newQuantity > (product?.quantity || 1)) {
      toast.error(`Chỉ còn ${product.quantity} món trong kho`, {
        duration: 2000,
        position: "top-center"
      });
    }
    
    setQuantity(minQuantity);
  };

  // Hàm xử lý khi tùy chọn thay đổi
  const handleOptionChange = (newSelectedOption) => {
    setSelectedOption(newSelectedOption);
  };

  function handleAddToCart() {
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

    // Kiểm tra trạng thái và số lượng còn lại
    if (product.state !== 'AVAILABLE') {
      toast.error("Món ăn này hiện không có sẵn", {
        duration: 2000,
        position: "top-center"
      });
      return;
    }

    if (product.quantity === 0) {
      toast.error("Món ăn này đã hết hàng", {
        duration: 2000,
        position: "top-center"
      });
      return;
    }

    if (quantity > product.quantity) {
      toast.error(`Chỉ còn ${product.quantity} món trong kho`, {
        duration: 2000,
        position: "top-center"
      });
      return;
    }
    
    if (product) {
      showLoading();
      
      const option = product.options ? product.options[selectedOption] : null;
      
      const success = addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        option: option?.title,
        additionalPrice: option?.additionalPrice
      });
      
      if (success) {
        toast.success("Đã thêm vào giỏ hàng!", {
          duration: 2000,
          position: "top-center"
        });

        setTimeout(() => {
          router.push('/menu');
        }, 1000);
      }
      
      hideLoading();
    }
  }

  function handleLoginRedirect() {
    router.push('/login');
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div>Đang tải thông tin món ăn...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div>Lỗi: {error}</div>
        <button onClick={() => router.push('/menu')}>Quay về Menu</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div>Không tìm thấy món ăn</div>
        <button onClick={() => router.push('/menu')}>Quay về Menu</button>
      </div>
    );
  }

  return (
    <div className={styles.product}>
      <Banner
        Name={product.name}
      />
      <div className={styles.product_box}>
        <div className={styles.product_box_content}>
          <div className={styles.product_box_content_left}>
            {product.image ? (
              <Image 
                src={product.image}
                alt={product.name}
                width={350}
                height={350}
                priority
                className={styles.product_image}
              />
            ) : (
              <div className={styles.noImage}>
                <Image 
                  src={images.specialmenu1}
                  alt="Default food image"
                  width={350}
                  height={350}
                  className={styles.product_image}
                />
              </div>
            )}
          </div>
          <div className={styles.product_box_content_right}>
            <h1>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
            
            {/* Hiển thị thông tin category */}
            {product.categoryName && (
              <p className={styles.category}>
                <span>Danh mục:</span> {product.categoryName}
              </p>
            )}
            
            {/* Hiển thị trạng thái */}
            <p className={styles.status}>
              <span>Trạng thái:</span> 
              <span className={`${styles.statusBadge} ${product.state === 'AVAILABLE' ? styles.available : styles.unavailable}`}>
                {product.state === 'AVAILABLE' ? 'Có sẵn' : 'Hết hàng'}
              </span>
            </p>
            
            {/* Hiển thị số lượng còn lại */}
            <p className={styles.stockQuantity}>
              <span>Còn lại:</span> {product.quantity} món
            </p>
            
            <Price 
              price={product.price} 
              id={product.id} 
              name={product.name}
              options={product.options}
              onQuantityChange={handleQuantityChange}
              onOptionChange={handleOptionChange}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
