import React, { FC, useEffect, useState } from 'react'

import { C } from '@00-team/utils'

import { CallSvg, ChairSvg, CompanySvg, HomeSvg } from 'Icons'
import { Link } from 'react-router-dom'

import './style/navbar.scss'

const navLogo = require('../static/welcome-logo.png')

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
    const [navActive, setnavActive] = useState(false)

    useEffect(() => {
        window.onscroll = () => {
            if (scrollY >= 10) setnavActive(true)
            else setnavActive(false)
        }
    }, [])

    return (
        <nav className={`big-nav-container ${C(navActive)}`}>
            <div className='big-nav-wrapper'>
                <div className='nav-content'>
                    <Link to={'/'} className='nav-link title_small'>
                        <div className='icon'>
                            <HomeSvg size={25} />
                        </div>
                        <div className='holder'>خانه</div>
                    </Link>
                    <Link to={'/'} className='nav-link title_small'>
                        <div className='icon'>
                            <ChairSvg size={25} />
                        </div>
                        <div className='holder'>محصولات</div>
                    </Link>
                    <Link to={'/contact'} className='nav-link title_small'>
                        <div className='icon'>
                            <CallSvg size={25} />
                        </div>
                        <div className='holder'>ارتباط با ما</div>
                    </Link>
                    <Link to={'/'} className='nav-link title_small'>
                        <div className='icon'>
                            <CompanySvg size={25} />
                        </div>
                        <div className='holder'>درباره ما</div>
                    </Link>
                </div>
                <img
                    className='nav-logo'
                    decoding={'async'}
                    loading={'lazy'}
                    src={navLogo}
                />
            </div>
        </nav>
    )
}

const SmallNav: FC = () => {
    return <nav className='small-nav-container'></nav>
}
