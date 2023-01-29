import React, { FC } from 'react'

import { CallSvg, LocationSvg, SvgProps } from 'Icons'

import './style/footer.scss'

const Footer = () => {
    return (
        <footer className='footer-container'>
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
