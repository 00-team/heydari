import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import './style/aboutProjects.scss'

export const AboutProjects: FC = () => {
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
        <section ref={container} className='about-page-projects'>
            <h2 className={`project-title title_hero ${C(Isintersected)}`}>
                <span>پروژه های ما</span>
            </h2>
            <div className='projects-wrapper'>
                <div className='project prev'>
                    <img
                        src={'https://picsum.photos/1920/1080'}
                        decoding={'async'}
                        loading='lazy'
                        alt=''
                    />
                </div>
                <div className='project active'>
                    <img
                        src={'https://picsum.photos/1920/1080'}
                        decoding={'async'}
                        loading='lazy'
                        alt=''
                    />
                </div>
                <div className='project next'>
                    <img
                        src={'https://picsum.photos/1920/1080'}
                        decoding={'async'}
                        loading='lazy'
                        alt=''
                    />
                </div>
            </div>
        </section>
    )
}
