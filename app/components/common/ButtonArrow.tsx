import React, { ReactNode } from 'react'

import { ArrowSvg } from 'Icons'
import { Link } from 'react-router-dom'

import './style/buttonarrow.scss'

interface ButtonProps {
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
}: ButtonProps) => {
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

export default ButtonArrow
