import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

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
        <section ref={container} className='about-projects'>
            <h2 className={`project-title title_hero ${C(Isintersected)}`}>
                <span>پروژه های ما</span>
            </h2>
            <div className='projects-wrapper'></div>
        </section>
    )
}
