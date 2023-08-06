import React, { FC, useEffect, useRef, useState } from 'react'

import { C } from '@00-team/utils'

import './style/aboutProjects.scss'

const projects1 = '/static/image/about/projects1.webp'
const projects2 = '/static/image/about/projects2.webp'
const projects3 = '/static/image/about/projects3.webp'
const projects4 = '/static/image/about/projects4.webp'
const projects5 = '/static/image/about/projects5.webp'
const projects6 = '/static/image/about/projects6.webp'

const SLIDES = [
    projects1,
    projects2,
    projects3,
    projects4,
    projects5,
    projects6,
]

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

interface ProjectsSliderProps {
    Isintersected: boolean
}

const ProjectsSlider: FC<ProjectsSliderProps> = ({ Isintersected }) => {
    return (
        <div className={`projects-wrapper ${C(Isintersected)}`}>
            {SLIDES.map((img, index) => {
                return (
                    <div className='project' key={index}>
                        <img
                            src={img}
                            decoding={'async'}
                            loading='lazy'
                            draggable={false}
                            alt={'پروژه های صنایع تولیدی حیدری'}
                        />
                    </div>
                )
            })}
        </div>
    )
}
