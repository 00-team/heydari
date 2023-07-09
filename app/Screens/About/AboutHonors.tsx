import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import './style/aboutHonors.scss'

const honors = [
    { img: require('../../static/home/honors/honor1.png') },
    { img: require('../../static/home/honors/honor2.png') },
    { img: require('../../static/home/honors/honor3.png') },
    { img: require('../../static/home/honors/honor4.png') },
    { img: require('../../static/home/honors/honor5.png') },
]

const AboutHonors: FC = () => {
    const container = useRef<HTMLElement>(null)
    const [Isintersected, setIsintersected] = useState(false)

    useEffect(() => {
        if (container.current && !Isintersected) {
            var observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry && entry.isIntersecting) {
                        setIsintersected && setIsintersected(true)
                        observer.disconnect()
                    }
                },
                {
                    threshold: 0.2,
                }
            )

            observer.observe(container.current)
        }
        return () => {
            if (observer) observer.disconnect()
        }
    }, [container])

    return (
        <section className='about-page-honors' ref={container}>
            <h2 className={`honors-title title_hero ${C(Isintersected)}`}>
                <span>افتخارات</span>
            </h2>
            <HonorsWrapper />
        </section>
    )
}

interface HonorsWrapperProps {}

const HonorsWrapper: FC<HonorsWrapperProps> = () => {
    const returnTransform = (index: number) => {
        var middle = Math.floor((honors.length - 1) / 2)

        if (index === middle) return 0
        if (index - 1 === middle || index + 1 === middle) return 50
        if (index - 2 === middle || index + 2 === middle) return 80
        return 0
    }

    return (
        <div className='honors-wrapper'>
            {honors.map(({ img }, index) => {
                return (
                    <div
                        className='honor-card'
                        key={index}
                        style={{
                            transform: `translateY(${returnTransform(
                                index
                            )}px)`,
                        }}
                    >
                        <img
                            src={img}
                            decoding={'async'}
                            loading={'lazy'}
                            alt=''
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default AboutHonors
