import React, { FC } from 'react'

import { Typer } from '@00-team/utils'

import { StickyButton } from 'components'

import './style/hero.scss'

const heroImg = require('../../static/chair.png')

const HeroSection: FC = () => {
    return (
        <section className='hero-container'>
            <div className='hero-wrapper'>
                <div className='hero-content'>
                    <div className='title_small typer-wrapper'>
                        تولید انواع صندلی های{' '}
                        <span className='title'>
                            <Typer
                                MidDelay={2000}
                                words={[
                                    'خانگی',
                                    'اداری',
                                    'ویلایی',
                                    'آموزشی',
                                    'استادیومی',
                                ]}
                            />{' '}
                        </span>
                        خود را به ما بسپارید.
                    </div>
                    <div className='title_hero company'>
                        صنایع تولیدی{' '}
                        <span className='section_title'>حیدری</span>
                    </div>
                    <div className='title_smaller detail'>
                        لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت
                        چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون
                        هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت
                    </div>

                    <div className='cta-wrapper'>
                        <StickyButton className='main hero-button'>
                            محصولات
                        </StickyButton>
                        <button className='sec hero-button'>
                            ارتباط با ما{' '}
                        </button>
                    </div>
                </div>
                <img className='hero-img' src={heroImg} alt='' />
            </div>
        </section>
    )
}

export default HeroSection
