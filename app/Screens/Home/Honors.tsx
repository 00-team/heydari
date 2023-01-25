import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import Confetti from 'react-confetti'

import './style/honors.scss'

const HONOR_IMG = require('../../static/honor.png')

const DEBUG_HONORS = [
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
    {
        title: 'اسم جام',
        description: 'تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری Hofex2006',
        img: HONOR_IMG,
    },
]

const Honors: FC = () => {
    const LazyRef = useRef<HTMLDivElement>(null)
    const [isIntersecting, setisIntersecting] = useState(false)
    const [ConfettiEnd, setConfettiEnd] = useState(false)
    

    useEffect(() => {
        if (LazyRef.current && !isIntersecting) {
            var observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry && entry.isIntersecting) {
                        setisIntersecting(true)
                        observer.disconnect()
                    }
                },
                {
                    threshold: 0.4,
                }
            )

            observer.observe(LazyRef.current)
        }
        return () => {
            if (observer) observer.disconnect()
        }
    }, [LazyRef])

    useEffect(() => {
        if (!isIntersecting) return

        const timeout = setTimeout(() => {
            setConfettiEnd(() => true)
        }, 2000)

        return () => clearTimeout(timeout)
    }, [isIntersecting])

    return (
        <section
            ref={LazyRef}
            className={`honors-container ${C(isIntersecting)}`}
        >
            <h2 className={`section_title honor-header ${C(isIntersecting)}`}>
                <span>افتخارات ما</span>
            </h2>
            {isIntersecting && (
                <Confetti
                    colors={['gold', 'white']}
                    recycle={!ConfettiEnd}
                    numberOfPieces={innerWidth <= 1024 ? 100 : 200}
                    gravity={innerWidth <= 1024 ? 0.3 : 0.1}
                    style={{ zIndex: 5,position:"fixed" }}
                />
            )}
            <HonorsWrapper isIntersecting={isIntersecting} />
        </section>
    )
}

interface HonorsWrapperProps {
    isIntersecting: boolean
}
const HonorsWrapper: FC<HonorsWrapperProps> = ({ isIntersecting }) => {
    const [HonorActive, setHonorActive] = useState(1)
    useEffect(() => {
        if (!isIntersecting) return

        const inverval = setInterval(() => {
            setHonorActive(value => {
                if (value + 2 > DEBUG_HONORS.length) {
                    return 1
                }
                return value + 1
            })
        }, 4000)

        return () => clearInterval(inverval)
    }, [isIntersecting])
    return (
        <div className={`honors-wrapper ${C(isIntersecting)}`}>
            {DEBUG_HONORS.map(({ title, description, img }, idx0) => {
                const returnClass = (): string => {
                    if (HonorActive === idx0) return 'active'
                    if (HonorActive - 1 === idx0) return 'prev'
                    if (HonorActive + 1 === idx0) return 'next'
                    if (HonorActive === DEBUG_HONORS.length - 1 && idx0 === 0)
                        return 'next'
                    return ''
                }
                return (
                    <div
                        className={`honor-container  ${returnClass()} `}
                        key={idx0}
                    >
                        <div className='honor-cup'>
                            <div className='cup-glass'></div>
                            <img src={img} alt='' className='cup-img' />
                        </div>
                        <div className='honor-content'>
                            <div className='honor-name title'>
                                <span>{title} </span>
                            </div>
                            <div className='honor-description description'>
                                <span>{description}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Honors
