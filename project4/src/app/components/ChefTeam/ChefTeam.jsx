"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Style from './ChefTeam.module.css';
import images from '../../img/index';

const ChefTeam = () => {
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
        }
    ];

    return (
        <div className={Style.chefTeamContainer}>
            <div className={Style.header}>
                <div className={Style.quality}>
                    <span className={Style.dot}></span>
                    ALWAYS QUALITY
                </div>
                <h2 className={Style.title}>
                    THE TALENTED MINDS BEHIND <br />
                    EVERY <span className={Style.highlight}>FLAVOURFUL DISH</span>
                </h2>
            </div>

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

            <div className={Style.meetTeamSection}>
                <p className={Style.meetTeamText}>
                    Meet the passionate team behind every flavour and experience 
                    <Link href="/team" className={Style.meetTeamLink}>
                        Meet Our Team
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ChefTeam; 