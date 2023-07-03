import React, { FC } from 'react'

import './style/about.scss'

const headerImg = require('../../static/about/header.jpg')

const About: FC = () => {
    return (
        <div className='about-container'>
            <header
                className='about-header'
                style={{
                    backgroundImage: `
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url(${headerImg})`,
                }}
            >
                <div className='header-title title_hero'>
                    درباره <span>حیدری</span>
                </div>
            </header>
        </div>
    )
}

export default About
