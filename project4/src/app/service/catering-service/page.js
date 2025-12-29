"use client";
import React from 'react';
import Link from 'next/link';
import { IoCheckmarkCircleOutline, IoHomeOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Style from './catering-service.module.css';
import { Footer, Reserve } from '../../components/componentsindex';
import ServiceCategory from '../components/ServiceCategory/ServiceCategory';
import ServiceContact from '../components/ServiceContact/ServiceContact';
import ServiceFAQ from '../components/ServiceFAQ/ServiceFAQ';
import Banner from '../components/Banner/Banner';
import Image from 'next/image';

import images from '../../img/index';

const CateringService = () => {
    const keyFeatures = [
        "Elegant ambiance with carefully curated interior design and lighting.",
        "Personalized service with attention to every detail of your dining experience.", 
        "Seasonal menu featuring fresh, locally-sourced premium ingredients.",
        "Private dining options for special occasions and intimate gatherings."
    ];

    return (
        <div>
            <Banner title="DINE-IN EXPERIENCE" />
            
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
                            <span className={Style.breadcrumbCurrent}>Dine-In Experience</span>
                        </div>

                        {/* Page Title */}
                        <div className={Style.pageHeader}>
                            <h1 className={Style.pageTitle}>CATERING SERVICE</h1>
                        </div>

                        {/* Service Image */}
                        <div className={Style.serviceImage}>
                            <Image
                                src={images.servicedine}
                                alt="Dine-In Experience"
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
                            <h2 className={Style.sectionTitle}>KEY FEATURES OF OUR DINE-IN EXPERIENCE</h2>
                            
                            <div className={Style.featuresIntro}>
                                <p>
                                    Experience dining like never before at SpicyHunt! Our dine-in experience combines exceptional cuisine with an inviting atmosphere, creating the perfect setting for any occasion. From romantic dinners to family celebrations, our restaurant offers a sophisticated yet comfortable environment where every detail is carefully considered. Our skilled chefs prepare each dish with passion and precision, using only the finest ingredients to deliver flavors that will leave you craving for more.
                                </p>
                                
                                <p>
                                    What sets our dine-in experience apart is our commitment to providing not just great food, but an unforgettable culinary journey. Our restaurant features elegant décor, comfortable seating, and ambient lighting that creates the perfect mood for your dining experience. Whether you're here for a business lunch, a romantic evening, or a celebration with friends and family, our attentive staff ensures that every aspect of your visit exceeds your expectations.
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

export default CateringService;