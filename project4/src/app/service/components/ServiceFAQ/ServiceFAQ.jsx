"use client";
import React, { useState } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';
import Style from './ServiceFAQ.module.css';
import { useTranslation } from '../../../hooks/useTranslation';

const ServiceFAQ = () => {
    const t = useTranslation();
    const [activeIndex, setActiveIndex] = useState(null);

    const faqData = [
        {
            question: t('faq.q1'),
            answer: t('faq.a1')
        },
        {
            question: t('faq.q2'),
            answer: t('faq.a2')
        },
        {
            question: t('faq.q3'),
            answer: t('faq.a3')
        },
        {
            question: t('faq.q4'),
            answer: t('faq.a4')
        },
        {
            question: t('faq.q5'),
            answer: t('faq.a5')
        },
        {
            question: t('faq.q6'),
            answer: t('faq.a6')
        },
        {
            question: t('faq.q7'),
            answer: t('faq.a7')
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={Style.faqContainer}>
            <div className={Style.faqHeader}>
                <h2 className={Style.faqTitle}>
                    <span className={Style.highlight}>GOT QUESTIONS?</span>{' '}
                    <span className={Style.normalText}>WE'VE</span>{' '}
                    <span className={Style.highlight}>GOT ANSWERS!</span>
                </h2>
                <p className={Style.faqSubtitle}>
                    Whether you're curious about our services, menu, or booking process, we've got you covered. 
                    If you don't find what you're looking for, our team is always ready to assist you.
                </p>
            </div>

            <div className={Style.faqList}>
                {faqData.map((faq, index) => (
                    <div 
                        key={index} 
                        className={`${Style.faqItem} ${activeIndex === index ? Style.active : ''}`}
                    >
                        <div 
                            className={Style.faqQuestion}
                            onClick={() => toggleFAQ(index)}
                        >
                            <h3>{faq.question}</h3>
                            <div className={Style.faqIcon}>
                                {activeIndex === index ? 
                                    <IoChevronUpOutline /> : 
                                    <IoChevronDownOutline />
                                }
                            </div>
                        </div>
                        
                        <div className={`${Style.faqAnswer} ${activeIndex === index ? Style.show : ''}`}>
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>

           
        </div>
    );
};

export default ServiceFAQ; 