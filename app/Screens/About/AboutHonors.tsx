import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import './style/aboutHonors.scss'

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
    return (
        <div className='honors-wrapper'>
            <div className='honor-card'></div>
        </div>
    )
}

export default AboutHonors
