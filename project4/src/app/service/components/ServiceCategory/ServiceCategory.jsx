"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    IoRestaurantOutline, 
    IoCalendarOutline, 
    IoFastFoodOutline,
    IoWineOutline,
    IoBagCheckOutline,
    IoPeopleOutline,
    IoPhonePortraitOutline
} from 'react-icons/io5';
import Style from './ServiceCategory.module.css';

const ServiceCategory = () => {
    const pathname = usePathname();

    const serviceCategories = [
        {
            title: "Dine-In Experience",
            href: "/service/dine-in-experience",
            icon: <IoRestaurantOutline />
        },
        {
            title: "Online Table Reservations",
            href: "/service/online-table-reservations",
            icon: <IoCalendarOutline />
        },
        {
            title: "Home Delivery Service",
            href: "/service/home-delivery-service",
            icon: <IoFastFoodOutline />
        },
        {
            title: "Catering For Events",
            href: "/service/catering-service",
            icon: <IoWineOutline />
        },
        {
            title: "Takeout Orders",
            href: "/service/takeout-orders",
            icon: <IoBagCheckOutline />
        },
        {
            title: "Private Dining",
            href: "/service/private-dining",
            icon: <IoPeopleOutline />
        }
    ];

    return (
        <div className={Style.serviceCategoryContainer}>
            <div className={Style.categoryHeader}>
                <h3>Service Category</h3>
            </div>
            
            <div className={Style.categoryList}>
                {serviceCategories.map((category, index) => (
                    <Link 
                        key={index}
                        href={category.href}
                        className={`${Style.categoryItem} ${pathname === category.href ? Style.active : ''}`}
                    >
                        <div className={Style.categoryIcon}>
                            {category.icon}
                        </div>
                        <span className={Style.categoryTitle}>
                            {category.title}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ServiceCategory; 