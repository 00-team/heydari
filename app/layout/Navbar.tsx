import React, { FC, useEffect, useState } from 'react'

import { C } from '@00-team/utils'

import {
    BlogsSvg,
    CallSvg,
    ChairSvg,
    CloseSvg,
    CompanySvg,
    HomeSvg,
    MenuSvg,
} from 'Icons'
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
    const [navActive, setnavActive] = useState(false)

    return (
        <nav className='small-nav-container'>
            <MenuSvg
                className='menu-icon'
                size={40}
                onTouchStart={() => setnavActive(true)}
            />
            <img
                className='nav-logo'
                src={navLogo}
                decoding={'async'}
                loading={'lazy'}
                alt=''
            />
            <div className={`nav-wrapper ${C(navActive)}`}>
                <div
                    className='close-btn icon'
                    onTouchStart={() => setnavActive(false)}
                >
                    <CloseSvg size={50} />
                </div>

                <img
                    className='nav-logo'
                    style={{ width: 80 }}
                    src={navLogo}
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />

                <section className='columns-wrapper'>
                    <SmallNavColumn Icon={HomeSvg} link={'/'} title={'خانه'} />
                    <SmallNavColumn
                        Icon={ChairSvg}
                        link={'/products'}
                        title={'محصولات'}
                    />
                    <SmallNavColumn
                        Icon={CallSvg}
                        link={'/contact'}
                        title={'ارتباط با ما'}
                    />
                    <SmallNavColumn
                        Icon={CompanySvg}
                        link={'/about'}
                        title={'درباره ما'}
                    />
                    <SmallNavColumn
                        Icon={BlogsSvg}
                        link={'/blog'}
                        title={'مقالات'}
                    />
                </section>

                {/* debug */}
                <div></div>
                {/* debug */}
            </div>
        </nav>
    )
}

interface SmallNavColumn {
    link: string
    title: string
    Icon: Icon
}

const SmallNavColumn: FC<SmallNavColumn> = ({ Icon, link, title }) => {
    return (
        <Link to={link} className='nav-column title'>
            <Icon size={30} />
            <div className='holder'>{title}</div>
        </Link>
    )
}
