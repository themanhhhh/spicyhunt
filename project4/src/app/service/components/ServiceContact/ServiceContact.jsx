"use client";
import React from 'react';
import { IoPhonePortraitOutline, IoHelpCircleOutline } from 'react-icons/io5';
import Style from './ServiceContact.module.css';

const ServiceContact = () => {
    return (
        <div className={Style.contactContainer}>
            <div className={Style.contactIcon}>
                <IoHelpCircleOutline />
            </div>
            
            <div className={Style.contactContent}>
                <h4 className={Style.contactTitle}>You have different questions?</h4>
                <p className={Style.contactDescription}>
                    Our team will answer all your questions. we ensure a quick response.
                </p>
            </div>
            
            <div className={Style.phoneButton}>
                <IoPhonePortraitOutline className={Style.phoneIcon} />
                <span>+84 368 926 258</span>
            </div>
        </div>
    );
};

export default ServiceContact; 