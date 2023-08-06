import React, { FC, useEffect, useState } from 'react'

import { C } from '@00-team/utils'

import {
    BlogsSvg,
    CallSvg,
    ChairSvg,
    CloseSvg, // CloseSvg,
    CompanySvg,
    HomeSvg,
    Logo,
    MenuSvg,
} from 'Icons'

// import { Link } from 'react-router-dom'
import './style/navbar.scss'

export const Navbar: FC = () => {
    const [scrolled, setScrolled] = useState(false)
    const [showSmall, setShowSmall] = useState(false)
    const [openSmall, setOpenSmall] = useState(false)

    useEffect(() => {
        window.onscroll = () => setScrolled(scrollY > 10)
        window.onresize = () => setShowSmall(innerWidth < 1024)
    }, [])

    return (
        <nav
            className={
                'nav-container' +
                C(openSmall, 'opensmall') +
                C(scrolled, 'scrolled') +
                (showSmall ? ' small ' : ' big ')
            }
        >
            <div className='nav-wrapper'>
                <MenuSvg
                    className='small-open'
                    size={40}
                    onClick={() => setOpenSmall(true)}
                />
                <div className='just-for-small'>
                    <CloseSvg
                        size={50}
                        onClick={() => setOpenSmall(false)}
                        className='small-close'
                    />
                    <div className='nav-content'>
                        <a href='/' className='nav-link title_small'>
                            <div className='icon'>
                                <HomeSvg size={25} />
                            </div>
                            <div className='holder'>خانه</div>
                        </a>
                        <a href={'/products'} className='nav-link title_small'>
                            <div className='icon'>
                                <ChairSvg size={25} />
                            </div>
                            <div className='holder'>محصولات</div>
                        </a>
                        <a href={'/contact'} className='nav-link title_small'>
                            <div className='icon'>
                                <CallSvg size={25} />
                            </div>
                            <div className='holder'>ارتباط با ما</div>
                        </a>
                        <a href={'/about'} className='nav-link title_small'>
                            <div className='icon'>
                                <CompanySvg size={25} />
                            </div>
                            <div className='holder'>درباره ما</div>
                        </a>
                        <a href={'/blogs'} className='nav-link title_small'>
                            <div className='icon'>
                                <BlogsSvg size={25} />
                            </div>
                            <div className='holder'>مقالات </div>
                        </a>
                    </div>
                </div>
                <Logo className='nav-logo' />
            </div>
        </nav>
    )
}

/* const SmallNav: FC = () => {
    const [navActive, setnavActive] = useState(false)

    return (
        <nav className='small-nav-container'>
            <MenuSvg
                className='menu-icon'
                size={40}
                onClick={() => setnavActive(true)}
            />
            <Logo className='nav-logo' />
            <div className={`nav-wrapper ${C(navActive)}`}>
                <div
                    className='close-btn icon'
                    onClick={() => setnavActive(false)}
                >
                    <CloseSvg size={50} />
                </div>

                <Logo className='nav-logo' />

                <section className='columns-wrapper'>
                    <SmallNavColumn
                        setnavActive={setnavActive}
                        Icon={HomeSvg}
                        link={'/'}
                        title={'خانه'}
                    />
                    <SmallNavColumn
                        setnavActive={setnavActive}
                        Icon={ChairSvg}
                        link={'/products'}
                        title={'محصولات'}
                    />
                    <SmallNavColumn
                        setnavActive={setnavActive}
                        Icon={CallSvg}
                        link={'/contact'}
                        title={'ارتباط با ما'}
                    />
                    <SmallNavColumn
                        setnavActive={setnavActive}
                        Icon={CompanySvg}
                        link={'/about'}
                        title={'درباره ما'}
                    />
                    <SmallNavColumn
                        setnavActive={setnavActive}
                        Icon={BlogsSvg}
                        link={'/blog'}
                        title={'مقالات'}
                    />
                </section>

                <div></div>
            </div>
        </nav>
    )
}

interface SmallNavColumn {
    link: string
    title: string
    Icon: Icon

    setnavActive: (active: boolean) => void
}

const SmallNavColumn: FC<SmallNavColumn> = ({
    Icon,
    link,
    title,
    setnavActive,
}) => {
    return (
        <Link
            to={link}
            className='nav-column title'
            onClick={() => setnavActive(false)}
        >
            <Icon size={30} />
            <div className='holder'>{title}</div>
        </Link>
    )
} */
