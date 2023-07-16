import React, { FC } from 'react'

import { SvgProps } from 'Icons'

export const CloseSvg: FC<SvgProps> = ({ size, ...attr }) => {
    return (
        <svg
            stroke='currentColor'
            fill='currentColor'
            stroke-width='0'
            viewBox='0 0 512 512'
            height={size}
            width={size}
            xmlns='http://www.w3.org/2000/svg'
            {...attr}
        >
            <path d='M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z'></path>
        </svg>
    )
}
