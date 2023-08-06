import React, { FC } from 'react'

import {
    CallSvg,
    FaxSvg,
    InstagramSvg,
    LocationSvg,
    Logo,
    TelegramSvg,
    WhatsappSvg,
} from 'Icons'
import { Link } from 'react-router-dom'

import './style/footer.scss'

const rubika = '/static/image/footer/rubika.webp'

export const Footer = () => {
    return (
        <footer className='footer-container'>
            <div className='footer-wrapper'>
                <div className='footer-header'>
                    <FooterHeaderRow
                        Svg={LocationSvg}
                        data='تهران ، صالح آباد شرقی ، نبش میدان شهید خالقی پ ۲'
                        holder='آدرس'
                        className='address'
                    />
                    <FooterHeaderRow
                        Svg={CallSvg}
                        data='+98-9129429430'
                        holder='شماره تماس'
                        link='tel:9129429430'
                    />
                    <FooterHeaderRow
                        Svg={FaxSvg}
                        data='02155009865'
                        holder='شماره فکس'
                    />
                </div>
                <div className='footer-content-wrapper'>
                    <div className='footer-content'>
                        <div className='content-socials'>
                            <a
                                href={'https://t.me/heydaricoir'}
                                className='social icon telegram'
                            >
                                <TelegramSvg size={40} />
                            </a>
                            <a
                                href={'https://wa.me/+989129429430'}
                                className='social icon whatsapp'
                            >
                                <WhatsappSvg size={40} />
                            </a>
                            <a
                                href={'instagram://user?username=heydari.chair'}
                                className='social icon instagram'
                            >
                                <InstagramSvg size={40} />
                            </a>
                            <button className='social rubika title_small'>
                                <div className='tooltip'>+989129429430</div>
                                <img
                                    loading={'lazy'}
                                    decoding={'async'}
                                    src={rubika}
                                    width={60}
                                    height={60}
                                    alt={'ارتباط با حیدری'}
                                />
                            </button>
                        </div>
                        <div className='content-row-wrapper'>
                            <div className='row-wrapper'>
                                <h2 className='row-header title'>صفحه اصلی</h2>
                                <Link
                                    to={'/about'}
                                    className='row-option title_smaller'
                                >
                                    درباره ما
                                </Link>
                                <Link
                                    to={'/#honors'}
                                    className='row-option title_smaller'
                                >
                                    افتخارات ما
                                </Link>
                                <Link
                                    to={'/#products'}
                                    className='row-option title_smaller'
                                >
                                    برترین محصولات
                                </Link>
                            </div>
                            <div className='row-wrapper'>
                                <h2 className='row-header title'>محصولات</h2>
                                <Link
                                    to={'/#products'}
                                    className='row-option title_smaller'
                                >
                                    برترین محصولات
                                </Link>
                                <Link
                                    to={'/products'}
                                    className='row-option title_smaller'
                                >
                                    همه محصولات
                                </Link>
                            </div>
                            <div className='row-wrapper'>
                                <h2 className='row-header title'>
                                    ارتباط با شرکت
                                </h2>
                                <Link
                                    to={'/contact'}
                                    className='row-option title_smaller'
                                >
                                    ارتباط با ما
                                </Link>
                                <Link
                                    to={'/contact'}
                                    className='row-option title_smaller'
                                >
                                    تلفن مستقیم
                                </Link>
                                <Link
                                    to={'/contact'}
                                    className='row-option title_smaller'
                                >
                                    فکس
                                </Link>
                                <Link
                                    to={'/contact'}
                                    className='row-option title_smaller'
                                >
                                    آدرس شرکت
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className='footer-logo title_small'>
                        <div className='logo-img'>
                            <Logo />
                        </div>
                        <div className='logo-name'>صنایع تولیدی حیدری</div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

interface FooterHeaderRow {
    Svg: Icon
    holder: string
    data: string
    className?: string
    link?: string
}

const FooterHeaderRow: FC<FooterHeaderRow> = ({
    Svg,
    data,
    holder,
    className,
    link,
}) => {
    return (
        <>
            {link ? (
                <a
                    href={link}
                    className={`footer-header-row title_small ${
                        className && className
                    }`}
                >
                    <div className='header-icon icon'>
                        <div className='icon-wrapper'>
                            <Svg size={25} />
                        </div>
                    </div>
                    <div className='header-wrapper '>
                        <div className='holder title_smaller'>{holder} </div>
                        <div className='data '>{data}</div>
                    </div>
                </a>
            ) : (
                <div
                    className={`footer-header-row title_small ${
                        className && className
                    }`}
                >
                    <div className='header-icon icon'>
                        <div className='icon-wrapper'>
                            <Svg size={25} />
                        </div>
                    </div>
                    <div className='header-wrapper '>
                        <div className='holder title_smaller'>{holder} </div>
                        <div className='data '>{data}</div>
                    </div>
                </div>
            )}
        </>
    )
}
