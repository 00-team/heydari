import React, { FC, useEffect, useState } from 'react'

import './style/navbar.scss'

export const Navbar: FC = () => {
    const [Inner, setInner] = useState(innerWidth)

    useEffect(() => {
        window.onresize = () => {
            setInner(innerWidth)
        }
    }, [])

    return <>{Inner >= 1024 ? <BigNav /> : <SmallNav />}</>
}

const BigNav: FC = () => {
    return <nav className='big-nav-container'></nav>
}

const SmallNav: FC = () => {
    return <nav className='small-nav-container'></nav>
}
