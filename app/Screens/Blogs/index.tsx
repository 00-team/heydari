import React, { FC } from 'react'

import './style/blogs.scss'

const headerImg = require('../../static/blogs/header.jpg')

const Blogs: FC = () => {
    return (
        <main className='blogs-container'>
            <header
                className='products-header'
                style={{
                    backgroundImage: `
linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
url(${headerImg})`,
                }}
            >
                <h2 className='header-title title_hero'>مقالات</h2>
            </header>
            <div className='blogs-wrapper'></div>
        </main>
    )
}

export default Blogs
