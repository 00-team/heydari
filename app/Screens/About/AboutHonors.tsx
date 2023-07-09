import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import './style/aboutHonors.scss'

const DEBUG_HONOR1 = require('../../static/home/honors/honor1.png')
const DEBUG_HONOR2 = require('../../static/home/honors/honor2.png')
const DEBUG_HONOR3 = require('../../static/home/honors/honor3.png')
const DEBUG_HONOR4 = require('../../static/home/honors/honor4.png')
const DEBUG_HONOR5 = require('../../static/home/honors/honor5.png')

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
            <div className='honor-card'>
                <img
                    src={DEBUG_HONOR1}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />
            </div>
            <div className='honor-card'>
                <img
                    src={DEBUG_HONOR2}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />
            </div>
            <div className='honor-card'>
                <img
                    src={DEBUG_HONOR3}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />
            </div>
            <div className='honor-card'>
                <img
                    src={DEBUG_HONOR4}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />
            </div>
            <div className='honor-card'>
                <img
                    src={DEBUG_HONOR5}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />
            </div>
        </div>
    )
}

export default AboutHonors
