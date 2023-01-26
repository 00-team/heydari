import React, { FC, useEffect, useState } from 'react'

import './style/about.scss'

const ABOUT_CONTENTS = [
    {
        content: {
            title: 'title 1',
            description:
                'صنایع تولیدی حیدری در سال 1357 با هدف تولید مصنوعات پلاستیکی تاسیس گردید و در سال 1364 مجوز فعالیت خود را از اداره کل صنایع استان تهران دریافت نمود',
        },
        img: 'https://picsum.photos/1023/960',
    },
    {
        content: {
            title: 'لورم ایپ',
            description:
                'در سال 1374 با گسترش فعالیتهای تولیدی خود اقدام به تولید و عرضه انواع صندلی ،  نیمکت ، میز و تجهیزات آموزشی و اداری نمود',
        },
        img: 'https://picsum.photos/1025/960',
    },
    {
        content: {
            title: 'لبویسش پ',
            description:
                'در سال 1380 صنایع تولیدی حیدری مجوز تولید محصولات خود را از وزارت صنایع اخذ نمود',
        },
        img: 'https://picsum.photos/1021/960',
    },
    {
        content: {
            title: 'لبیکیسش پیسشیص',
            description:
                ' ما مفتخریم در طول 40 سال فعالیت تولیدی، همواره کیفیت برتر را جهت فراهم نمودن رضایت مشتریان بعنوان هدف اصلی در نظر گرفته و در عرصه تولید ملی در زمینه صندلی آموزشی و نیمکت انتظار و تجهیزات اداری از پیشتازان بوده ایم.',
        },
        img: 'https://picsum.photos/1023/960',
    },
    {
        content: {
            title: 'لبیو بلی یسث',
            description:
                'هدف تولید مصنوعات پلاستیکی تاسیس گردید و در سال 1364 مجوز فعالیت خود را از اداره کل صنایع استان تهران دریافت نمود و در سال 1374 با گسترش فعالیتهای تولیدی خود اقدام به تولید و عرضه انواع صندلی ،  نیمکت ، میز و تجهیزات آموزشی و اداری نمود؛ در سال 1380 ص',
        },
        img: 'https://picsum.photos/1022/960',
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
        }, 75000)

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
                                <div className='content-title title'>
                                    {content.title + '' + idx0}
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
