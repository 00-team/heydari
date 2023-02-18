import React, { FC } from 'react'

import './style/welcome.scss'

const logo = require('../../static/welcome-logo.png')

const Welcomer: FC = () => {
    return (
        <div className='welcomer title'>
            <div className='welcomer-wrapper'>
                <img
                    src={logo}
                    className='welcomer-logo'
                    decoding={'async'}
                    loading={'lazy'}
                    alt=''
                />
                <span>
                    <div className='welcomer-motto ltr'>
                        {'NOT THE FIRST, BUT THE BEST'
                            .split(' ')
                            .map((word, index) => {
                                return (
                                    <span
                                        style={{
                                            animationDelay: `${index * 150}ms`,
                                        }}
                                        className='word'
                                        key={index}
                                    >
                                        {word}
                                    </span>
                                )
                            })}
                    </div>
                </span>
                <span>
                    <div className='welcomer-motto title_hero'>
                        {'اولین نیستیم ولی تلاش میکنیم بهترین باشیم'
                            .split(' ')
                            .map((word, index) => {
                                return (
                                    <span
                                        style={{
                                            animationDelay: `${index * 150}ms`,
                                        }}
                                        className='word'
                                        key={index}
                                    >
                                        {word}
                                    </span>
                                )
                            })}
                    </div>
                </span>
                <span>
                    <div className='company-name title'>
                        <span>
                            صنایع تولیدی{' '}
                            <span className='logo-text'>حیدری</span> تقدیم میکند
                        </span>
                    </div>
                </span>
            </div>
        </div>
    )
}

export default Welcomer
