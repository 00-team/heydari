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
        }, 3000)

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
            <div className='honors-wrapper'></div>
            {isIntersecting && (
                <Confetti
                    recycle={!ConfettiEnd}
                    numberOfPieces={innerWidth <= 1024 ? 100 : 200}
                    gravity={innerWidth <= 1024 ? 0.3 : 0.1}
                />
            )}
        </section>
    )
}

export default Honors
