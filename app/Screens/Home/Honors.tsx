import React, { useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import Confetti from 'react-confetti'

import './style/honors.scss'

const Honors = () => {
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
                />
            )}
            <div className='honors-wrapper'>
                <div className={`honor-container ${C(isIntersecting)}`}>
                    <div className='honor-cup'>
                        <div className='cup-glass'></div>
                        <img src='' alt='' className='cup-img' />
                    </div>
                    <div className='honor-content'>
                        <div className='honor-name title'>
                            <span>تندیس بلورین برند برتر</span>
                        </div>
                        <div className='honor-description description'>
                            <span>
                                تولیدکنندگان و صادرکنندگان مبلمان منزل و اداری
                                Hofex2006
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Honors
