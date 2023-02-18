import React from 'react'

export const ArrowSvg: Icon = ({ size, ...attr }) => {
    return (
        <svg
            stroke='currentColor'
            fill='none'
            strokeWidth='0'
            viewBox='0 0 24 24'
            height={size}
            width={size}
            xmlns='http://www.w3.org/2000/svg'
            {...attr}
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M17 8l4 4m0 0l-4 4m4-4H3'
            ></path>
        </svg>
    )
}
