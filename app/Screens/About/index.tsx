import React, { FC } from 'react'

import { AboutCreator } from './AboutCreator'
import { AboutHeader } from './AboutHeader'
import { AboutProjects } from './AboutProjects'

import './style/about.scss'

const About: FC = () => {
    return (
        <div className='about-page-container'>
            <AboutHeader />
            <AboutCreator />
            <AboutProjects />
        </div>
    )
}

export default About
