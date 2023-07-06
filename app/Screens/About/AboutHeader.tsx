import React, { FC } from 'react'

const headerImg = require('../../static/about/header.jpg')

export const AboutHeader: FC = () => {
    return (
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
    )
}
