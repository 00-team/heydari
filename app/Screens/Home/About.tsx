import React, { FC, useEffect, useState } from 'react'

import './style/about.scss'

const about_img1 = require('../../static/about/about.jpg')
const about_img2 = require('../../static/about/about2.jpg')
const about_img3 = require('../../static/about/about3.jpg')
const about_img4 = require('../../static/about/about4.jpg')
const about_img5 = require('../../static/about/about5.jpg')

const ABOUT_CONTENTS = [
    {
        content: {
            title: 'اصالت ما',
            description:
                'نده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها',
        },
        img: about_img1,
    },
    {
        content: {
            title: 'تاریخچه ما ',
            description:
                'نده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها',
        },
        img: about_img2,
    },
    {
        content: {
            title: 'اعتماد به ما',
            description:
                'نده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها',
        },
        img: about_img3,
    },
    {
        content: {
            title: 'لورم ایپسوم ',
            description:
                'نده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها',
        },
        img: about_img4,
    },
    {
        content: {
            title: 'لورم ایپسوم ',
            description:
                'نده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها',
        },
        img: about_img5,
    },
]

const About: FC = () => {
    const [ActiveAbout, setActiveAbout] = useState(1)

    useEffect(() => {
        const inverval = setInterval(() => {
            setActiveAbout(value => {
                if (value + 2 > ABOUT_CONTENTS.length) {
                    return 1
                }
                return value + 1
            })
        }, 7500)

        return () => clearInterval(inverval)
    }, [])

    return (
        <section id='about' className='about-container'>
            <h2 className='section_title about-header'>
                <span>درباره ما</span>
            </h2>
            <div className='about-wrapper'>
                <div className='about-content-wrapper'>
                    {ABOUT_CONTENTS.map(({ content }, idx0) => {
                        const returnClass = (): string => {
                            if (ActiveAbout === idx0) return 'active'
                            if (ActiveAbout - 1 === idx0) return 'prev'
                            if (ActiveAbout + 1 === idx0) return 'next'
                            if (
                                ActiveAbout === ABOUT_CONTENTS.length - 1 &&
                                idx0 === 0
                            )
                                return 'next'
                            return ''
                        }
                        return (
                            <div
                                key={idx0}
                                className={`about-content ${returnClass()}`}
                            >
                                <div className='content-title section_title'>
                                    {content.title}
                                </div>
                                <div className='content-descrption title_small'>
                                    {content.description}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className='about-img-wrapper'>
                    {ABOUT_CONTENTS.map(({ img }, idx0) => {
                        const returnClass = (): string => {
                            if (ActiveAbout === idx0) return 'active'
                            if (ActiveAbout - 1 === idx0) return 'prev'
                            if (ActiveAbout + 1 === idx0) return 'next'
                            if (
                                ActiveAbout === ABOUT_CONTENTS.length - 1 &&
                                idx0 === 0
                            )
                                return 'next'
                            return ''
                        }

                        return (
                            <div
                                key={idx0}
                                className={`about-slider ${returnClass()}`}
                            >
                                <img
                                    loading='lazy'
                                    draggable={'false'}
                                    src={img}
                                    alt=''
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default About
