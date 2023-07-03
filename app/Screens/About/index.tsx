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
            <section className='about-creator'>
                <aside className='creator-data'>
                    <h2 className='data-title title_hero'>
                        <span>محمدرضا حیدری</span>
                    </h2>
                    <p className='title_small'>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است چاپگرها و متون
                        بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و
                        برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با
                        هدف بهبود ابزارهای کاربردی می باشد
                    </p>
                </aside>
                <aside className='creator-img'>
                    <img
                        src='https://picsum.photos/800/500'
                        loading={'lazy'}
                        decoding={'async'}
                        alt=''
                    />
                </aside>
            </section>
        </div>
    )
}

export default About
