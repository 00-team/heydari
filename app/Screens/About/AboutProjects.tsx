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
                <span>پروژه ها</span>
            </h2>
            <ProjectsSlider Isintersected={Isintersected} />
        </section>
    )
}

const DEBUG_SLIDES = [
    'https://picsum.photos/1920/1079',
    'https://picsum.photos/1920/1081',
    'https://picsum.photos/1920/1083',
    'https://picsum.photos/1920/1078',
    'https://picsum.photos/1920/1085',
    'https://picsum.photos/1920/1084',
]

interface ProjectsSliderProps {
    Isintersected: boolean
}

const ProjectsSlider: FC<ProjectsSliderProps> = ({ Isintersected }) => {
    return (
        <div className={`projects-wrapper ${C(Isintersected)}`}>
            {DEBUG_SLIDES.map((img, index) => {
                return (
                    <div className='project' key={index}>
                        <img
                            src={img}
                            decoding={'async'}
                            loading='lazy'
                            draggable={false}
                            alt=''
                        />
                    </div>
                )
            })}
        </div>
    )
}
