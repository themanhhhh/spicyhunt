"use client";
import React from "react";
import Style from "./FAQ.module.css";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../componentsindex";
import { useTranslation } from "../../hooks/useTranslation";

const FAQ = () => {
  const t = useTranslation();
  const [active, setActive] = React.useState(null);
  const handleClick = (index) => {
    setActive(index === active ? null : index);
  };

  const faqData = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
    { question: t('faq.q7'), answer: t('faq.a7') },
  ];

  return (
    <div className={Style.FAQ}>
      <div className={Style.FAQ_box}>
        <div className={Style.FAQ_box_left}>
          <span className={Style.FAQ_box_left_span}> • {t('faq.title')}</span>
          <h1>{t('faq.heading')} <span className={Style.FAQ_box_left_hightlight}>{t('faq.highlight')}</span></h1>
          <br></br>
          <p>{t('faq.intro')}</p>
          <br></br>
          <div className={Style.FAQ_box_left_btn}>
            
          </div>
        </div>
        <div className={Style.FAQ_box_right}>
          {faqData.map((item, index) => (
            <div key={index} className={Style.FAQ_box_right_box}>
              <div
                className={Style.FAQ_box_right_box_item}
                onClick={() => handleClick(index)}
              >
                <h3 className={Style.FAQ_box_right_box_item_question}>
                  {item.question}
                </h3>
                <span className={Style.FAQ_box_right_box_item_icon}>
                  {active === index ? <CiCircleChevDown size={24}/> : <CiCircleChevUp size={24}/>} 
                </span>
              </div>
              <AnimatePresence>
                {active === index && (
                  <motion.p
                    className={Style.FAQ_box_right_box_item_answer}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
