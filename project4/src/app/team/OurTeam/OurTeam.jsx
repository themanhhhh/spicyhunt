"use client";
import React from 'react';
import Image from 'next/image';
import Style from './OurTeam.module.css';
import images from '../../img/index';
import Link from "next/link";

const OurTeam = () => {
    const chefTeam = [
        {
            id: 1,
            image: images.team1,
            name: "Sophia Martinez",
            position: "Executive Chef"
        },
        {
            id: 2,
            image: images.team2,
            name: "Liam Patel",
            position: "Sous Chef"
        },
        {
            id: 3,
            image: images.team3,
            name: "Isabella Carter",
            position: "Pastry Chef"
        },
        {
            id: 4,
            image: images.team4,
            name: "Ethan Johnson",
            position: "Restaurant Manager"
        },
        {
            id: 5,
            image: images.team5,
            name: "Oliver Bennett",
            position: "Executive Chef"
        },
        {
            id: 6,
            image: images.team6,
            name: "James Anderson",
            position: "Operations Manager"
        },
        {
            id: 7,
            image: images.team7,
            name: "Ava Martinez",
            position: "Culinary Artist"
        },
        {
            id: 8,
            image: images.team8,
            name: "Liam Robinson",
            position: "Marketing Strategist"
        },
    ];

    return (
        <div className={Style.ourTeamContainer}>


            <div className={Style.chefGrid}>
                {chefTeam.map((chef) => (
                    <div key={chef.id} className={Style.chefCard}>
                        <div className={Style.imageContainer}>
                            <Image
                                src={chef.image}
                                alt={chef.name}
                                width={500}
                                height={600}
                                className={Style.chefImage}
                            />
                        </div>
                        <div className={Style.chefInfo}>
                            <h3 className={Style.chefName}>{chef.name}</h3>
                            <p className={Style.chefPosition}>{chef.position}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OurTeam;
