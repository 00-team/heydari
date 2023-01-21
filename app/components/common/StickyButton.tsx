import React, { FC, HTMLAttributes, ReactNode } from 'react'

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
