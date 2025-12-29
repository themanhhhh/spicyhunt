"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    IoRestaurantOutline, 
    IoCalendarOutline, 
    IoFastFoodOutline,
    IoWineOutline,
    IoBagCheckOutline,
    IoPeopleOutline
} from 'react-icons/io5';
import Style from './service.module.css';
import { Footer, Navbar, Reserve, ChefTeam, Loader } from '../components/componentsindex';
import Banner from './components/Banner/Banner';

const Service = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time for page initialization
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // 1 second loading

        return () => clearTimeout(timer);
    }, []);

    if (loading) return <Loader />;

    return (
        <div>
            <Banner title=" Our Services"/>
            <div className={Style.serviceContainer}>
                <div className={Style.serviceGrid}>
                    {/* Dine-In Experience Card */}
                    <div className={Style.serviceCard}>
                        <div className={Style.serviceIcon}>
                            <IoRestaurantOutline />
                        </div>
                        <h2 className={Style.serviceCardTitle}>Dine-In Experience</h2>
                        <p className={Style.serviceCardDescription}>
                            Enjoy a cozy and vibrant ambiance with impeccable service and delicious meals crafted to perfection.
                        </p>
                        <Link href="/service/dine-in-experience" className={Style.readMoreBtn}>
                            Read More →
                        </Link>
                    </div>

                    {/* Online Reservations Card */}
                    <div className={Style.serviceCard}>
                        <div className={Style.serviceIcon}>
                            <IoCalendarOutline />
                        </div>
                        <h2 className={Style.serviceCardTitle}>Online Table Reservations</h2>
                        <p className={Style.serviceCardDescription}>
                            Reserve your table effortlessly through our online booking system for a seamless dining experience.
                        </p>
                        <Link href="/service/online-table-reservations" className={Style.readMoreBtn}>
                            Read More →
                        </Link>
                    </div>

                    {/* Home Delivery Card */}
                    <div className={Style.serviceCard}>
                        <div className={Style.serviceIcon}>
                            <IoFastFoodOutline />
                        </div>
                        <h2 className={Style.serviceCardTitle}>Home Delivery Service</h2>
                        <p className={Style.serviceCardDescription}>
                            Savor your favorite dishes in the comfort of your home with our reliable and quick delivery service.
                        </p>
                        <Link href="/service/home-delivery-service" className={Style.readMoreBtn}>
                            Read More →
                        </Link>
                    </div>

                    {/* Catering Service Card */}
                    <div className={Style.serviceCard}>
                        <div className={Style.serviceIcon}>
                            <IoWineOutline />
                        </div>
                        <h2 className={Style.serviceCardTitle}>Catering for Events</h2>
                        <p className={Style.serviceCardDescription}>
                            From small gatherings to grand celebrations, let us bring our culinary excellence to your special event.
                        </p>
                        <Link href="/service/catering-service" className={Style.readMoreBtn}>
                            Read More →
                        </Link>
                    </div>

                    {/* Takeout Orders Card */}
                    <div className={Style.serviceCard}>
                        <div className={Style.serviceIcon}>
                            <IoBagCheckOutline />
                        </div>
                        <h2 className={Style.serviceCardTitle}>Takeout Orders</h2>
                        <p className={Style.serviceCardDescription}>
                            Convenient and fast takeout options for when you're on the go but still craving our flavors.
                        </p>
                        <Link href="/service/takeout-orders" className={Style.readMoreBtn}>
                            Read More →
                        </Link>
                    </div>

                    {/* Private Dining Card */}
                    <div className={Style.serviceCard}>
                        <div className={Style.serviceIcon}>
                            <IoPeopleOutline />
                        </div>
                        <h2 className={Style.serviceCardTitle}>Private Dining</h2>
                        <p className={Style.serviceCardDescription}>
                            Host intimate gatherings or private events in our dedicated dining space tailored to your need.
                        </p>
                        <Link href="/service/private-dining" className={Style.readMoreBtn}>
                            Read More →
                        </Link>
                    </div>
                </div>
            </div>
            <ChefTeam/>
            <div id="reserve">
                <Reserve/>
            </div>
            <Footer />
        </div>
    );
};

export default Service;