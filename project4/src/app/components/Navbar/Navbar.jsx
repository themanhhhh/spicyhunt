"use client";
import React, {useState, useEffect, useContext} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
//import icon
import {MdNotifications} from "react-icons/md";
import {BsSearch} from "react-icons/bs";
import {CgMenuLeft,CgMenuRight} from "react-icons/cg";
import {DiJqueryLogo} from "react-icons/di";
import { FaAngleDown } from "react-icons/fa6";
import { MdPerson } from "react-icons/md";

// Internal import
import Style from "./Navbar.module.css";
import {Discover,HelpCenter,Profile,SideBar} from "./index"
import {Button,Error} from "../componentsindex";
import images from "../../img";
import CartIcon from "./CartIcon/CartIcon";
import { useAuth } from "../../context/AuthContext";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import { useTranslation } from "../../hooks/useTranslation";

// Import from smart contract

const Navbar = () => {
    //Use state components
    const [discover , setDiscover] = useState(false);
    const [help , setHelp] = useState(false);
    const [notification , setNotification] = useState(false);
    const [profile , setProfile] = useState(false);
    const [openSideMenu , setOpenSideMenu] = useState(false);
    const { user, profile: userProfile, logout } = useAuth();
    const router = useRouter();
    const t = useTranslation();


    const openSideBar = () => {
        if(!openSideMenu){
            setOpenSideMenu(true);
        } else {
            setOpenSideMenu(false);
        }
    };

    const openProfile = () => {
        if(!profile){
            setDiscover(false);
            setHelp(false);
            setProfile(true);
        }
        else{
            setProfile(false);
        }
    };

    const handleLoginClick = () => {
        router.push('/login');
    };

    const handleBookTableClick = (e) => {
        e.preventDefault();
        const reserveSection = document.getElementById('reserve');
        if (reserveSection) {
            reserveSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return  (
        <div className={Style.navbar}>
            <div className={Style.navbar_container}>
                <div className={Style.navbar_container_left}>
                    <div className={Style.logo}>
                        <Image src={images.logo} alt="footer logo" height={150} width={150} />
                    </div>
                </div>
                <div className={Style.navbar_container_center}>
                    <div className={Style.navbar_container_right_discover}>
                        <Link href="/">
                            <p>{t('nav.home')}</p>
                        </Link>
                    </div>
                    <div className={Style.navbar_container_right_menu}>          
                        <Link href="/menu">
                            <p>{t('nav.menu')}</p>
                        </Link>
                    </div>
                    <div className={Style.navbar_container_right_discover}>
                        <Link href="/aboutus">
                            <p>{t('nav.about')}</p>
                        </Link>
                    </div>
                    <div className={Style.navbar_container_right_services}>
                        <Link href="/service">
                            <p>{t('nav.services')}</p>
                        </Link>
                    </div>
                    <div className={Style.navbar_container_right_button}>
                        <Button btnName={t('nav.bookTable')} onClick={handleBookTableClick}/>
                    </div>
                    <div className={Style.navbar_container_right_cart} style={{zIndex: 10000000}}>
                        <CartIcon />
                    </div>
                    <div className={Style.navbar_container_right_language}>
                        <LanguageSelector />
                    </div>
                </div>
                <div className={Style.navbar_container_right}>
                    {user ? (
                        <div className={Style.navbar_container_right_profile_box} style={{zIndex: 10000000}}>
                            <div className={Style.navbar_container_right_profile}>
                                {userProfile?.imgUrl && userProfile.imgUrl !== 'admin' ? (
                                    <img 
                                        src={userProfile.imgUrl} 
                                        alt="Profile" 
                                        width={40} 
                                        height={40}
                                        onClick={() => openProfile()}
                                        className={Style.navbar_container_right_profile}
                                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div 
                                        onClick={() => openProfile()}
                                        className={Style.navbar_container_right_profile}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <MdPerson size={24} color="#666" />
                                    </div>
                                )}
                                {profile && <Profile />}
                            </div>
                        </div>
                    ) : (
                        <div className={Style.navbar_container_right_login}>
                            <Button btnName={t('nav.login')} onClick={handleLoginClick} />
                        </div>
                    )}
                </div>
            </div>
            {/*Side bar component*/}
            {
                openSideMenu && (
                    <div className={Style.sideBar}>
                        <SideBar 
                            setOpenSideMenu ={setOpenSideMenu} 
                        />
                    </div>
                )
            }
        </div>
    )
};

export default Navbar;