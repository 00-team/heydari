import React, { FC, useEffect } from 'react'
import { renderToString } from 'react-dom/server'

import { ContactForm } from 'components'

import './style/contact.scss'

const Contact: FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <main className='contact-container'>
            <img
                className='contact-img'
                src='/static/image/contact.webp'
                decoding={'async'}
                loading={'lazy'}
                alt='ارتباط با صنایع تولیدی حیدری'
            />
            <ContactForm />
        </main>
    )
}

console.log(renderToString(<Contact />))

export default Contact
