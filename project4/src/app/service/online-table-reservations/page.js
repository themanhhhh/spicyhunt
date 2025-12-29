"use client";
import React from 'react';
import Link from 'next/link';
import { IoCheckmarkCircleOutline, IoHomeOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Style from './online-table-reservations.module.css';
import { Footer, Reserve } from '../../components/componentsindex';
import ServiceCategory from '../components/ServiceCategory/ServiceCategory';
import ServiceContact from '../components/ServiceContact/ServiceContact';
import ServiceFAQ from '../components/ServiceFAQ/ServiceFAQ';
import Banner from '../components/Banner/Banner';
import Image from 'next/image';

import images from '../../img/index';

const OnlineTableReservations = () => {
    const keyFeatures = [
        "Authentic flavors meet innovative recipe, crafted with care.",
        "Exceptional service in a warm and welcoming ambiance.", 
        "Fresh ingredients delivering quality and taste in every bite.",
        "Where tradition blends with modern culinary excellence."
    ];

    return (
        <div>
            <Banner title="ONLINE TABLE RESERVATIONS" />
            
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
                            <span className={Style.breadcrumbCurrent}>Online Table Reservations</span>
                        </div>

                        {/* Page Title */}
                        <div className={Style.pageHeader}>
                            <h1 className={Style.pageTitle}>ONLINE TABLE RESERVATIONS</h1>
                        </div>

                        {/* Service Image */}
                        <div className={Style.serviceImage}>
                            <Image
                                src={images.serviceonline}
                                alt="Online Table Reservations"
                                width={700}
                                height={300}
                                className={Style.serviceImg}
                            />
                        </div>

                        {/* Service Description */}
                        <div className={Style.serviceDescription}>
                            <p className={Style.descriptionText}>
                                At SpicyHunt, our dine-in experience is designed to offer you the perfect blend of comfort, ambiance, and culinary delight. Enjoy our thoughtfully crafted interiors, warm hospitality, and a menu filled with flavorful dishes made from the freshest ingredients. Whether it's a family gathering, a date night, or a casual meal, we strive to make every visit memorable.
                            </p>
                            
                            <p className={Style.descriptionText}>
                                Step into SpicyHunt and immerse yourself in a welcoming ambiance that combines elegance and comfort. Our dine-in experience is curated to delight all your senses, from the inviting decor to the aroma of freshly prepared dishes. Whether you're celebrating a special occasion, catching up with friends, or simply enjoying a meal out, our attentive staff and thoughtfully crafted menu ensure every moment is special. Savor a wide range of dishes made with the finest ingredients, all served with a touch of warmth and care. At SpicyHunt, dining is more than just a meal—it's an experience to remember.
                            </p>
                        </div>

                        {/* Key Features Section */}
                        <div className={Style.keyFeaturesSection}>
                            <h2 className={Style.sectionTitle}>KEY FEATURES OF SPICYHUNT</h2>
                            
                            <div className={Style.featuresIntro}>
                                <p>
                                    Discover what makes SpicyHunt stand out! From our carefully crafted dishes bursting with flavor to our warm and inviting atmosphere, every detail is designed to offer you an exceptional dining experience. With a focus on quality ingredients, prompt service, and customer satisfaction, we take pride in delivering the perfect blend of tradition and innovation. Explore the key features that set us apart and make SpicyHunt your go-to destination for great food and unforgettable moments.
                                </p>
                                
                                <p>
                                    SpicyHunt is all about exceptional flavors, warm hospitality, and a dining experience like no other. From our diverse menu crafted with the freshest ingredients to our cozy and vibrant atmosphere, we focus on creating memorable moments for every guest. With attention to detail, prompt service, and a passion for quality, we're proud to be your ultimate destination for delicious food and great company.
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

export default OnlineTableReservations; 