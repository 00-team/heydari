import React, { FC, useEffect, useState } from 'react'

import { C } from '@00-team/utils'

import { BlogsSvg, CallSvg, ChairSvg, CompanySvg, HomeSvg } from 'Icons'
import { MenuSvg } from 'Icons/navbar/Menu'
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
                    <Link to={'/products'} className='nav-link title_small'>
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
                    <Link to={'/about'} className='nav-link title_small'>
                        <div className='icon'>
                            <CompanySvg size={25} />
                        </div>
                        <div className='holder'>درباره ما</div>
                    </Link>
                    <Link to={'/blogs'} className='nav-link title_small'>
                        <div className='icon'>
                            <BlogsSvg size={25} />
                        </div>
                        <div className='holder'>مقالات </div>
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
    return (
        <nav className='small-nav-container'>
            <MenuSvg className='menu-icon' size={40} />
            <img
                className='nav-logo'
                src={navLogo}
                decoding={'async'}
                loading={'lazy'}
                alt=''
            />
            <div className='nav-wrapper'>
                <img
                    className='nav-logo'
                    src={navLogo}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />

                <section className='columns-wrapper'>
                    <div className='nav-column title_small'>
                        <HomeSvg size={30} />
                        <div className='holder'>خانه</div>
                    </div>
                    <div className='nav-column title_small'>
                        <ChairSvg size={30} />
                        <div className='holder'>محصولات</div>
                    </div>
                    <div className='nav-column title_small'>
                        <CallSvg size={30} />
                        <div className='holder'>ارتباط با ما</div>
                    </div>
                    <div className='nav-column title_small'>
                        <CompanySvg size={30} />
                        <div className='holder'> درباره ما </div>
                    </div>
                    <div className='nav-column title_small'>
                        <BlogsSvg size={30} />
                        <div className='holder'> مقالات </div>
                    </div>
                </section>

                {/* debug */}
                <div></div>
                {/* debug */}
            </div>
        </nav>
    )
}
