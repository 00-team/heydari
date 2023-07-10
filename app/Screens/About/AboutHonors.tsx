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
    const container = useRef<HTMLDivElement>(null)
    const [containerY, setcontainerY] = useState(0)

    const returnTransform = (index: number) => {
        var middle = Math.floor((honors.length - 1) / 2)

        if (index === middle) return 0
        if (index - 1 === middle || index + 1 === middle) return 50
        if (index - 2 === middle || index + 2 === middle) return 80
        return 0
    }

    useEffect(() => {
        document.addEventListener('scroll', () => {
            if (!container.current || !container.current.offsetTop) return

            if (container.current.offsetTop - scrollY <= 1200) {
                console.log(container.current.offsetTop - scrollY - 550 <= 0)
                if (container.current.offsetTop - scrollY - 550 <= 0)
                    return setcontainerY(0)

                return setcontainerY(
                    container.current.offsetTop - scrollY - 550
                )
            }
        })
    }, [container.current])

    return (
        <div
            className='honors-wrapper'
            ref={container}
            style={{ transform: `translateY(${containerY}px)` }}
        >
            {honors.map(({ img }, index) => {
                return (
                    <div
                        className='honor-card'
                        key={index}
                        style={{
                            transform: `translateY(${
                                containerY === 0 ? 0 : returnTransform(index)
                            }px)`,
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
