import React from "react";
import Link from "next/link";
//INTERNAL IMPORT

import Style from "./Discover.module.css";

const Discover = ({setDiscover}) => {

  //------Discover navigation menu
  const discover = [
    {
      name : "Collection",
      link : "collection",
    },
    {
      name : "Search",
      link : "searchPage",
    },
    {
      name : "Author Profile",
      link : "author",
    },
    {
      name : "NFT Details",
      link : "NFT-details",
    },
    {
      name : "Account Setting",
      link : "account",
    },
    {
      name : "Upload NFT",
      link : "upload-nft",
    },
    {
      name : "Connect wallet",
      link : "connectWallet",
    },
    {
      name : "Blog",
      link : "blog",
    },
  ]
  return   (
  <div>
    {discover.map((el,i)=>(
      <div key={i+1} className={Style.discover}>
        <Link 
          href={{pathname:`${el.link}`}}
          onClick={() => setDiscover(false)}
        >
        {el.name}
        </Link>
      </div>
    ))}
  </div>
  )
};

export default Discover;