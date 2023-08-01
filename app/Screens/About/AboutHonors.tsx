import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import './style/aboutHonors.scss'

const honors = [
    { img: '/static/image/home/honors/honor1.webp' },
    { img: '/static/image/home/honors/honor2.webp' },
    { img: '/static/image/home/honors/honor3.webp' },
    { img: '/static/image/home/honors/honor4.webp' },
    { img: '/static/image/home/honors/honor5.webp' },
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

    const returnTransformPc = (index: number) => {
        var middle = Math.floor((honors.length - 1) / 2)

        if (index === middle) return 0
        if (index - 1 === middle || index + 1 === middle) return 50
        if (index - 2 === middle || index + 2 === middle) return 100
        return 0
    }

    const returnTransformMobile = (index: number) => {
        return index * 100
    }

    useEffect(() => {
        const spaceFromAbove = innerWidth <= 768 ? 400 : 500

        document.addEventListener('scroll', () => {
            if (!container.current || !container.current.offsetTop) return

            if (container.current.offsetTop - scrollY <= 1200) {
                if (container.current.offsetTop - scrollY - spaceFromAbove <= 0)
                    return setcontainerY(0)

                return setcontainerY(
                    container.current.offsetTop - scrollY - spaceFromAbove
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
                                containerY === 0
                                    ? 0
                                    : innerWidth <= 768
                                    ? returnTransformMobile(index)
                                    : returnTransformPc(index)
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
