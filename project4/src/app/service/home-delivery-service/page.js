"use client";
import React from 'react';
import Link from 'next/link';
import { IoCheckmarkCircleOutline, IoHomeOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Style from './home-delivery-service.module.css';
import { Footer, Reserve } from '../../components/componentsindex';
import ServiceCategory from '../components/ServiceCategory/ServiceCategory';
import ServiceContact from '../components/ServiceContact/ServiceContact';
import ServiceFAQ from '../components/ServiceFAQ/ServiceFAQ';
import Banner from '../components/Banner/Banner';
import Image from 'next/image';

import images from '../../img/index';

const HomeDeliveryService = () => {
    const keyFeatures = [
        "Fast and reliable delivery service with real-time tracking system.",
        "Temperature-controlled packaging to maintain food quality and freshness.", 
        "Flexible delivery options including scheduled and express delivery.",
        "Contactless delivery service ensuring safety and convenience."
    ];

    return (
        <div>
            <Banner title="HOME DELIVERY SERVICE" />
            
            <div className={Style.pageContainer}>
                <div className={Style.pageLayout}>
                    {/* Sidebar with Service Category */}
                    <div className={Style.sidebar}>
                        <ServiceCategory />
                        <ServiceContact />
                    </div>

                    {/* Main Content Area */}
                    <div className={Style.mainContent}>
                        {/* Breadcrumb Navigation */}
                        <div className={Style.breadcrumb}>
                            <Link href="/" className={Style.breadcrumbItem}>
                                <IoHomeOutline />
                                <span>Home</span>
                            </Link>
                            <IoChevronForwardOutline className={Style.breadcrumbSeparator} />
                            <Link href="/service" className={Style.breadcrumbItem}>
                                <span>Services</span>
                            </Link>
                            <IoChevronForwardOutline className={Style.breadcrumbSeparator} />
                            <span className={Style.breadcrumbCurrent}>Home Delivery Service</span>
                        </div>

                        {/* Page Title */}
                        <div className={Style.pageHeader}>
                            <h1 className={Style.pageTitle}>HOME DELIVERY SERVICE</h1>
                        </div>

                        {/* Service Image */}
                        <div className={Style.serviceImage}>
                            <Image
                                src={images.servicedelivery}
                                alt="Home Delivery Service"
                                width={700}
                                height={300}
                                className={Style.serviceImg}
                            />
                        </div>

                        {/* Service Description */}
                        <div className={Style.serviceDescription}>
                            <p className={Style.descriptionText}>
                                Enjoy SpicyHunt's delicious cuisine from the comfort of your home with our reliable home delivery service. We ensure that every dish reaches you fresh, hot, and perfectly packaged. Our efficient delivery system covers a wide area, making it convenient for you to satisfy your cravings without leaving your home. Whether it's a family meal, office lunch, or late-night snack, we've got you covered.
                            </p>
                            
                            <p className={Style.descriptionText}>
                                Our home delivery service is designed with your convenience in mind. With easy online ordering, real-time tracking, and prompt delivery, we make sure your dining experience is seamless from start to finish. Our dedicated delivery team is trained to handle your orders with care, ensuring that every meal arrives in perfect condition. Experience the same quality and taste of SpicyHunt's restaurant dining, delivered right to your doorstep.
                            </p>
                        </div>

                        {/* Key Features Section */}
                        <div className={Style.keyFeaturesSection}>
                            <h2 className={Style.sectionTitle}>KEY FEATURES OF OUR HOME DELIVERY SERVICE</h2>
                            
                            <div className={Style.featuresIntro}>
                                <p>
                                    At SpicyHunt, we understand that sometimes you want to enjoy restaurant-quality food from the comfort of your home. That's why we've developed a comprehensive home delivery service that brings our full menu directly to your doorstep. Our delivery service combines speed, reliability, and food safety to ensure that every meal arrives just as fresh and delicious as it would be in our restaurant.
                                </p>
                                
                                <p>
                                    We use state-of-the-art packaging technology and temperature-controlled delivery bags to maintain the quality of your food throughout the journey. Our delivery team is trained to handle orders with care, and we offer flexible delivery options to fit your schedule. Whether you're ordering for a quick lunch, family dinner, or special occasion, our home delivery service ensures that you can enjoy SpicyHunt's exceptional cuisine wherever you are.
                                </p>
                            </div>

                            <div className={Style.featuresList}>
                                {keyFeatures.map((feature, index) => (
                                    <div key={index} className={Style.featureItem}>
                                        <IoCheckmarkCircleOutline className={Style.featureIcon} />
                                        <span className={Style.featureText}>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className={Style.faqSection}>
                            <ServiceFAQ />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reserve Table Section */}
            <Reserve />
            
            <Footer />
        </div>
    );
};

export default HomeDeliveryService;