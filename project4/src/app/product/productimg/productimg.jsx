import React, { useState } from "react";
import Image from "next/image";
import { BsImages } from "react-icons/bs";
import { AiFillHeart,AiOutlineHeart } from "react-icons/ai";
import { TiArrowSortedDown,TiArrowSortedUp } from "react-icons/ti";

import Style from "./productimg.module.css";
import images from "../../img";

const ProductImg = ({product}) => {

    const [description , setDescription] = useState(true);
    const [details , setDetails] = useState(true);
    const [like , setLike] = useState(false);


    const openDescription = () => {
        if(!description){
            setDescription(true);
        }
        else{
            setDescription(false);
        }
    }

    const openDetails = () => {
        if(!details){
            setDetails(true);
        }
        else{
            setDetails(false);
        }
    }

    const likeNFT = () =>{
        if(!like){
            setLike(true);
        }
        else{
            setLike(false);
        }
    }
  return (
    <div className={Style.ProductImg}>
        <div className={Style.ProductImg_box}>
            <div className={Style.ProductImg_box_NFT}>
                <div className={Style.ProductImg_box_NFT_like}>
                    <BsImages className={Style.ProductImg_box_NFT_like_icon}/>
                    <p onClick={()=>likeNFT()}>
                        {
                            like ? (
                                <AiOutlineHeart className={Style.ProductImg_box_NFT_like_icon}/>
                            ) : (
                                <AiFillHeart className={Style.ProductImg_box_NFT_like_icon}/>
                            )
                        }
                        <span>23</span>
                    </p>
                </div>

                <div className={Style.ProductImg_box_NFT_img}>
                    <Image
                    src={product.image}
                    className={Style.ProductImg_box_NFT_img_img}
                    alt=" image"
                    width={500}
                    height={500}
                    />
                </div>
            </div>

            <div 
                className={Style.ProductImg_box_description}
                onClick={() => openDescription()}
            >
                <p>Description</p>
                {
                    description ? <TiArrowSortedUp/> : <TiArrowSortedDown/>
                }
            </div>
            {
                description && (
                    <div className={Style.ProductImg_box_description_box}>
                        <p>
                            {product.description}
                        </p>
                    </div>
                )
            }
            <div className={Style.ProductImg_box_details}
                onClick={() => openDetails()}
            >
                <p>Details</p>
                {
                    details ? <TiArrowSortedUp/> : <TiArrowSortedDown/>
                }
            </div>

            {
                details && (
                    <div className={Style.ProductImg_box_details_box}>
                        <small>2000 x 2000 px.IMAGE(685KB)</small>
                        <p>
                            <small>Contract Address</small>
                            <br></br>
                            {product.seller}
                        </p>
                        <p>
                            <small>Token Id</small>
                            &nbsp;{product.tokenId}
                        </p>
                    </div>
                )
            }
        </div>
    </div>
  )
};

export default ProductImg;