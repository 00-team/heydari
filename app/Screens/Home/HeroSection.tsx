import React from 'react'

import { Typer } from '@00-team/utils'

import { StickyButton } from 'components'

import './style/hero.scss'

const heroImg = require('../../static/chair.png')

const HeroSection = () => {
    return (
        <section className='hero-container'>
            <div className='hero-content'>
                <div className='title_small typer-wrapper'>
                    تولید انواع صندلی های{' '}
                    <Typer MidDelay={2000} words={['اداری', 'لورم', 'منزل']} />{' '}
                    خود را به ما بسپارید.
                </div>
                <span className='hero-anim'>
                    <div className='section_title company'>
                        صنایع تولیدی حیدری
                    </div>
                </span>
                <span className='hero-anim'>
                    <div className='title_smaller detail'>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                        هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت
                    </div>
                </span>

                <div className='cta-wrapper'>
                    <span className='hero-anim'>
                        <StickyButton className='main hero-button'>
                            محصولات
                        </StickyButton>
                    </span>
                    <span className='hero-anim'>
                        <button className='sec hero-button'>
                            ارتباط با ما{' '}
                        </button>
                    </span>
                </div>
            </div>
            <img className='hero-img' src={heroImg} alt='' />
        </section>
    )
}

export default HeroSection
