import React from 'react'

import HeroSection from './HeroSection'
import Welcomer from './Welcome'

import './style/home.scss'

const Home = () => {
    return (
        <main className='home'>
            <HeroSection />
            <Welcomer />
        </main>
    )
}

export default Home
