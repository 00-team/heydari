import React, { FC } from 'react'

import {
    CallSvg,
    InstagramSvg,
    LocationSvg,
    SvgProps,
    TelegramSvg,
    WhatsappSvg,
} from 'Icons'

import './style/footer.scss'

const logo = require('../static/logo.png')

const Footer = () => {
    return (
        <footer className='footer-container'>
            <div className='footer-wrapper'>
                <div className='footer-header'>
                    <FooterHeaderRow
                        Svg={LocationSvg}
                        data='یوسف اباد، پلاک 21، زنگ 5'
                        holder='آدرس'
                    />
                    <FooterHeaderRow
                        Svg={CallSvg}
                        data='09120974957'
                        holder='شماره تماس'
                    />
                    <FooterHeaderRow
                        Svg={CallSvg}
                        data='09120974957'
                        holder='شماره تماس'
                    />
                </div>
                <div className='footer-content-wrapper'>
                    <div className='footer-content'>
                        <div className='content-socials'>
                            <div className='social icon telegram'>
                                <TelegramSvg size={40} />
                            </div>
                            <div className='social icon whatsapp'>
                                <WhatsappSvg size={40} />
                            </div>
                            <div className='social icon instagram'>
                                <InstagramSvg size={40} />
                            </div>
                        </div>
                        <div className='content-row-wrapper'>
                            <div className='row-wrapper'>
                                <div className='row-header title'></div>
                                <div className='row-option title_smaller'></div>
                            </div>
                        </div>
                    </div>
                    <div className='footer-logo title_small'>
                        <img className='logo-img' src={logo} />
                        <div className='logo-name'>صنایع تولیدی حیدری</div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

interface FooterHeaderRow {
    Svg: React.FC<SvgProps>
    holder: string
    data: string
}

const FooterHeaderRow: FC<FooterHeaderRow> = ({ Svg, data, holder }) => {
    return (
        <div className='footer-header-row title_small'>
            <div className='header-icon icon'>
                <div className='icon-wrapper'>
                    <Svg size={35} />
                </div>
            </div>
            <div className='header-wrapper '>
                <div className='holder title_smaller'>{holder} </div>
                <div className='data '>{data}</div>
            </div>
        </div>
    )
}

export default Footer
