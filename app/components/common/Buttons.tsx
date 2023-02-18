import React, { FC, HTMLAttributes, ReactNode } from 'react'

import { ArrowSvg } from 'Icons'
import { Link } from 'react-router-dom'

import './style/buttons.scss'

interface ArrowButtonProps {
    children?: ReactNode
    onClick?: (e: React.MouseEvent) => void
    classname?: string
    backgroundColor?: string
    color?: string
    borderRadius?: number
    border?: boolean
    borderColor?: string
    link?: string
}

export const ButtonArrow = ({
    children,
    onClick,
    classname,
    borderColor,
    link,
}: ArrowButtonProps) => {
    return (
        <>
            {link ? (
                <Link
                    to={link}
                    className={`arrow-button basic-button ${classname}`}
                    onClick={e => (onClick ? onClick(e) : {})}
                    style={borderColor ? { borderColor: borderColor } : {}}
                >
                    <div className='icon-arrow before'>
                        <ArrowSvg size={25} />
                    </div>
                    <div className='label'>{children}</div>
                    <div className='icon-arrow after'>
                        <ArrowSvg size={25} />
                    </div>
                </Link>
            ) : (
                <button
                    className={`arrow-button basic-button ${classname}`}
                    onClick={e => (onClick ? onClick(e) : {})}
                    style={borderColor ? { borderColor: borderColor } : {}}
                >
                    <div className='icon-arrow before'>
                        <ArrowSvg size={25} />
                    </div>
                    <div className='label'>{children}</div>
                    <div className='icon-arrow after'>
                        <ArrowSvg size={25} />
                    </div>
                </button>
            )}
        </>
    )
}

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    children: ReactNode
}

const StickyButton: FC<ButtonProps> = props => {
    const { onMouseLeave, onMouseMove, children, ...attrs } = props
    return (
        <button
            {...attrs}
            onMouseMove={e => {
                const el = e.currentTarget
                const pos = el.getBoundingClientRect()
                const mx = e.clientX - pos.left - pos.width / 2
                const my = e.clientY - pos.top - pos.height / 2

                el.style.transform = `
                    translate(${mx * 0.15}px ,${my * 0.3}px)
                    rotate3d(${mx * -0.1}, ${my * -0.3}, 0, 12deg)
                `

                onMouseMove && onMouseMove(e)
            }}
            onMouseLeave={e => {
                const el = e.currentTarget
                el.addEventListener('mouseleave', () => {
                    el.style.transform = ''
                })

                onMouseLeave && onMouseLeave(e)
            }}
        >
            {children}
        </button>
    )
}

export { StickyButton }

export default ButtonArrow
