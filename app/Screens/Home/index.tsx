import React, { FC, useEffect } from 'react'

import About from './About'
import HeroSection from './HeroSection'
import Honors from './Honors'
import Products from './Products'
import Welcomer from './Welcome'

import './style/home.scss'

const Home: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <main className='home'>
            <Welcomer />

            <HeroSection />
            <About />
            <Honors />
            <Products />
        </main>
    )
}

export default Home
