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
                        ما مفتخریم در طول 40 سال فعالیت تولیدی، همواره کیفیت
                        برتر را جهت فراهم نمودن رضایت مشتریان بعنوان هدف اصلی در
                        نظر گرفته و در عرصه تولید ملی در زمینه صندلی آموزشی و
                        نیمکت انتظار و تجهیزات اداری از پیشتازان بوده ایم.{' '}
                    </div>

                    <div className='cta-wrapper'>
                        <a href='#products'>
                            <StickyButton className='main hero-button title_smaller'>
                                محصولات
                            </StickyButton>
                        </a>
                        <a href='#about' className='sec hero-button'>
                            درباره ما
                        </a>
                    </div>
                </div>
                <img className='hero-img' src={heroImg} alt='' />
            </div>
        </section>
    )
}

export default HeroSection
