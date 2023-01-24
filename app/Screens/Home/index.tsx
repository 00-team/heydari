import React, { FC } from 'react'

import About from './About'
import HeroSection from './HeroSection'
import Honors from './Honors'
import Welcomer from './Welcome'

import './style/home.scss'

const Home: FC = () => {
    return (
        <main className='home'>
            <Welcomer />

            <HeroSection />
            <About />
            <Honors />
        </main>
    )
}

export default Home
