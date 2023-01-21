import React from 'react'

import './style/hero.scss'

const heroImg = require('../../static/chair.png')

const HeroSection = () => {
    return (
        <section className='hero-container'>
            <img className='hero-img' src={heroImg} alt='' />
            <div className='hero-content'></div>
        </section>
    )
}

export default HeroSection
