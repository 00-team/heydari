import React, { FC } from 'react'

import { AboutCreator } from './AboutCreator'
import { AboutHeader } from './AboutHeader'
import AboutHonors from './AboutHonors'
import { AboutProjects } from './AboutProjects'

import './style/about.scss'

const About: FC = () => {
    return (
        <div className='about-page-container'>
            <AboutHeader />
            <AboutCreator />
            <AboutProjects />
            <AboutHonors />
        </div>
    )
}

export default About
